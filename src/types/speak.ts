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

/** Wpis zdania „es”: [tekst, liczba powtórzeń w sesji]. */
export type SpeakEsEntry = [text: string, repeat: number]

/** Transkrypcje zdań z public/speak/metadata.json — index tablicy (0-based) = plik N.mp3 (1-based, N = index+1). */
export interface SpeakMetadata {
  [lesson: string]: {
    level: number
    parts: {
      [slug: string]: Partial<Record<Exclude<AudioLangCode, 'es'>, string[]>> & { es?: SpeakEsEntry[] }
    }
  }
}

/** Zdanie (element) kwalifikujące się do sesji dla aktualnego języka ojczystego. */
export interface EligibleItem {
  slug: string
  /** 1-based, odpowiada plikowi N.mp3. */
  element: number
  /** Docelowa liczba odtworzeń w sesji (z metadata.json, łącznie z pierwszym — sekwencyjnym — odtworzeniem). */
  repeat: number
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
