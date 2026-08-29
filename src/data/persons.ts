import type { LanguageCode } from '../types/language'
import type { Person } from '../types/grammar'

export interface PersonMeta {
  id: Person
  labels: Partial<Record<LanguageCode, string>>
}

/**
 * Etykiety osób w języku ojczystym ucznia — używane wszędzie tam, gdzie osoba
 * pojawia się obok tekstu w tym języku (np. prompt quizu koniugacji), żeby nie
 * mieszać hiszpańskiego zaimka z resztą zdania w innym języku.
 */
export const PERSONS_META: PersonMeta[] = [
  { id: 'yo', labels: { pl: 'ja', en: 'I', de: 'ich' } },
  { id: 'tu', labels: { pl: 'ty', en: 'you', de: 'du' } },
  { id: 'el', labels: { pl: 'on/ona', en: 'he/she', de: 'er/sie' } },
  { id: 'nosotros', labels: { pl: 'my', en: 'we', de: 'wir' } },
  { id: 'vosotros', labels: { pl: 'wy', en: 'you (all)', de: 'ihr' } },
  { id: 'ellos', labels: { pl: 'oni/one', en: 'they', de: 'sie' } },
]
