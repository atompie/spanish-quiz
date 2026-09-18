import type { LanguageCode } from '../types/language'
import type { Person, TenseId } from '../types/grammar'

export interface TenseMeta {
  id: TenseId
  labels: Partial<Record<LanguageCode, string>>
  labelEs: string
  order: number
  /** Osoby, dla których ten czas nie ma formy (np. "yo" w trybie rozkazującym). */
  excludedPersons?: Person[]
}

/**
 * Metadane obsługiwanych czasów. Dodanie kolejnego czasu (np. subjuntivo)
 * wymaga: nowego wpisu tutaj + pola w Verb.conjugations + przykładów w data/verbs.ts.
 */
export const TENSES: TenseMeta[] = [
  { id: 'presente', labels: { pl: 'Presente', en: 'Present', de: 'Präsens' }, labelEs: 'presente', order: 1 },
  {
    id: 'preterite',
    labels: { pl: 'Pretérito indefinido', en: 'Simple past', de: 'Präteritum' },
    labelEs: 'pretérito indefinido',
    order: 2,
  },
  {
    id: 'futuro',
    labels: { pl: 'Futuro simple', en: 'Simple future', de: 'Futur I' },
    labelEs: 'futuro simple',
    order: 3,
  },
  {
    id: 'ir_a_infinitivo',
    labels: {
      pl: 'Zamiar (ir a + infinitivo)',
      en: 'Going to (ir a + infinitive)',
      de: 'Nahe Zukunft (ir a + Infinitiv)',
    },
    labelEs: 'ir a + infinitivo',
    order: 4,
  },
  {
    id: 'acabar_de_infinitivo',
    labels: {
      pl: 'Właśnie coś zrobił (acabar de + infinitivo)',
      en: 'Just did (acabar de + infinitive)',
      de: 'Soeben geschehen (acabar de + Infinitiv)',
    },
    labelEs: 'acabar de + infinitivo',
    order: 5,
  },
  {
    id: 'imperativo_afirmativo',
    labels: {
      pl: 'Tryb rozkazujący (twierdzący)',
      en: 'Imperative (affirmative)',
      de: 'Imperativ (bejaht)',
    },
    labelEs: 'imperativo afirmativo',
    order: 6,
    excludedPersons: ['yo'],
  },
  {
    id: 'imperativo_negativo',
    labels: {
      pl: 'Tryb rozkazujący (przeczący)',
      en: 'Imperative (negative)',
      de: 'Imperativ (verneint)',
    },
    labelEs: 'imperativo negativo',
    order: 7,
    excludedPersons: ['yo'],
  },
]

export const DEFAULT_ENABLED_TENSES: TenseId[] = TENSES.map((t) => t.id)
