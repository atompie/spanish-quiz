import { DEFAULT_LANGUAGE } from '../data/languages'
import type { LanguageCode } from '../types/language'
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

/** Współdzielone przez TenseMeta/PronounTypeMeta/VerbTypeMeta. */
export function getLabel<T extends { labels: Partial<Record<LanguageCode, string>> }>(
  meta: T,
  language: LanguageCode,
): string {
  return pickTranslation(meta.labels, language)
}
