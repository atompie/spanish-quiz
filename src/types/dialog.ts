import type { AudioLangCode } from './speak.ts'

/** Jedna kwestia dialogu — tekst we wszystkich czterech językach. Indeks w tablicy `text` (0-based)
 * odpowiada plikowi (indeks+1).mp3 w każdym katalogu językowym. */
export interface DialogTurnText {
  pl: string
  en: string
  de: string
  es: string
}

/** Transkrypcje dialogów z public/dialog/metadata.json — jeden wspólny plik dla wszystkich dialogów. */
export interface DialogMetadata {
  [dialog: string]: {
    level: number
    text: DialogTurnText[]
  }
}

/** Jeden wpis wygenerowanego katalogu — jeden dialog w public/dialog/. Bez poziomu `slug`
 * (w przeciwieństwie do SpeakSentenceManifestEntry) — dialog nie ma podczęści, tylko kwestie. */
export interface DialogManifestEntry {
  dialog: string
  /** Liczba kolejnych plików N.mp3 znalezionych dla danego języka (od 1, bez dziur). */
  counts: Partial<Record<AudioLangCode, number>>
}

/** Który rozmówca "posiada" daną kwestię w bieżącym trybie. */
export type DialogSpeaker = 'learner' | 'native'

/** Tryb A ("Rozmówca zaczyna", rozmówca = indeksy parzyste) albo tryb B ("Ty zaczynasz", uczeń = indeksy parzyste). */
export type DialogMode = 'mode-a' | 'mode-b'

/** Jedna zaplanowana kwestia sesji: indeks w `text[]` dialogu, tryb, w którym jest odtwarzana, i jej właściciel. */
export interface DialogTurn {
  index: number
  mode: DialogMode
  speaker: DialogSpeaker
}

/** Faza sesji na najwyższym poziomie. */
export type DialogPhase = 'idle' | 'mode-a' | 'mode-transition' | 'mode-b' | 'paused' | 'finished'

/** Podfaza pojedynczej kwestii ucznia (rozmówca ma tylko `target-playing`/`target-wait-fallback`
 * i `post-answer-pause`). */
export type DialogTurnPhase =
  | 'native-playing'
  | 'native-wait-fallback'
  | 'countdown'
  | 'target-playing'
  | 'target-wait-fallback'
  | 'post-answer-pause'

/** Zakończona kwestia w oknie czatu bieżącego przebiegu (trybu) — tylko tekst hiszpański,
 * niezależnie od tego, czy była to kwestia ucznia, czy rozmówcy. */
export interface DialogHistoryEntry {
  index: number
  text: string
}

/** Zawężony widok bieżącej (bieżąco odtwarzanej) kwestii, potrzebny UI do wyboru strony
 * dymka i tego, czy pokazać aktywny (pomarańczowy) styl. */
export interface DialogActiveTurn {
  index: number
  speaker: DialogSpeaker
}
