import type { LanguageCode } from '../types/language'
import type { VerbType } from '../types/grammar'

export interface VerbTypeMeta {
  id: VerbType
  labels: Partial<Record<LanguageCode, string>>
}

export const VERB_TYPES: VerbTypeMeta[] = [
  { id: 'regular', labels: { pl: 'Regularne', en: 'Regular', de: 'Regelmäßig' } },
  { id: 'irregular', labels: { pl: 'Nieregularne', en: 'Irregular', de: 'Unregelmäßig' } },
]

export const DEFAULT_ENABLED_VERB_TYPES: VerbType[] = VERB_TYPES.map((v) => v.id)
