import { useEffect, useState } from 'react'
import { useListeningSession } from '../../hooks/useListeningSession'
import { useTranslation } from '../../i18n/LanguageContext'
import { formatEstimatedDuration } from '../../lib/listeningSession'
import type { LanguageCode } from '../../types/language'
import type { ListeningAnswerWaitSeconds, ListeningSentenceCount } from '../../types/quiz'
import { CloseIcon } from '../common/CloseIcon'
import { PlayIcon } from '../common/PlayIcon'
import { ProgressBar } from '../common/ProgressBar'
import { RefreshIcon } from '../common/RefreshIcon'
import { SpeakerIcon } from '../common/SpeakerIcon'
import { ConfirmModal } from '../quiz/ConfirmModal'
import { LessonPicker } from './LessonPicker'

interface ListeningPracticeScreenProps {
  nativeLanguage: LanguageCode
  answerWaitSeconds: ListeningAnswerWaitSeconds
  sentenceCount: ListeningSentenceCount
}

export function ListeningPracticeScreen({ nativeLanguage, answerWaitSeconds, sentenceCount }: ListeningPracticeScreenProps) {
  const { t } = useTranslation()
  const [lesson, setLesson] = useState<string | null>(null)
  const {
    phase,
    pausedFromPhase,
    isPaused,
    secondsRemaining,
    progress,
    isFinished,
    isEmpty,
    hasLoadError,
    currentText,
    audioRef,
    start,
    togglePause,
    stop,
  } = useListeningSession(nativeLanguage, answerWaitSeconds, sentenceCount, lesson)

  const [showStopConfirm, setShowStopConfirm] = useState(false)

  useEffect(() => {
    if (lesson) start()
  }, [lesson, start])

  const audioElement = <audio ref={audioRef} hidden />

  if (lesson === null) {
    return (
      <>
        {audioElement}
        <LessonPicker
          onSelect={setLesson}
          nativeLanguage={nativeLanguage}
          answerWaitSeconds={answerWaitSeconds}
          sentenceCount={sentenceCount}
        />
      </>
    )
  }

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
        <div className="listening-screen">
          <div className="quiz-topbar">
            <button
              type="button"
              className="btn-icon btn-icon--inverted"
              aria-label={t.listeningStop}
              title={t.listeningStop}
              onClick={() => setLesson(null)}
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      </>
    )
  }

  if (isFinished) {
    return (
      <>
        {audioElement}
        <div className="listening-screen listening-screen--idle">
          <p className="results-title">{t.listeningFinishedTitle}</p>
          <p className="modal-message">{t.listeningFinishedMessage}</p>
          <div className="listening-idle-actions">
            <button
              type="button"
              className="btn-icon btn-icon--lg btn-icon--inverted"
              aria-label={t.listeningStartNew}
              title={t.listeningStartNew}
              onClick={start}
            >
              <PlayIcon />
            </button>
            <button
              type="button"
              className="btn-icon btn-icon--lg"
              aria-label={t.listeningChangeLesson}
              title={t.listeningChangeLesson}
              onClick={() => setLesson(null)}
            >
              <RefreshIcon />
            </button>
          </div>
        </div>
      </>
    )
  }

  const activePhase = isPaused ? pausedFromPhase : phase
  const showCountdown = activePhase === 'answering' || activePhase === 'gap'
  const countdownLabel = activePhase === 'answering' ? t.listeningCountdownLabel : t.listeningRepeatLabel
  const estimatedTime = formatEstimatedDuration(progress.estimatedRemainingSeconds)
  const estimatedTimeLabel = [
    estimatedTime.hours > 0 && `${estimatedTime.hours} ${t.listeningHoursAbbrev}`,
    (estimatedTime.hours > 0 || estimatedTime.minutes > 0) && `${estimatedTime.minutes} ${t.listeningMinutesAbbrev}`,
    `${estimatedTime.seconds} ${t.listeningSecondsAbbrev}`,
  ]
    .filter(Boolean)
    .join(' ')

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

        <div className="listening-progress-bar-wrapper">
          <ProgressBar current={progress.current} total={progress.total} centerLabel={estimatedTimeLabel} />
        </div>

        <div className="listening-countdown-area">
          {currentText && <p className="listening-caption">{currentText}</p>}
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
            setLesson(null)
            setShowStopConfirm(false)
          }}
          onCancel={() => setShowStopConfirm(false)}
        />
      )}
    </>
  )
}
