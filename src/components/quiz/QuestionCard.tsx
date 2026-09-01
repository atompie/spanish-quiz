import { useTranslation } from '../../i18n/LanguageContext'

interface QuestionCardProps {
  current: number
  total: number
  prompt: string
  showHintButton: boolean
  onHint: () => void
}

export function QuestionCard({ current, total, prompt, showHintButton, onHint }: QuestionCardProps) {
  const { t } = useTranslation()
  return (
    <>
      <p className="quiz-progress">
        {current} / {total}
      </p>
      <div className="quiz-question-row">
        <p className="quiz-question">{prompt}</p>
        {showHintButton && (
          <button
            type="button"
            className="btn-icon btn-icon--sm btn-icon--inverted"
            onClick={onHint}
            aria-label={t.hintAriaLabel}
          >
            ?
          </button>
        )}
      </div>
    </>
  )
}
