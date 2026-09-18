import type { UiStrings } from '../i18n/types'

export type VocabularyCategoryId = 'verbs'

export interface VocabularyCategory {
  id: VocabularyCategoryId
  labelKey: keyof UiStrings
  descriptionKey: keyof UiStrings
}

export const VOCABULARY_CATEGORIES: VocabularyCategory[] = [
  { id: 'verbs', labelKey: 'vocabCategoryVerbs', descriptionKey: 'vocabCategoryVerbsDescription' },
]
