import type { LanguageCode } from '../../types/language'
import type { UiStrings } from '../types'
import { de } from './de'
import { en } from './en'
import { pl } from './pl'

/** Dodanie języka: dopisać jego plik tutaj i wpis w tej mapie. */
export const UI_TRANSLATIONS: Partial<Record<LanguageCode, UiStrings>> = { pl, en, de }

export function getUiStrings(language: LanguageCode): UiStrings {
  return UI_TRANSLATIONS[language] ?? UI_TRANSLATIONS.pl!
}
