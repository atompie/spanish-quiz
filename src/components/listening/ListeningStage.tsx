interface ListeningStageProps {
  showCountdown: boolean
  countdownLabel: string
  secondsRemaining: number | null
  currentText: string | null
  lessonTitle: string | null
}

export function ListeningStage({ showCountdown, countdownLabel, secondsRemaining, currentText, lessonTitle }: ListeningStageProps) {
  return (
    <div className="listening-stage">
      {lessonTitle && <p className="listening-stage-title">{lessonTitle}</p>}
      <div className={`listening-stage-counter${showCountdown ? '' : ' listening-stage-counter--hidden'}`}>
        <div className="listening-stage-icon listening-stage-icon--counter">{secondsRemaining}</div>
        <p className="listening-stage-label">{countdownLabel}</p>
      </div>
      {currentText && <p className="listening-stage-sentence">{currentText}</p>}
    </div>
  )
}
