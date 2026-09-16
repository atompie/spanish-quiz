import { useEffect, useState } from 'react'
import { useListeningSession } from '../../hooks/useListeningSession'
import { useTranslation } from '../../i18n/LanguageContext'
import { formatEstimatedDuration } from '../../lib/listeningSession'
import type { LanguageCode } from '../../types/language'
import type { ListeningAnswerWaitSeconds } from '../../types/quiz'
import { PauseIcon } from '../common/PauseIcon'
import { PlayIcon } from '../common/PlayIcon'
import { ProgressBar } from '../common/ProgressBar'
import { RefreshIcon } from '../common/RefreshIcon'
import { TopBarCloseButton } from '../common/TopBarCloseButton'
import { ConfirmModal } from '../quiz/ConfirmModal'
import { AnswerWaitPicker } from './AnswerWaitPicker'
import { LessonPicker } from './LessonPicker'
import { ListeningStage } from './ListeningStage'

interface ListeningPracticeScreenProps {
  nativeLanguage: LanguageCode
  answerWaitSeconds: ListeningAnswerWaitSeconds
  onAnswerWaitSecondsChange: (seconds: ListeningAnswerWaitSeconds) => void
}

export function ListeningPracticeScreen({
  nativeLanguage,
  answerWaitSeconds,
  onAnswerWaitSecondsChange,
}: ListeningPracticeScreenProps) {
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
    lessonTitle,
    resumableLesson,
    resumeSession,
    discardResumableSession,
    audioRef,
    start,
    togglePause,
    stop,
  } = useListeningSession(nativeLanguage, answerWaitSeconds, lesson)

  const [showStopConfirm, setShowStopConfirm] = useState(false)

  useEffect(() => {
    if (lesson) start()
  }, [lesson, start])

  const audioElement = <audio ref={audioRef} hidden />

  if (lesson === null) {
    return (
      <>
        {audioElement}
        <LessonPicker onSelect={setLesson} nativeLanguage={nativeLanguage} answerWaitSeconds={answerWaitSeconds} />
        {resumableLesson && (
          <ConfirmModal
            title={t.sessionResumeTitle}
            message={t.sessionResumeMessage}
            confirmLabel={t.sessionResumeConfirm}
            cancelLabel={t.sessionResumeDiscard}
            onConfirm={() => {
              setLesson(resumableLesson)
              resumeSession()
            }}
            onCancel={discardResumableSession}
          />
        )}
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
          <div className="listening-topbar">
            <AnswerWaitPicker value={answerWaitSeconds} onChange={onAnswerWaitSecondsChange} />
            <TopBarCloseButton label={t.listeningStop} onClose={() => setLesson(null)} />
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
        <div className="listening-topbar">
          <AnswerWaitPicker value={answerWaitSeconds} onChange={onAnswerWaitSecondsChange} />
          <div className="listening-topbar-actions">
            <button
              type="button"
              className={`btn-icon${isPaused ? ' btn-icon--inverted' : ''}`}
              aria-label={isPaused ? t.listeningResume : t.listeningPause}
              title={isPaused ? t.listeningResume : t.listeningPause}
              aria-pressed={isPaused}
              onClick={togglePause}
            >
              {isPaused ? <PlayIcon /> : <PauseIcon />}
            </button>
            <TopBarCloseButton label={t.listeningStop} onClose={() => setShowStopConfirm(true)} />
          </div>
        </div>

        <div className="listening-progress-bar-wrapper">
          <ProgressBar current={progress.current} total={progress.total} centerLabel={estimatedTimeLabel} />
        </div>

        <ListeningStage
          showCountdown={showCountdown}
          countdownLabel={countdownLabel}
          secondsRemaining={secondsRemaining}
          currentText={currentText}
          lessonTitle={lessonTitle}
        />
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
