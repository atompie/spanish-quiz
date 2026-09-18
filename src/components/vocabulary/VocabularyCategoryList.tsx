import { VOCABULARY_CATEGORIES, type VocabularyCategoryId } from '../../data/vocabularyCategories'
import { useTranslation } from '../../i18n/LanguageContext'

interface VocabularyCategoryListProps {
  onSelect: (categoryId: VocabularyCategoryId) => void
}

export function VocabularyCategoryList({ onSelect }: VocabularyCategoryListProps) {
  const { t } = useTranslation()

  return (
    <div className="quiz-kind-picker">
      <h2>{t.vocabPickerTitle}</h2>
      {VOCABULARY_CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          className="quiz-kind-option"
          onClick={() => onSelect(category.id)}
        >
          <span className="quiz-kind-option-title">{t[category.labelKey]}</span>
          <span className="quiz-kind-option-description">{t[category.descriptionKey]}</span>
        </button>
      ))}
    </div>
  )
}
