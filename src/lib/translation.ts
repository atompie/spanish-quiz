import { DEFAULT_LANGUAGE } from '../data/languages'
import type { LanguageCode } from '../types/language'
import type { Noun, NounTranslation, PolishGender } from '../types/noun'
import type { Example, Verb, VerbTranslation } from '../types/verb'

/**
 * Rozwiązuje mapę tłumaczeń dla żądanego języka, spadając do DEFAULT_LANGUAGE,
 * a potem do dowolnego dostępnego wpisu — dzięki temu UI nigdy nie renderuje
 * pustego tekstu, nawet dla czasownika/przykładu bez tłumaczenia na `language`.
 */
function pickTranslation<T>(translations: Partial<Record<LanguageCode, T>>, language: LanguageCode): T {
  const value = translations[language] ?? translations[DEFAULT_LANGUAGE] ?? Object.values(translations)[0]
  if (value === undefined) {
    throw new Error('No translations available for this entry — data bug.')
  }
  return value as T
}

export function getVerbTranslation(verb: Verb, language: LanguageCode): VerbTranslation {
  return pickTranslation(verb.translations, language)
}

export function getExampleTranslation(example: Example, language: LanguageCode): string {
  return pickTranslation(example.translations, language)
}

export function getNounTranslation(noun: Noun, language: LanguageCode): NounTranslation {
  return pickTranslation(noun.translations, language)
}

/**
 * Słowo w języku ojczystym, poprzedzone rodzajnikiem gdy `language` go używa (tylko `de`:
 * "der/die/das"). Polski nie ma rodzajników — jego rodzaj gramatyczny niesie osobno
 * `getNounGenderLabel`.
 */
export function getNounDisplayWord(noun: Noun, language: LanguageCode): string {
  const translation = getNounTranslation(noun, language)
  return translation.article ? `${translation.article} ${translation.singular}` : translation.singular
}

const POLISH_GENDER_LABELS: Record<PolishGender, string> = {
  masculine: 'rodzaj męski',
  feminine: 'rodzaj żeński',
  neuter: 'rodzaj nijaki',
}

/** Etykieta rodzaju gramatycznego, tylko dla `pl` (polski nie ma rodzajników — patrz wyżej). */
export function getNounGenderLabel(noun: Noun, language: LanguageCode): string | null {
  if (language !== 'pl') return null
  const gender = getNounTranslation(noun, language).gender
  return gender ? POLISH_GENDER_LABELS[gender] : null
}

/** Współdzielone przez TenseMeta/PronounTypeMeta/VerbTypeMeta. */
export function getLabel<T extends { labels: Partial<Record<LanguageCode, string>> }>(
  meta: T,
  language: LanguageCode,
): string {
  return pickTranslation(meta.labels, language)
}
