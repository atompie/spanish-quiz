import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { clearSessionState, loadSessionState, saveSessionState } from '../lib/sessionContinuity'
import { useSessionContinuity } from './useSessionContinuity'
import {
  buildDialogPlan,
  dialogAudioPath,
  findDialogManifestEntry,
  hasRecording,
  pauseFromDuration,
  resolveNativeStepMode,
  waitFromAudioDuration,
  waitFromWordCount,
} from '../lib/dialogSession'
import type { LanguageCode } from '../types/language'
import type { AudioLangCode } from '../types/speak'
import type {
  DialogActiveTurn,
  DialogHistoryEntry,
  DialogManifestEntry,
  DialogMetadata,
  DialogPhase,
  DialogTurn,
  DialogTurnPhase,
  DialogTurnText,
} from '../types/dialog'

const TICK_MS = 200
const MODE_TRANSITION_SECONDS = 5
const MANIFEST_URL = '/dialog/manifest.json'
const METADATA_URL = '/dialog/metadata.json'
const SESSION_STORAGE_KIND = 'dialog'

type ActiveDialogPhase = 'mode-a' | 'mode-transition' | 'mode-b'

function isActiveDialogPhase(phase: DialogPhase): phase is ActiveDialogPhase {
  return phase === 'mode-a' || phase === 'mode-transition' || phase === 'mode-b'
}

/** Minimalny zestaw do wznowienia po zabiciu procesu: `plan`/`history` są deterministyczne (bez
 * losowania, w przeciwieństwie do listeningSession), więc odtwarzamy je na nowo z `dialog` +
 * `planIndex` zamiast przechowywać je w całości. */
interface PersistedDialogState {
  dialog: string
  planIndex: number
}

export interface UseDialogSessionResult {
  phase: DialogPhase
  turnPhase: DialogTurnPhase | null
  /** Faza przerwana pauzą (gdy `phase === 'paused'`), inaczej `null` — pozwala UI pokazać właściwy
   * ekran (np. baner przejścia trybu) także w trakcie pauzy. */
  pausedFromPhase: DialogPhase | null
  isPaused: boolean
  secondsRemaining: number | null
  progress: { current: number; total: number }
  isFinished: boolean
  isEmpty: boolean
  hasLoadError: boolean
  /** Tekst aktualnie wyświetlany (język zsynchronizowany z bieżącą podfazą). */
  currentText: string | null
  /** Zakończone kwestie bieżącego przebiegu (trybu), do wyrenderowania jako dymki historii. */
  history: DialogHistoryEntry[]
  /** Zawężony widok bieżącej kwestii (indeks i właściciel), do wyboru strony/stylu dymka na żywo. */
  currentTurn: DialogActiveTurn | null
  /** Dialog z przerwanej (backgrounding/reload) sesji czekającej na wznowienie, albo `null` gdy brak takiej sesji. */
  resumableDialog: string | null
  /** Wznawia przerwaną sesję zapisaną w `resumableDialog` — ląduje w `paused`, nigdy nie odtwarza dźwięku automatycznie. */
  resumeSession: () => void
  /** Odrzuca przerwaną sesję bez jej wznawiania. */
  discardResumableSession: () => void
  audioRef: RefObject<HTMLAudioElement | null>
  start: () => void
  togglePause: () => void
  stop: () => void
}

export function useDialogSession(
  nativeLanguage: LanguageCode,
  dialog: string | null,
  nativeAudioEnabled: boolean,
): UseDialogSessionResult {
  const [phase, setPhase] = useState<DialogPhase>('idle')
  const [turnPhase, setTurnPhase] = useState<DialogTurnPhase | null>(null)
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)
  const [planIndex, setPlanIndex] = useState(0)
  const [planLength, setPlanLength] = useState(0)
  const [currentTurn, setCurrentTurn] = useState<DialogTurn | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [text, setText] = useState<DialogTurnText[]>([])
  const [history, setHistory] = useState<DialogHistoryEntry[]>([])
  const [resumableDialog, setResumableDialog] = useState<string | null>(
    () => loadSessionState<PersistedDialogState>(SESSION_STORAGE_KIND)?.dialog ?? null,
  )

  const startTokenRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const phaseRef = useRef<DialogPhase>(phase)
  const turnPhaseRef = useRef<DialogTurnPhase | null>(turnPhase)
  const deadlineRef = useRef<number | null>(null)
  const remainingMsAtPauseRef = useRef<number | null>(null)
  const pausedFromRef = useRef<{ phase: DialogPhase; turnPhase: DialogTurnPhase | null } | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const planRef = useRef<DialogTurn[]>([])
  const planIndexRef = useRef(0)
  const textRef = useRef<DialogTurnText[]>([])
  const manifestEntryRef = useRef<DialogManifestEntry | undefined>(undefined)
  const currentTurnRef = useRef<DialogTurn | null>(currentTurn)
  /** Czas tłumaczenia (native-playing/native-wait-fallback) ostatniej kwestii ucznia — potrzebny
   * do wyliczenia pauzy po odpowiedzi, gdy dotrze się do `post-answer-pause`. */
  const lastTranslationSecondsRef = useRef<number>(0)
  /** Trzymane w refie (nie w zależnościach `beginTurn`), żeby przełączenie ustawienia w trakcie
   * sesji nie zmieniało identity `beginTurn`/`start` i nie wywoływało ponownego montowania sesji
   * przez efekt „start on dialog change” w ekranie. */
  const nativeAudioEnabledRef = useRef(nativeAudioEnabled)
  /** `true` gdy bieżąca pauza została wywołana przez ukrycie strony, nie przez świadome działanie
   * ucznia — pozwala automatycznie wznowić po powrocie, gdy proces przetrwał w pamięci. */
  const implicitlyPausedRef = useRef(false)
  /** `true` gdy `pausedFromRef` pochodzi z rehydratacji po przeładowaniu (nie ze zwykłej pauzy) —
   * wtedy wznowienie musi na nowo rozegrać kwestię od początku przez `beginTurn`, a nie próbować
   * przywrócić nieistniejącą pozycję odtwarzania audio. */
  const rehydratedTurnRef = useRef(false)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useEffect(() => {
    turnPhaseRef.current = turnPhase
  }, [turnPhase])
  useEffect(() => {
    currentTurnRef.current = currentTurn
  }, [currentTurn])
  useEffect(() => {
    nativeAudioEnabledRef.current = nativeAudioEnabled
  }, [nativeAudioEnabled])

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startDeadline = useCallback((seconds: number) => {
    deadlineRef.current = Date.now() + seconds * 1000
    setSecondsRemaining(Math.ceil(seconds))
  }, [])

  /** Rozpoczyna kwestię o zadanym indeksie planu bez sprawdzania granicy trybu — używane zarówno
   * przy pierwszym wejściu (gdy granica trybu nie zachodzi), jak i po zakończeniu banera przejścia
   * (gdy granica trybu już została obsłużona i nie może być sprawdzana ponownie). */
  const beginTurn = useCallback((index: number) => {
    const plan = planRef.current
    const turn = plan[index]
    planIndexRef.current = index
    setPlanIndex(index)
    setCurrentTurn(turn)
    setPhase(turn.mode)

    if (turn.speaker === 'native') {
      const element = turn.index + 1
      if (hasRecording(manifestEntryRef.current, 'es', element)) {
        setSecondsRemaining(null)
        setTurnPhase('target-playing')
      } else {
        const esText = textRef.current[turn.index]?.es ?? ''
        startDeadline(waitFromWordCount(esText))
        setTurnPhase('target-wait-fallback')
      }
      return
    }

    const element = turn.index + 1
    const nativeStepMode = resolveNativeStepMode(
      nativeAudioEnabledRef.current,
      manifestEntryRef.current,
      nativeLanguage,
      element,
    )
    if (nativeStepMode === 'play') {
      setSecondsRemaining(null)
      setTurnPhase('native-playing')
    } else if (nativeStepMode === 'text-only') {
      // Wyłączone przez przełącznik (nie brakujące nagranie) — jedno oczekiwanie zamiast dwóch:
      // tekst w języku ojczystym liczy się jednocześnie jako czas tłumaczenia, więc od razu
      // ustawiamy `countdown` (bez pośredniego `native-wait-fallback`).
      const nativeText = textRef.current[turn.index]?.[nativeLanguage] ?? ''
      const seconds = waitFromWordCount(nativeText)
      lastTranslationSecondsRef.current = seconds
      startDeadline(seconds)
      setTurnPhase('countdown')
    } else {
      const nativeText = textRef.current[turn.index]?.[nativeLanguage] ?? ''
      startDeadline(waitFromWordCount(nativeText))
      setTurnPhase('native-wait-fallback')
    }
  }, [nativeLanguage, startDeadline])

  /** Dopisuje zakończoną kwestię (jej tekst hiszpański) do historii czatu bieżącego przebiegu. */
  const completeTurn = useCallback((turn: DialogTurn) => {
    const es = textRef.current[turn.index]?.es ?? ''
    setHistory((prev) => [...prev, { index: turn.index, text: es }])
  }, [])

  /** Rozpoczyna kwestię o zadanym indeksie planu, wstawiając baner przejścia trybu, gdy poprzednia
   * kwestia (jeśli istnieje) należała do innego trybu — w przeciwnym razie dopisuje poprzednią
   * kwestię do historii czatu i deleguje do `beginTurn`. */
  const enterPlanIndex = useCallback((index: number) => {
    const plan = planRef.current
    const previousTurn = index > 0 ? plan[index - 1] : null

    if (index >= plan.length) {
      if (previousTurn) completeTurn(previousTurn)
      clearSessionState(SESSION_STORAGE_KIND)
      setCurrentTurn(null)
      setTurnPhase(null)
      setPhase('finished')
      return
    }

    const turn = plan[index]

    if (previousTurn && previousTurn.mode !== turn.mode) {
      setHistory([])
      planIndexRef.current = index
      setPlanIndex(index)
      setCurrentTurn(turn)
      startDeadline(MODE_TRANSITION_SECONDS)
      setPhase('mode-transition')
      setTurnPhase(null)
      return
    }

    if (previousTurn) completeTurn(previousTurn)

    beginTurn(index)
  }, [beginTurn, completeTurn, startDeadline])

  const advance = useCallback(() => {
    enterPlanIndex(planIndexRef.current + 1)
  }, [enterPlanIndex])

  /** Po zagraniu/zastąpieniu kwestii hiszpańskiej (kwestia ucznia lub rozmówcy), rozpoczyna pauzę
   * po odpowiedzi zamiast przechodzić od razu do kolejnej kwestii — połowa czasu tłumaczenia dla
   * kwestii ucznia, połowa czasu samej kwestii hiszpańskiej dla kwestii rozmówcy. */
  const enterPostAnswerPause = useCallback(
    (targetAudioDurationSeconds: number | null) => {
      const turn = currentTurnRef.current
      if (!turn) return
      const baseSeconds =
        turn.speaker === 'learner'
          ? lastTranslationSecondsRef.current
          : (targetAudioDurationSeconds ?? waitFromWordCount(textRef.current[turn.index]?.es ?? ''))
      startDeadline(pauseFromDuration(baseSeconds))
      setTurnPhase('post-answer-pause')
    },
    [startDeadline],
  )

  /** Po zagraniu/zastąpieniu kwestii ucznia w danym języku, przechodzi do kolejnego kroku tej
   * samej kwestii (native -> countdown -> target), albo do pauzy po odpowiedzi. */
  const advanceWithinLearnerTurn = useCallback(
    (from: DialogTurnPhase, audioDurationSeconds: number | null) => {
      const turn = currentTurnRef.current
      if (!turn) return
      const element = turn.index + 1

      if (from === 'native-playing' || from === 'native-wait-fallback') {
        const seconds =
          from === 'native-playing' && audioDurationSeconds !== null
            ? waitFromAudioDuration(audioDurationSeconds)
            : waitFromWordCount(textRef.current[turn.index]?.[nativeLanguage] ?? '')
        lastTranslationSecondsRef.current = seconds
        startDeadline(seconds)
        setTurnPhase('countdown')
        return
      }

      if (from === 'countdown') {
        if (hasRecording(manifestEntryRef.current, 'es', element)) {
          setSecondsRemaining(null)
          setTurnPhase('target-playing')
        } else {
          startDeadline(waitFromWordCount(textRef.current[turn.index]?.es ?? ''))
          setTurnPhase('target-wait-fallback')
        }
        return
      }

      enterPostAnswerPause(null)
    },
    [enterPostAnswerPause, nativeLanguage, startDeadline],
  )

  // Odliczanie dla faz opartych na deadline (fallback tekstowy, countdown tłumaczenia, banner trybu).
  useEffect(() => {
    const isWaitPhase =
      phase !== 'paused' &&
      (phase === 'mode-transition' ||
        turnPhase === 'native-wait-fallback' ||
        turnPhase === 'countdown' ||
        turnPhase === 'target-wait-fallback' ||
        turnPhase === 'post-answer-pause')
    if (!isWaitPhase) return

    intervalRef.current = setInterval(() => {
      const deadline = deadlineRef.current
      if (deadline === null) return
      const remainingMs = deadline - Date.now()
      setSecondsRemaining(Math.max(0, Math.ceil(remainingMs / 1000)))

      if (remainingMs <= 0) {
        clearTimer()
        if (phaseRef.current === 'mode-transition') {
          beginTurn(planIndexRef.current)
        } else if (turnPhaseRef.current === 'post-answer-pause') {
          advance()
        } else if (turnPhaseRef.current) {
          advanceWithinLearnerTurn(turnPhaseRef.current, null)
        }
      }
    }, TICK_MS)

    return clearTimer
  }, [phase, turnPhase, clearTimer, advanceWithinLearnerTurn, beginTurn, advance])

  // Odtwarzanie audio dla faz 'native-playing'/'target-playing'.
  useEffect(() => {
    const audio = audioRef.current
    const turn = currentTurn
    if (!audio || !turn || !dialog) return
    if (turnPhase !== 'native-playing' && turnPhase !== 'target-playing') return

    const lang: AudioLangCode = turnPhase === 'native-playing' ? nativeLanguage : 'es'
    const targetSrc = dialogAudioPath(dialog, lang, turn.index + 1)
    if (!audio.src.endsWith(targetSrc)) {
      audio.src = targetSrc
      audio.currentTime = 0
    }
    void audio.play()
  }, [turnPhase, currentTurn, nativeLanguage, dialog])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function handleEnded() {
      const from = turnPhaseRef.current
      if (from === 'target-playing') {
        enterPostAnswerPause(audio?.duration ?? null)
      } else if (from === 'native-playing') {
        advanceWithinLearnerTurn('native-playing', audio?.duration ?? null)
      }
    }

    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [advanceWithinLearnerTurn, enterPostAnswerPause])

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      clearTimer()
      audio?.pause()
    }
  }, [clearTimer])

  const start = useCallback(() => {
    if (!dialog) return
    clearSessionState(SESSION_STORAGE_KIND)
    setResumableDialog(null)
    const token = ++startTokenRef.current
    setHasLoadError(false)

    void (async () => {
      let manifest: DialogManifestEntry[]
      let metadata: DialogMetadata
      try {
        const [manifestResponse, metadataResponse] = await Promise.all([
          fetch(MANIFEST_URL, { cache: 'no-store' }),
          fetch(METADATA_URL, { cache: 'no-store' }),
        ])
        if (!manifestResponse.ok) throw new Error(`HTTP ${manifestResponse.status}`)
        if (!metadataResponse.ok) throw new Error(`HTTP ${metadataResponse.status}`)
        manifest = (await manifestResponse.json()) as DialogManifestEntry[]
        metadata = (await metadataResponse.json()) as DialogMetadata
      } catch {
        if (startTokenRef.current !== token) return
        setHasLoadError(true)
        setPhase('idle')
        return
      }

      if (startTokenRef.current !== token) return

      const dialogText = metadata[dialog]?.text ?? []
      if (dialogText.length === 0) {
        setIsEmpty(true)
        setPhase('idle')
        return
      }
      setIsEmpty(false)

      textRef.current = dialogText
      setText(dialogText)
      manifestEntryRef.current = findDialogManifestEntry(manifest, dialog)

      const plan = buildDialogPlan(dialogText.length)
      planRef.current = plan
      setPlanLength(plan.length)
      enterPlanIndex(0)
    })()
  }, [dialog, enterPlanIndex])

  const togglePause = useCallback(() => {
    if (phase === 'paused') {
      const restore = pausedFromRef.current
      pausedFromRef.current = null
      if (!restore) return

      if (rehydratedTurnRef.current) {
        // Rehydrated after a reload — there is no real audio position or countdown to restore,
        // so re-enter this turn from the top exactly like arriving at it normally would.
        rehydratedTurnRef.current = false
        beginTurn(planIndexRef.current)
        return
      }

      if (restore.turnPhase === 'native-playing' || restore.turnPhase === 'target-playing') {
        // `turnPhase` state is already at this value (pausing never changes it), so setting it
        // again is a same-value no-op and won't re-trigger the audio-playback effect — resume
        // playback explicitly instead of relying on that effect to notice a change.
        void audioRef.current?.play()
        setTurnPhase(restore.turnPhase)
        setPhase(restore.phase)
      } else {
        deadlineRef.current = Date.now() + (remainingMsAtPauseRef.current ?? 0)
        remainingMsAtPauseRef.current = null
        setTurnPhase(restore.turnPhase)
        setPhase(restore.phase)
      }
      return
    }

    if (turnPhase === 'native-playing' || turnPhase === 'target-playing') {
      audioRef.current?.pause()
      pausedFromRef.current = { phase, turnPhase }
      setPhase('paused')
    } else if (
      phase === 'mode-transition' ||
      turnPhase === 'native-wait-fallback' ||
      turnPhase === 'countdown' ||
      turnPhase === 'target-wait-fallback' ||
      turnPhase === 'post-answer-pause'
    ) {
      remainingMsAtPauseRef.current = (deadlineRef.current ?? Date.now()) - Date.now()
      clearTimer()
      pausedFromRef.current = { phase, turnPhase }
      setPhase('paused')
    }
  }, [phase, turnPhase, clearTimer, beginTurn])

  const stop = useCallback(() => {
    startTokenRef.current++
    clearTimer()
    audioRef.current?.pause()
    clearSessionState(SESSION_STORAGE_KIND)
    implicitlyPausedRef.current = false
    rehydratedTurnRef.current = false
    pausedFromRef.current = null
    deadlineRef.current = null
    remainingMsAtPauseRef.current = null
    planRef.current = []
    planIndexRef.current = 0
    textRef.current = []
    manifestEntryRef.current = undefined
    setPlanIndex(0)
    setPlanLength(0)
    setCurrentTurn(null)
    setTurnPhase(null)
    setSecondsRemaining(null)
    setText([])
    setHistory([])
    setPhase('idle')
  }, [clearTimer])

  const resumeSession = useCallback(() => {
    const persisted = loadSessionState<PersistedDialogState>(SESSION_STORAGE_KIND)
    if (!persisted) return
    const token = ++startTokenRef.current
    setHasLoadError(false)

    void (async () => {
      let manifest: DialogManifestEntry[]
      let metadata: DialogMetadata
      try {
        const [manifestResponse, metadataResponse] = await Promise.all([
          fetch(MANIFEST_URL, { cache: 'no-store' }),
          fetch(METADATA_URL, { cache: 'no-store' }),
        ])
        if (!manifestResponse.ok) throw new Error(`HTTP ${manifestResponse.status}`)
        if (!metadataResponse.ok) throw new Error(`HTTP ${metadataResponse.status}`)
        manifest = (await manifestResponse.json()) as DialogManifestEntry[]
        metadata = (await metadataResponse.json()) as DialogMetadata
      } catch {
        if (startTokenRef.current !== token) return
        setHasLoadError(true)
        clearSessionState(SESSION_STORAGE_KIND)
        setResumableDialog(null)
        setPhase('idle')
        return
      }

      if (startTokenRef.current !== token) return

      const dialogText = metadata[persisted.dialog]?.text ?? []
      const plan = buildDialogPlan(dialogText.length)
      const turn = plan[persisted.planIndex]
      if (dialogText.length === 0 || !turn) {
        // Persisted state no longer matches available content (content changed/removed) — fall
        // back to idle instead of presenting a broken session.
        clearSessionState(SESSION_STORAGE_KIND)
        setResumableDialog(null)
        setIsEmpty(dialogText.length === 0)
        setPhase('idle')
        return
      }
      setIsEmpty(false)

      textRef.current = dialogText
      setText(dialogText)
      manifestEntryRef.current = findDialogManifestEntry(manifest, persisted.dialog)
      planRef.current = plan
      setPlanLength(plan.length)

      const modeSegmentStart = turn.mode === 'mode-a' ? 0 : dialogText.length
      const rehydratedHistory = plan
        .slice(modeSegmentStart, persisted.planIndex)
        .map((planTurn) => ({ index: planTurn.index, text: dialogText[planTurn.index]?.es ?? '' }))
      setHistory(rehydratedHistory)

      planIndexRef.current = persisted.planIndex
      setPlanIndex(persisted.planIndex)
      setCurrentTurn(turn)
      currentTurnRef.current = turn

      rehydratedTurnRef.current = true
      pausedFromRef.current = { phase: turn.mode, turnPhase: null }
      setTurnPhase(null)
      setSecondsRemaining(null)
      setPhase('paused')
      setResumableDialog(null)
    })()
  }, [])

  const discardResumableSession = useCallback(() => {
    clearSessionState(SESSION_STORAGE_KIND)
    setResumableDialog(null)
  }, [])

  const handleHide = useCallback(() => {
    if (!isActiveDialogPhase(phaseRef.current)) return
    implicitlyPausedRef.current = true
    togglePause()
    if (dialog) {
      saveSessionState<PersistedDialogState>(SESSION_STORAGE_KIND, {
        dialog,
        planIndex: planIndexRef.current,
      })
    }
  }, [dialog, togglePause])

  const handleShow = useCallback(() => {
    if (!implicitlyPausedRef.current) return
    implicitlyPausedRef.current = false
    togglePause()
  }, [togglePause])

  useSessionContinuity(isActiveDialogPhase(phase), handleHide, handleShow)

  // `turnPhase` state persists unchanged through a pause (only `phase` flips to 'paused'),
  // so it alone is enough to resolve which language's text is currently on screen.
  const currentLang: AudioLangCode | null =
    turnPhase === 'native-playing' || turnPhase === 'native-wait-fallback' || turnPhase === 'countdown'
      ? nativeLanguage
      : turnPhase === 'target-playing' ||
          turnPhase === 'target-wait-fallback' ||
          turnPhase === 'post-answer-pause'
        ? 'es'
        : null
  const currentText =
    currentTurn && currentLang ? (text[currentTurn.index]?.[currentLang] ?? null) : null

  const total = planLength
  const current = Math.min(planIndex + 1, total)

  return {
    phase,
    turnPhase,
    pausedFromPhase: phase === 'paused' ? (pausedFromRef.current?.phase ?? null) : null,
    isPaused: phase === 'paused',
    secondsRemaining,
    progress: { current, total },
    isFinished: phase === 'finished',
    isEmpty,
    hasLoadError,
    currentText,
    history,
    currentTurn: currentTurn ? { index: currentTurn.index, speaker: currentTurn.speaker } : null,
    resumableDialog,
    resumeSession,
    discardResumableSession,
    audioRef,
    start,
    togglePause,
    stop,
  }
}
