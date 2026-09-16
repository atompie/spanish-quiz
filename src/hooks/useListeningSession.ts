import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import {
  buildSessionPlan,
  estimateRemainingSeconds,
  getEligibleItems,
  getLessonTitle,
  getSpeakText,
  speakAudioPath,
} from '../lib/listeningSession'
import type { LanguageCode } from '../types/language'
import type {
  AudioLangCode,
  ListeningPhase,
  ListeningRound,
  SpeakMetadata,
  SpeakSentenceManifestEntry,
} from '../types/speak'

const TICK_MS = 200
const MANIFEST_URL = '/speak/manifest.json'
const METADATA_URL = '/speak/metadata.json'

export interface UseListeningSessionResult {
  phase: ListeningPhase
  /** Faza przerwana pauzą (gdy `phase === 'paused'`), inaczej `null`. Pozwala UI pokazać właściwą etykietę/licznik podczas pauzy. */
  pausedFromPhase: ListeningPhase | null
  isPaused: boolean
  secondsRemaining: number | null
  progress: { current: number; total: number; estimatedRemainingSeconds: number }
  isFinished: boolean
  isEmpty: boolean
  /** Nie udało się pobrać manifest.json lub metadata.json (np. brak sieci) — inne niż isEmpty. */
  hasLoadError: boolean
  /** Transkrypcja aktualnie odtwarzanego zdania (z metadata.json), albo `null` gdy brak wpisu. */
  currentText: string | null
  /** Tytuł aktualnej lekcji (z metadata.json, z fallbackiem na pierwszy klucz `parts`), albo `null` gdy brak lekcji/metadanych. */
  lessonTitle: string | null
  audioRef: RefObject<HTMLAudioElement | null>
  start: () => void
  togglePause: () => void
  stop: () => void
}

export function useListeningSession(
  nativeLanguage: LanguageCode,
  answerWaitSeconds: number,
  lesson: string | null,
): UseListeningSessionResult {
  const [phase, setPhase] = useState<ListeningPhase>('idle')
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)
  const [roundIndex, setRoundIndex] = useState(0)
  const [planLength, setPlanLength] = useState(0)
  const [currentRound, setCurrentRound] = useState<ListeningRound | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [pausedFromPhase, setPausedFromPhase] = useState<ListeningPhase | null>(null)
  const [metadata, setMetadata] = useState<SpeakMetadata | null>(null)

  const startTokenRef = useRef(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const phaseRef = useRef<ListeningPhase>(phase)
  const deadlineRef = useRef<number | null>(null)
  const remainingMsAtPauseRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const planRef = useRef<ListeningRound[]>([])
  const roundIndexRef = useRef(0)
  const answerWaitSecondsRef = useRef(answerWaitSeconds)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    answerWaitSecondsRef.current = answerWaitSeconds
  }, [answerWaitSeconds])

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const advanceToNextRound = useCallback(() => {
    const plan = planRef.current
    const nextIndex = roundIndexRef.current + 1
    if (nextIndex >= plan.length) {
      setCurrentRound(null)
      setPhase('finished')
      return
    }
    roundIndexRef.current = nextIndex
    setRoundIndex(nextIndex)
    setCurrentRound(plan[nextIndex])
    setPhase('playing-native')
  }, [])

  const enterAnswering = useCallback(() => {
    const seconds = answerWaitSecondsRef.current
    deadlineRef.current = Date.now() + seconds * 1000
    setSecondsRemaining(seconds)
    setPhase('answering')
  }, [])

  const enterGap = useCallback(() => {
    const seconds = answerWaitSecondsRef.current
    deadlineRef.current = Date.now() + seconds * 1000
    setSecondsRemaining(seconds)
    setPhase('gap')
  }, [])

  // Countdown for 'answering' / 'gap' — deadline-based (not tick-counted) so pause/resume stays exact
  // and no drift accumulates even if a browser tab throttles background timers.
  useEffect(() => {
    if (phase !== 'answering' && phase !== 'gap') return

    intervalRef.current = setInterval(() => {
      const deadline = deadlineRef.current
      if (deadline === null) return
      const remainingMs = deadline - Date.now()
      setSecondsRemaining(Math.max(0, Math.ceil(remainingMs / 1000)))

      if (remainingMs <= 0) {
        clearTimer()
        if (phaseRef.current === 'answering') {
          setPhase('playing-target')
        } else if (phaseRef.current === 'gap') {
          advanceToNextRound()
        }
      }
    }, TICK_MS)

    return clearTimer
  }, [phase, clearTimer, advanceToNextRound])

  // Drives playback for both audio phases uniformly. Also handles resume-from-pause: when phase
  // changes back to 'playing-native'/'playing-target', the src already matches (guarded below) so
  // this just calls .play() again, which continues from the currentTime the browser preserved.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentRound) return
    if (phase !== 'playing-native' && phase !== 'playing-target') return

    if (!lesson) return
    const lang = phase === 'playing-native' ? nativeLanguage : 'es'
    const targetSrc = speakAudioPath(lesson, currentRound.slug, lang, currentRound.element)
    if (!audio.src.endsWith(targetSrc)) {
      audio.src = targetSrc
      audio.currentTime = 0
    }
    void audio.play()
  }, [phase, currentRound, nativeLanguage, lesson])

  // Single onended listener — reads the *current* phase via ref to avoid stale closures.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function handleEnded() {
      if (phaseRef.current === 'playing-native') {
        enterAnswering()
      } else if (phaseRef.current === 'playing-target') {
        enterGap()
      }
    }

    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [enterAnswering, enterGap])

  // Unmount cleanup: stop the timer and audio so navigating away doesn't leak a running session.
  useEffect(() => {
    const audio = audioRef.current
    return () => {
      clearTimer()
      audio?.pause()
    }
  }, [clearTimer])

  const start = useCallback(() => {
    if (!lesson) return
    const token = ++startTokenRef.current
    setHasLoadError(false)

    void (async () => {
      let manifest: SpeakSentenceManifestEntry[]
      let fetchedMetadata: SpeakMetadata
      try {
        const [manifestResponse, metadataResponse] = await Promise.all([
          fetch(MANIFEST_URL, { cache: 'no-store' }),
          fetch(METADATA_URL, { cache: 'no-store' }),
        ])
        if (!manifestResponse.ok) throw new Error(`HTTP ${manifestResponse.status}`)
        if (!metadataResponse.ok) throw new Error(`HTTP ${metadataResponse.status}`)
        manifest = (await manifestResponse.json()) as SpeakSentenceManifestEntry[]
        fetchedMetadata = (await metadataResponse.json()) as SpeakMetadata
      } catch {
        if (startTokenRef.current !== token) return // stop()/start() fired again before this resolved
        setHasLoadError(true)
        setPhase('idle')
        return
      }

      if (startTokenRef.current !== token) return

      const items = getEligibleItems(manifest, fetchedMetadata, nativeLanguage, lesson)
      if (items.length === 0) {
        setIsEmpty(true)
        setPhase('idle')
        return
      }
      setIsEmpty(false)

      const plan = buildSessionPlan(items)
      planRef.current = plan
      roundIndexRef.current = 0
      setRoundIndex(0)
      setPlanLength(plan.length)
      setMetadata(fetchedMetadata)
      setCurrentRound(plan[0])
      setPhase('playing-native')
    })()
  }, [nativeLanguage, lesson])

  const togglePause = useCallback(() => {
    if (phase === 'paused') {
      const restoreTo = pausedFromPhase
      setPausedFromPhase(null)
      if (restoreTo === 'answering' || restoreTo === 'gap') {
        deadlineRef.current = Date.now() + (remainingMsAtPauseRef.current ?? 0)
        remainingMsAtPauseRef.current = null
        setPhase(restoreTo)
      } else if (restoreTo === 'playing-native' || restoreTo === 'playing-target') {
        setPhase(restoreTo)
      }
      return
    }

    if (phase === 'answering' || phase === 'gap') {
      remainingMsAtPauseRef.current = (deadlineRef.current ?? Date.now()) - Date.now()
      clearTimer()
      setPausedFromPhase(phase)
      setPhase('paused')
    } else if (phase === 'playing-native' || phase === 'playing-target') {
      audioRef.current?.pause()
      setPausedFromPhase(phase)
      setPhase('paused')
    }
  }, [phase, pausedFromPhase, clearTimer])

  const stop = useCallback(() => {
    startTokenRef.current++ // invalidate any in-flight start() fetch
    clearTimer()
    audioRef.current?.pause()
    setPausedFromPhase(null)
    deadlineRef.current = null
    remainingMsAtPauseRef.current = null
    planRef.current = []
    roundIndexRef.current = 0
    setRoundIndex(0)
    setPlanLength(0)
    setCurrentRound(null)
    setSecondsRemaining(null)
    setMetadata(null)
    setPhase('idle')
  }, [clearTimer])

  const total = planLength
  const current = Math.min(roundIndex + 1, total)
  const progress = {
    current,
    total,
    estimatedRemainingSeconds: estimateRemainingSeconds(total - current, answerWaitSeconds),
  }

  const effectivePhase = phase === 'paused' ? pausedFromPhase : phase
  const currentLang: AudioLangCode | null =
    effectivePhase === 'playing-native' || effectivePhase === 'answering'
      ? nativeLanguage
      : effectivePhase === 'playing-target' || effectivePhase === 'gap'
        ? 'es'
        : null
  const currentText =
    currentRound && lesson && currentLang
      ? getSpeakText(metadata, lesson, currentRound.slug, currentLang, currentRound.element)
      : null
  const lessonTitle = lesson ? getLessonTitle(metadata, lesson, nativeLanguage) : null

  return {
    phase,
    pausedFromPhase,
    isPaused: phase === 'paused',
    secondsRemaining,
    progress,
    isFinished: phase === 'finished',
    isEmpty,
    hasLoadError,
    currentText,
    lessonTitle,
    audioRef,
    start,
    togglePause,
    stop,
  }
}
