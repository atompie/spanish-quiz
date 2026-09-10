import type { LanguageCode } from '../types/language'
import type {
  AudioLangCode,
  EligibleItem,
  ListeningRound,
  SpeakMetadata,
  SpeakSentenceManifestEntry,
} from '../types/speak'

/** Wartość użyta, gdy metadata.json nie podaje liczby powtórzeń dla zdania (brak wpisu / niepoprawna wartość). */
export const DEFAULT_REPEAT_COUNT = 3

/** Zdania (elementy) kwalifikujące się do sesji dla lekcji i języka ojczystego — źródłem prawdy jest metadata.json:
 * bez wpisu w metadata.json zdanie nigdy nie jest odtwarzane, nawet jeśli nagranie istnieje w manifest.json.
 * Kolejność wyniku = kolejność Przebiegu 1. (klucze `parts` w kolejności z pliku, a w ich obrębie elementy 1..N). */
export function getEligibleItems(
  manifest: SpeakSentenceManifestEntry[],
  metadata: SpeakMetadata | null,
  nativeLanguage: LanguageCode,
  lesson: string,
): EligibleItem[] {
  const parts = metadata?.[lesson]?.parts
  if (!parts) return []

  const items: EligibleItem[] = []
  for (const slug of Object.keys(parts)) {
    const esArray = parts[slug]?.es ?? []
    const manifestEntry = manifest.find((entry) => entry.lesson === lesson && entry.slug === slug)
    const manifestEsCount = manifestEntry?.counts.es ?? 0
    const manifestNativeCount = manifestEntry?.counts[nativeLanguage] ?? 0
    const elementCount = Math.min(manifestEsCount, manifestNativeCount, esArray.length)

    for (let i = 0; i < elementCount; i++) {
      items.push({ slug, element: i + 1, repeat: getSpeakRepeatCount(metadata, lesson, slug, i + 1) })
    }
  }
  return items
}

/** Posortowana lista unikalnych lekcji z manifestu (numerycznie po sufiksie `lesson_N`, reszta alfabetycznie). */
export function getAvailableLessons(manifest: SpeakSentenceManifestEntry[]): string[] {
  const lessons = [...new Set(manifest.map((entry) => entry.lesson))]
  return lessons.sort((a, b) => {
    const numA = /^lesson_(\d+)$/.exec(a)
    const numB = /^lesson_(\d+)$/.exec(b)
    if (numA && numB) return Number(numA[1]) - Number(numB[1])
    if (numA) return -1
    if (numB) return 1
    return a.localeCompare(b)
  })
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Buduje pełny, z góry ustalony plan sesji: Przebieg 1. odtwarza każde zdanie dokładnie raz, w kolejności
 * `items` (czyli w kolejności z metadata.json / numeracji plików). Kolejne przebiegi są losowe „rundami” —
 * każda runda to potasowany zestaw zdań, które nie wyczerpały jeszcze swojego budżetu powtórzeń; ponieważ
 * dane zdanie występuje w rundzie najwyżej raz, nie może wypaść dwa razy pod rząd w obrębie tej samej rundy.
 * `repeat` to CAŁKOWITA liczba odtworzeń danego zdania (Przebieg 1. liczy się jako jedno z nich).
 */
export function buildSessionPlan(items: EligibleItem[], random: () => number = Math.random): ListeningRound[] {
  const plan: ListeningRound[] = items.map((item) => ({ slug: item.slug, element: item.element }))

  let remaining = items
    .map((item) => ({ slug: item.slug, element: item.element, uses: item.repeat - 1 }))
    .filter((item) => item.uses > 0)

  while (remaining.length > 0) {
    const round = shuffle(remaining, random)
    for (const item of round) plan.push({ slug: item.slug, element: item.element })
    remaining = round.map((item) => ({ ...item, uses: item.uses - 1 })).filter((item) => item.uses > 0)
  }

  return plan
}

/**
 * Szacowany pozostały czas sesji. Realny czas trwania nagrań nie jest nigdzie przechowywany
 * (odtwarzanie kończy się przez event `ended`), więc jako przybliżenie długości jednego odtworzenia
 * przyjmujemy `answerWaitSeconds`. Każda runda to: odtworzenie natywne + docelowe (2×) oraz dwie przerwy
 * o tej samej długości (`answering` i `gap`, 2×) — razem 4×.
 */
export function estimateRemainingSeconds(remainingRounds: number, answerWaitSeconds: number): number {
  return remainingRounds * 4 * answerWaitSeconds
}

/**
 * Szacowany czas trwania całej lekcji, zanim sesja zostanie faktycznie zbudowana (do wyświetlenia na liście
 * lekcji). Sumujemy docelową liczbę odtworzeń każdego zdania (co najmniej 1 — Przebieg 1. zawsze je odtwarza).
 */
export function estimateLessonSeconds(eligible: EligibleItem[], answerWaitSeconds: number): number {
  const totalPlays = eligible.reduce((sum, item) => sum + Math.max(1, item.repeat), 0)
  return estimateRemainingSeconds(totalPlays, answerWaitSeconds)
}

export function formatEstimatedDuration(totalSeconds: number): { hours: number; minutes: number; seconds: number } {
  const total = Math.max(0, Math.round(totalSeconds))
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

export function speakAudioPath(lesson: string, slug: string, lang: AudioLangCode, element: number): string {
  return `/speak/${lesson}/${slug}/${lang}/${element}.mp3`
}

/** Transkrypcja zdania z metadata.json, albo `null` gdy brak wpisu (lekcja/część/język/element nie są jeszcze opisane). */
export function getSpeakText(
  metadata: SpeakMetadata | null,
  lesson: string,
  slug: string,
  lang: AudioLangCode,
  element: number,
): string | null {
  const part = metadata?.[lesson]?.parts?.[slug]
  if (!part) return null
  if (lang === 'es') return part.es?.[element - 1]?.[0] ?? null
  return part[lang]?.[element - 1] ?? null
}

/** Docelowa liczba odtworzeń zdania „es” z metadata.json, albo `DEFAULT_REPEAT_COUNT` gdy brak/niepoprawny wpis. */
export function getSpeakRepeatCount(metadata: SpeakMetadata | null, lesson: string, slug: string, element: number): number {
  const repeat = metadata?.[lesson]?.parts?.[slug]?.es?.[element - 1]?.[1]
  return typeof repeat === 'number' && Number.isFinite(repeat) && repeat > 0 ? repeat : DEFAULT_REPEAT_COUNT
}

/** Pierwsza fraza „es” pierwszej części lekcji — krótki, reprezentatywny wycinek tematu (np. „¿Cuándo?”), albo `null` gdy brak metadanych. */
export function getLessonTopicWord(metadata: SpeakMetadata | null, lesson: string): string | null {
  const parts = metadata?.[lesson]?.parts
  if (!parts) return null
  const firstSlug = Object.keys(parts)[0]
  if (!firstSlug) return null
  return getSpeakText(metadata, lesson, firstSlug, 'es', 1)
}
