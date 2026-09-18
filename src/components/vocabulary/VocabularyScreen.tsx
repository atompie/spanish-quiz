import type { VocabularyCategoryId } from '../../data/vocabularyCategories'
import { useTranslation } from '../../i18n/LanguageContext'
import { ExplanationModal } from '../common/ExplanationModal'
import { TopBarCloseButton } from '../common/TopBarCloseButton'
import { NounExplanationModal } from '../nouns/NounExplanationModal'
import { NounsListScreen } from '../nouns/NounsListScreen'
import { VerbsListScreen } from '../verbs/VerbsListScreen'
import { VocabularyCategoryList } from './VocabularyCategoryList'

interface VocabularyScreenProps {
  selectedCategory: VocabularyCategoryId | null
  onSelectCategory: (categoryId: VocabularyCategoryId) => void
  onBack: () => void
  selectedVerbId: string | null
  onSelectVerb: (verbId: string) => void
  onCloseVerbExplanation: () => void
  selectedNounId: string | null
  onSelectNoun: (nounId: string) => void
  onCloseNounExplanation: () => void
}

export function VocabularyScreen({
  selectedCategory,
  onSelectCategory,
  onBack,
  selectedVerbId,
  onSelectVerb,
  onCloseVerbExplanation,
  selectedNounId,
  onSelectNoun,
  onCloseNounExplanation,
}: VocabularyScreenProps) {
  const { t } = useTranslation()

  if (selectedCategory === null) {
    return <VocabularyCategoryList onSelect={onSelectCategory} />
  }

  return (
    <>
      <TopBarCloseButton label={t.commonClose} onClose={onBack} />
      {selectedCategory === 'verbs' && (
        <>
          <VerbsListScreen onSelect={onSelectVerb} />
          {selectedVerbId && <ExplanationModal verbId={selectedVerbId} onClose={onCloseVerbExplanation} />}
        </>
      )}
      {selectedCategory === 'nouns' && (
        <>
          <NounsListScreen onSelect={onSelectNoun} />
          {selectedNounId && <NounExplanationModal nounId={selectedNounId} onClose={onCloseNounExplanation} />}
        </>
      )}
    </>
  )
}
