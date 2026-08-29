import { useTranslation } from '../../i18n/LanguageContext'

interface ResultsScreenProps {
  correct: number
  incorrect: number
  total: number
  canRepeatMistakes: boolean
  onRepeatMistakes: () => void
  onNewQuiz: () => void
}

export function ResultsScreen({
  correct,
  incorrect,
  total,
  canRepeatMistakes,
  onRepeatMistakes,
  onNewQuiz,
}: ResultsScreenProps) {
  const { t } = useTranslation()
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <>
      <p className="results-title">{t.resultsTitle}</p>
      <p className="results-score">
        {correct} / {total}
      </p>
      <p className="results-percent">{percent}%</p>
      <p className="results-breakdown">
        <span className="tally-correct">
          {t.resultsCorrectLabel} {correct}
        </span>
        <br />
        <span className="tally-incorrect">
          {t.resultsIncorrectLabel} {incorrect}
        </span>
      </p>
      <div className="results-actions">
        {canRepeatMistakes && (
          <button type="button" className="btn btn-secondary" onClick={onRepeatMistakes}>
            {t.resultsRepeatMistakes}
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={onNewQuiz}>
          {t.resultsNewQuiz}
        </button>
      </div>
    </>
  )
}
