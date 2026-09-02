import { useTranslation } from '../../i18n/LanguageContext'
import type { QuizKind } from '../../types/quiz'

interface QuizKindPickerProps {
  onSelect: (kind: QuizKind) => void
}

export function QuizKindPicker({ onSelect }: QuizKindPickerProps) {
  const { t } = useTranslation()

  const options: { id: QuizKind; title: string; description: string }[] = [
    { id: 'phrase', title: t.quizKindPhraseTitle, description: t.quizKindPhraseDescription },
    { id: 'conjugation', title: t.quizKindConjugationTitle, description: t.quizKindConjugationDescription },
    { id: 'listening', title: t.quizKindListeningTitle, description: t.quizKindListeningDescription },
  ]

  return (
    <div className="quiz-kind-picker">
      <h2>{t.quizKindPickerTitle}</h2>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="quiz-kind-option"
          onClick={() => onSelect(option.id)}
        >
          <span className="quiz-kind-option-title">{option.title}</span>
          <span className="quiz-kind-option-description">{option.description}</span>
        </button>
      ))}
    </div>
  )
}
