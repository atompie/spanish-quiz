import { useEffect, useRef } from 'react'
import { sideForIndex } from '../../lib/dialogSession'
import type { DialogActiveTurn, DialogHistoryEntry, DialogTurnPhase } from '../../types/dialog'

interface DialogStageProps {
  history: DialogHistoryEntry[]
  currentTurn: DialogActiveTurn | null
  currentText: string | null
  countdownLabel: string
  secondsRemaining: number | null
  turnPhase: DialogTurnPhase | null
}

export function DialogStage({
  history,
  currentTurn,
  currentText,
  countdownLabel,
  secondsRemaining,
  turnPhase,
}: DialogStageProps) {
  const liveBubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    liveBubbleRef.current?.scrollIntoView({ block: 'nearest' })
  }, [currentText, currentTurn?.index])

  const isLearnerActive = currentTurn?.speaker === 'learner'
  const isPostAnswerPause = turnPhase === 'post-answer-pause'
  const showCountdownTag = isLearnerActive && secondsRemaining !== null && !isPostAnswerPause
  const showPauseTag = isLearnerActive && isPostAnswerPause

  return (
    <div className="dialog-chat-log">
      {history.map((entry) => (
        <div key={entry.index} className={`dialog-bubble dialog-bubble--${sideForIndex(entry.index)}`}>
          {entry.text}
        </div>
      ))}
      {currentTurn && currentText && (
        <div
          ref={liveBubbleRef}
          className={`dialog-bubble dialog-bubble--${sideForIndex(currentTurn.index)} dialog-bubble--live${
            isLearnerActive ? ' dialog-bubble--active' : ''
          }`}
        >
          {showCountdownTag && (
            <span className="dialog-bubble-tag" aria-label={countdownLabel}>
              {secondsRemaining}
            </span>
          )}
          {showPauseTag && (
            <span className="dialog-bubble-tag dialog-bubble-tag--bottom" aria-label={countdownLabel}>
              <svg
                className="dialog-bubble-tag-spinner"
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-3-6.7" />
              </svg>
            </span>
          )}
          {currentText}
        </div>
      )}
    </div>
  )
}
