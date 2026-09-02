import type { LanguageCode } from './language.ts'

/** Języki, dla których mogą istnieć nagrania: 'es' (hardcoded, język nauki) + języki UI. */
export type AudioLangCode = LanguageCode | 'es'

/** Jeden wpis wygenerowanego katalogu — jeden folder zdania w public/speak/<lesson>/. */
export interface SpeakSentenceManifestEntry {
  slug: string
  /** Katalog lekcji (bezpośredni podkatalog public/speak/), do którego należy zdanie. */
  lesson: string
  /** Liczba kolejnych plików N.mp3 znalezionych dla danego języka (od 1, bez dziur). */
  counts: Partial<Record<AudioLangCode, number>>
}

/** Zdanie kwalifikujące się do sesji dla aktualnego języka ojczystego. */
export interface EligibleSentence {
  slug: string
  /** min(counts.es, counts[nativeLanguage]) */
  elementCount: number
}

export interface SentenceUsageState {
  slug: string
  elementCount: number
  /** Pozostałe wykorzystania dla każdego elementu (index 0 = element 1, ...), każdy start na MAX_USES_PER_ELEMENT. */
  elementUsesRemaining: number[]
  everUsed: boolean
}

export interface ListeningRound {
  slug: string
  element: number
}

export type ListeningPhase =
  | 'idle'
  | 'playing-native'
  | 'answering'
  | 'playing-target'
  | 'gap'
  | 'paused'
  | 'finished'
