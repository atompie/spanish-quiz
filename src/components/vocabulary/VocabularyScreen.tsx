import type { VocabularyCategoryId } from '../../data/vocabularyCategories'
import { useTranslation } from '../../i18n/LanguageContext'
import { ExplanationModal } from '../common/ExplanationModal'
import { TopBarCloseButton } from '../common/TopBarCloseButton'
import { VerbsListScreen } from '../verbs/VerbsListScreen'
import { VocabularyCategoryList } from './VocabularyCategoryList'

interface VocabularyScreenProps {
  selectedCategory: VocabularyCategoryId | null
  onSelectCategory: (categoryId: VocabularyCategoryId) => void
  onBack: () => void
  selectedVerbId: string | null
  onSelectVerb: (verbId: string) => void
  onCloseVerbExplanation: () => void
}

export function VocabularyScreen({
  selectedCategory,
  onSelectCategory,
  onBack,
  selectedVerbId,
  onSelectVerb,
  onCloseVerbExplanation,
}: VocabularyScreenProps) {
  const { t } = useTranslation()

  if (selectedCategory === null) {
    return <VocabularyCategoryList onSelect={onSelectCategory} />
  }

  return (
    <>
      <TopBarCloseButton label={t.commonClose} onClose={onBack} />
      <VerbsListScreen onSelect={onSelectVerb} />
      {selectedVerbId && <ExplanationModal verbId={selectedVerbId} onClose={onCloseVerbExplanation} />}
    </>
  )
}
