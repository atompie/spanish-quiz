import { useState } from 'react'
import { useListeningSession } from '../../hooks/useListeningSession'
import { useTranslation } from '../../i18n/LanguageContext'
import type { LanguageCode } from '../../types/language'
import type { ListeningAnswerWaitSeconds, ListeningSentenceCount } from '../../types/quiz'
import { CloseIcon } from '../common/CloseIcon'
import { SpeakerIcon } from '../common/SpeakerIcon'
import { ConfirmModal } from '../quiz/ConfirmModal'

interface ListeningPracticeScreenProps {
  nativeLanguage: LanguageCode
  answerWaitSeconds: ListeningAnswerWaitSeconds
  sentenceCount: ListeningSentenceCount
}

export function ListeningPracticeScreen({ nativeLanguage, answerWaitSeconds, sentenceCount }: ListeningPracticeScreenProps) {
  const { t } = useTranslation()
  const {
    phase,
    pausedFromPhase,
    isPaused,
    secondsRemaining,
    progress,
    isFinished,
    isEmpty,
    hasLoadError,
    audioRef,
    start,
    togglePause,
    stop,
  } = useListeningSession(nativeLanguage, answerWaitSeconds, sentenceCount)

  const [showStopConfirm, setShowStopConfirm] = useState(false)

  const audioElement = <audio ref={audioRef} hidden />

  if (hasLoadError && phase === 'idle') {
    return (
      <>
        {audioElement}
        <div className="empty-state">
          <p>{t.listeningLoadError}</p>
          <button type="button" className="btn btn-secondary" onClick={start}>
            {t.listeningStart}
          </button>
        </div>
      </>
    )
  }

  if (isEmpty && phase === 'idle') {
    return (
      <>
        {audioElement}
        <div className="empty-state">
          <p>{t.listeningEmptyState}</p>
        </div>
      </>
    )
  }

  if (phase === 'idle') {
    return (
      <>
        {audioElement}
        <div className="listening-screen listening-screen--idle">
          <button type="button" className="btn btn-primary" onClick={start}>
            {t.listeningStart}
          </button>
        </div>
      </>
    )
  }

  if (isFinished) {
    return (
      <>
        {audioElement}
        <div className="listening-screen">
          <p className="results-title">{t.listeningFinishedTitle}</p>
          <p className="modal-message">{t.listeningFinishedMessage}</p>
          <button type="button" className="btn btn-primary" onClick={start}>
            {t.listeningStartNew}
          </button>
        </div>
      </>
    )
  }

  const activePhase = isPaused ? pausedFromPhase : phase
  const showCountdown = activePhase === 'answering' || activePhase === 'gap'
  const countdownLabel = activePhase === 'answering' ? t.listeningCountdownLabel : t.listeningRepeatLabel

  return (
    <>
      {audioElement}
      <div className="listening-screen">
        <div className="quiz-topbar">
          <button
            type="button"
            className="btn-icon btn-icon--inverted"
            aria-label={t.listeningStop}
            title={t.listeningStop}
            onClick={() => setShowStopConfirm(true)}
          >
            <CloseIcon />
          </button>
        </div>

        <p className="quiz-progress listening-progress">
          {t.listeningProgressLabel} {progress.current} / {progress.total}
        </p>

        <div className="listening-countdown-area">
          {showCountdown ? (
            <>
              <p className="listening-countdown-label">{countdownLabel}</p>
              <p className="listening-countdown">{secondsRemaining}</p>
            </>
          ) : (
            <div className="listening-audio-icon" aria-hidden="true">
              <SpeakerIcon />
            </div>
          )}
        </div>

        <div className="listening-controls">
          <button type="button" className="btn btn-primary" onClick={togglePause}>
            {isPaused ? t.listeningResume : t.listeningPause}
          </button>
        </div>
      </div>

      {showStopConfirm && (
        <ConfirmModal
          title={t.listeningStopTitle}
          message={t.listeningStopMessage}
          confirmLabel={t.listeningStopConfirm}
          cancelLabel={t.listeningStopCancel}
          onConfirm={() => {
            stop()
            setShowStopConfirm(false)
          }}
          onCancel={() => setShowStopConfirm(false)}
        />
      )}
    </>
  )
}
