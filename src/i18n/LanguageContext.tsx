import { createContext, useContext, type ReactNode } from 'react'
import { DEFAULT_LANGUAGE } from '../data/languages'
import type { LanguageCode } from '../types/language'
import { getUiStrings } from './translations'
import type { UiStrings } from './types'

interface LanguageContextValue {
  language: LanguageCode
  t: UiStrings
}

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  t: getUiStrings(DEFAULT_LANGUAGE),
})

interface LanguageProviderProps {
  language: LanguageCode
  children: ReactNode
}

export function LanguageProvider({ language, children }: LanguageProviderProps) {
  const value: LanguageContextValue = { language, t: getUiStrings(language) }
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useTranslation(): LanguageContextValue {
  return useContext(LanguageContext)
}
