import type { LanguageCode } from '../types/language'

export interface LanguageMeta {
  id: LanguageCode
  nameNative: string
}

/**
 * Zarejestrowane języki. Dodanie języka: dopisać wpis tutaj, uzupełnić
 * tłumaczenia czasowników/przykładów w src/data/verbs.ts i słownik UI
 * w src/i18n/translations/<code>.ts.
 */
export const LANGUAGES: LanguageMeta[] = [
  { id: 'pl', nameNative: 'Polski' },
  { id: 'en', nameNative: 'English' },
  { id: 'de', nameNative: 'Deutsch' },
]

export const DEFAULT_LANGUAGE: LanguageCode = 'pl'
