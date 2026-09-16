import { useEffect, useState } from 'react'
import { useDialogSession } from '../../hooks/useDialogSession'
import { useTranslation } from '../../i18n/LanguageContext'
import { loadDialogNativeAudioEnabled, saveDialogNativeAudioEnabled } from '../../lib/storage'
import type { LanguageCode } from '../../types/language'
import { ProgressBar } from '../common/ProgressBar'
import { ConfirmModal } from '../quiz/ConfirmModal'
import { DialogPicker } from './DialogPicker'
import { DialogStage } from './DialogStage'
import { DialogTopBar } from './DialogTopBar'

interface DialogPracticeScreenProps {
  nativeLanguage: LanguageCode
}

export function DialogPracticeScreen({ nativeLanguage }: DialogPracticeScreenProps) {
  const { t } = useTranslation()
  const [dialog, setDialog] = useState<string | null>(null)
  const [nativeAudioEnabled, setNativeAudioEnabled] = useState(() => loadDialogNativeAudioEnabled())

  const toggleNativeAudio = () => {
    setNativeAudioEnabled((prev) => {
      const next = !prev
      saveDialogNativeAudioEnabled(next)
      return next
    })
  }

  const {
    phase,
    turnPhase,
    pausedFromPhase,
    isPaused,
    secondsRemaining,
    progress,
    isFinished,
    isEmpty,
    hasLoadError,
    currentText,
    history,
    currentTurn,
    resumableDialog,
    resumeSession,
    discardResumableSession,
    audioRef,
    start,
    togglePause,
    stop,
  } = useDialogSession(nativeLanguage, dialog, nativeAudioEnabled)

  const [showStopConfirm, setShowStopConfirm] = useState(false)

  useEffect(() => {
    if (dialog) start()
  }, [dialog, start])

  // Bez ekranu podsumowania — po zakończeniu obu trybów sesja od razu wraca do listy dialogów.
  useEffect(() => {
    if (isFinished) {
      stop()
      setDialog(null)
    }
  }, [isFinished, stop])

  const audioElement = <audio ref={audioRef} hidden />

  if (dialog === null) {
    return (
      <>
        {audioElement}
        <DialogPicker onSelect={setDialog} />
        {resumableDialog && (
          <ConfirmModal
            title={t.sessionResumeTitle}
            message={t.sessionResumeMessage}
            confirmLabel={t.sessionResumeConfirm}
            cancelLabel={t.sessionResumeDiscard}
            onConfirm={() => {
              setDialog(resumableDialog)
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
          <p>{t.dialogLoadError}</p>
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
          <p>{t.dialogEmptyState}</p>
        </div>
      </>
    )
  }

  if (phase === 'idle') {
    return (
      <>
        {audioElement}
        <div className="listening-screen">
          <DialogTopBar
            nativeAudioEnabled={nativeAudioEnabled}
            onToggleNativeAudio={toggleNativeAudio}
            toggleLabel={t.dialogNativeAudioLabel}
            enableLabel={t.dialogNativeAudioEnable}
            disableLabel={t.dialogNativeAudioDisable}
            closeLabel={t.dialogStop}
            onClose={() => setDialog(null)}
          />
        </div>
      </>
    )
  }

  const isModeTransition = phase === 'mode-transition' || pausedFromPhase === 'mode-transition'

  if (isModeTransition) {
    return (
      <>
        {audioElement}
        <div className="listening-screen listening-screen--idle">
          <p className="results-title">{t.dialogModeTransitionMessage}</p>
          <div className="listening-stage-counter">
            <div className="listening-stage-icon listening-stage-icon--counter">{secondsRemaining}</div>
          </div>
          <div className="listening-controls">
            <button type="button" className="btn btn-primary" onClick={togglePause}>
              {isPaused ? t.dialogResume : t.dialogPause}
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {audioElement}
      <div className="listening-screen">
        <DialogTopBar
          nativeAudioEnabled={nativeAudioEnabled}
          onToggleNativeAudio={toggleNativeAudio}
          toggleLabel={t.dialogNativeAudioLabel}
          enableLabel={t.dialogNativeAudioEnable}
          disableLabel={t.dialogNativeAudioDisable}
          closeLabel={t.dialogStop}
          onClose={() => setShowStopConfirm(true)}
        />

        <div className="listening-progress-bar-wrapper">
          <ProgressBar current={progress.current} total={progress.total} />
        </div>

        <DialogStage
          history={history}
          currentTurn={currentTurn}
          countdownLabel={t.dialogCountdownLabel}
          secondsRemaining={secondsRemaining}
          currentText={currentText}
          turnPhase={turnPhase}
        />

        <div className="listening-controls">
          <button type="button" className="btn btn-primary" onClick={togglePause}>
            {isPaused ? t.dialogResume : t.dialogPause}
          </button>
        </div>
      </div>

      {showStopConfirm && (
        <ConfirmModal
          title={t.dialogStopTitle}
          message={t.dialogStopMessage}
          confirmLabel={t.dialogStopConfirm}
          cancelLabel={t.dialogStopCancel}
          onConfirm={() => {
            stop()
            setDialog(null)
            setShowStopConfirm(false)
          }}
          onCancel={() => setShowStopConfirm(false)}
        />
      )}
    </>
  )
}
