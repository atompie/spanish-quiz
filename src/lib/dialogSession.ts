import type { AudioLangCode } from '../types/speak'
import type { DialogManifestEntry, DialogMode, DialogSpeaker, DialogTurn } from '../types/dialog'

export type DialogBubbleSide = 'left' | 'right'

const WAIT_MIN_SECONDS = 2
const WAIT_MAX_SECONDS = 15

function clampWait(seconds: number): number {
  return Math.min(WAIT_MAX_SECONDS, Math.max(WAIT_MIN_SECONDS, seconds))
}

/** Czas oczekiwania na tłumaczenie wyliczony z rzeczywistego czasu trwania odtworzonego nagrania. */
export function waitFromAudioDuration(durationSeconds: number): number {
  return clampWait(durationSeconds * 1.5 + 1)
}

/** Czas oczekiwania (tłumaczenie lub zastępczy podgląd tekstu) wyliczony z liczby słów, gdy nagranie
 * jest niedostępne — ten sam kształt wzoru co `waitFromAudioDuration`, ale bez wejścia audio. */
export function waitFromWordCount(text: string): number {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  return clampWait(0.6 * wordCount + 1)
}

/** Pauza po wypowiedzi (po odtworzeniu/zastąpieniu kwestii hiszpańskiej), zanim sesja przejdzie
 * do kolejnej kwestii — 85% czasu przeznaczonego na poprzedni krok (tłumaczenie dla kwestii
 * ucznia, sama kwestia hiszpańska dla kwestii rozmówcy). */
export function pauseFromDuration(seconds: number): number {
  return clampWait(seconds * 0.85)
}

/** Który rozmówca "posiada" kwestię o danym indeksie w danym trybie.
 * Tryb A: rozmówca = indeksy parzyste, uczeń = nieparzyste. Tryb B: odwrotnie. */
export function speakerForTurn(index: number, mode: DialogMode): DialogSpeaker {
  const isEven = index % 2 === 0
  if (mode === 'mode-a') return isEven ? 'native' : 'learner'
  return isEven ? 'learner' : 'native'
}

/** Strona okna czatu, na której renderowana jest kwestia o danym indeksie — stała dla danej postaci
 * dialogu (parzysty/nieparzysty indeks), niezależna od trybu i od tego, kto aktualnie ją wypowiada. */
export function sideForIndex(index: number): DialogBubbleSide {
  return index % 2 === 0 ? 'left' : 'right'
}

/** Deterministyczny, dwuprzebiegowy plan sesji dialogu: Tryb A w całości, potem Tryb B w całości,
 * bez tasowania i bez powtórzeń — w przeciwieństwie do listeningSession.buildSessionPlan. */
export function buildDialogPlan(turnCount: number): DialogTurn[] {
  const plan: DialogTurn[] = []
  for (const mode of ['mode-a', 'mode-b'] as const) {
    for (let index = 0; index < turnCount; index++) {
      plan.push({ index, mode, speaker: speakerForTurn(index, mode) })
    }
  }
  return plan
}

/** Czy nagranie dla danego indeksu (1-based plik N.mp3) istnieje w danym języku, wg wpisu manifestu. */
export function hasRecording(
  entry: DialogManifestEntry | undefined,
  lang: AudioLangCode,
  element: number,
): boolean {
  const count = entry?.counts[lang] ?? 0
  return element <= count
}

/** Jak potraktować krok w języku ojczystym kwestii ucznia:
 * - `'play'` — nagranie istnieje i przełącznik audio jest włączony -> odtwórz je.
 * - `'text-only'` — nagranie istnieje, ale przełącznik jest wyłączony (wybór ucznia) -> pokaż
 *   tekst i policz czas tłumaczenia w JEDNYM oczekiwaniu (bez dodatkowego, odrębnego countdownu —
 *   w przeciwieństwie do `'missing'`, gdzie nagranie faktycznie nie istnieje).
 * - `'missing'` — nagranie nie istnieje niezależnie od przełącznika -> istniejący dwuetapowy
 *   fallback (`native-wait-fallback` -> `countdown`), niezmieniony. */
export type NativeStepMode = 'play' | 'text-only' | 'missing'

export function resolveNativeStepMode(
  nativeAudioEnabled: boolean,
  entry: DialogManifestEntry | undefined,
  nativeLanguage: AudioLangCode,
  element: number,
): NativeStepMode {
  if (!hasRecording(entry, nativeLanguage, element)) return 'missing'
  return nativeAudioEnabled ? 'play' : 'text-only'
}

export function dialogAudioPath(dialog: string, lang: AudioLangCode, element: number): string {
  return `/dialog/${dialog}/${lang}/${element}.mp3`
}

/** Znajduje wpis manifestu dla danego dialogu. */
export function findDialogManifestEntry(
  manifest: DialogManifestEntry[],
  dialog: string,
): DialogManifestEntry | undefined {
  return manifest.find((entry) => entry.dialog === dialog)
}

/** Posortowana lista unikalnych dialogów z manifestu (numerycznie po sufiksie `dialog_N`, reszta alfabetycznie). */
export function getAvailableDialogs(manifest: DialogManifestEntry[]): string[] {
  return [...new Set(manifest.map((entry) => entry.dialog))].sort((a, b) => {
    const numA = /^dialog_(\d+)$/.exec(a)
    const numB = /^dialog_(\d+)$/.exec(b)
    if (numA && numB) return Number(numA[1]) - Number(numB[1])
    if (numA) return -1
    if (numB) return 1
    return a.localeCompare(b)
  })
}
