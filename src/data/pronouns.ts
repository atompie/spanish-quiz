import type { LanguageCode } from '../types/language'
import type { PronounType } from '../types/grammar'

export interface PronounTypeMeta {
  id: PronounType
  labels: Partial<Record<LanguageCode, string>>
}

/** "none" nie jest wyborem użytkownika w ustawieniach — zawsze dozwolony. */
export const SELECTABLE_PRONOUN_TYPES: PronounTypeMeta[] = [
  { id: 'direct', labels: { pl: 'bliższy (direct object)', en: 'direct object', de: 'Akkusativobjekt' } },
  { id: 'indirect', labels: { pl: 'dalszy (indirect object)', en: 'indirect object', de: 'Dativobjekt' } },
]

export const DEFAULT_ENABLED_PRONOUN_TYPES: PronounType[] = ['direct', 'indirect']
