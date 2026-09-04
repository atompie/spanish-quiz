import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import {
  buildSessionPool,
  estimateRemainingSeconds,
  getEligibleSentences,
  getSpeakText,
  initUsageState,
  pickNextRound,
  speakAudioPath,
  totalRounds,
  usesConsumed,
} from '../lib/listeningSession'
import type { LanguageCode } from '../types/language'
import type {
  AudioLangCode,
  EligibleSentence,
  ListeningPhase,
  ListeningRound,
  SentenceUsageState,
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
  /** Nie udało się pobrać public/speak/manifest.json (np. brak sieci) — inne niż isEmpty. */
  hasLoadError: boolean
  /** Transkrypcja aktualnie odtwarzanego zdania (z metadata.json), albo `null` gdy brak wpisu. */
  currentText: string | null
  audioRef: RefObject<HTMLAudioElement | null>
  start: () => void
  togglePause: () => void
  stop: () => void
}

export function useListeningSession(
  nativeLanguage: LanguageCode,
  answerWaitSeconds: number,
  sentenceCount: number,
  lesson: string | null,
): UseListeningSessionResult {
  const [phase, setPhase] = useState<ListeningPhase>('idle')
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)
  const [pool, setPool] = useState<EligibleSentence[]>([])
  const [usage, setUsage] = useState<SentenceUsageState[]>([])
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
  const usageRef = useRef<SentenceUsageState[]>(usage)
  const answerWaitSecondsRef = useRef(answerWaitSeconds)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    usageRef.current = usage
  }, [usage])

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
    const next = pickNextRound(usageRef.current)
    if (next === null) {
      setCurrentRound(null)
      setPhase('finished')
      return
    }
    setUsage(next.nextUsage)
    setCurrentRound(next.round)
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
      try {
        const response = await fetch(MANIFEST_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        manifest = (await response.json()) as SpeakSentenceManifestEntry[]
      } catch {
        if (startTokenRef.current !== token) return // stop()/start() fired again before this resolved
        setHasLoadError(true)
        setPhase('idle')
        return
      }

      if (startTokenRef.current !== token) return

      const eligible = getEligibleSentences(manifest, nativeLanguage, lesson)
      if (eligible.length === 0) {
        setIsEmpty(true)
        setPhase('idle')
        return
      }
      setIsEmpty(false)

      const newPool = buildSessionPool(eligible, sentenceCount)
      const newUsage = initUsageState(newPool)
      const first = pickNextRound(newUsage)
      if (first === null) return // unreachable: newPool is non-empty

      setPool(newPool)
      setUsage(first.nextUsage)
      setCurrentRound(first.round)
      setPhase('playing-native')
    })()

    // Napisy są opcjonalne — brak pliku/wpisu nie może zablokować odtwarzania ani zgłosić hasLoadError.
    void (async () => {
      try {
        const response = await fetch(METADATA_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = (await response.json()) as SpeakMetadata
        if (startTokenRef.current === token) setMetadata(data)
      } catch {
        // brak/błąd metadata.json => currentText pozostaje null, nic się nie pokazuje
      }
    })()
  }, [nativeLanguage, sentenceCount, lesson])

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
    setPool([])
    setUsage([])
    setCurrentRound(null)
    setSecondsRemaining(null)
    setMetadata(null)
    setPhase('idle')
  }, [clearTimer])

  const current = usesConsumed(usage)
  const total = totalRounds(pool)
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
    audioRef,
    start,
    togglePause,
    stop,
  }
}
