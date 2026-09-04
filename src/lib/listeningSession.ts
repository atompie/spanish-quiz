import type { LanguageCode } from '../types/language'
import type {
  AudioLangCode,
  EligibleSentence,
  ListeningRound,
  SentenceUsageState,
  SpeakMetadata,
  SpeakSentenceManifestEntry,
} from '../types/speak'

export const SESSION_POOL_SIZE = 20
/** Ile razy ma zostać powtórzony każdy element (mp3) danego zdania — nie sama liczba użyć zdania. */
export const MAX_USES_PER_ELEMENT = 3

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function getEligibleSentences(
  manifest: SpeakSentenceManifestEntry[],
  nativeLanguage: LanguageCode,
  lesson: string,
): EligibleSentence[] {
  const eligible: EligibleSentence[] = []
  for (const entry of manifest) {
    if (entry.lesson !== lesson) continue
    const esCount = entry.counts.es ?? 0
    const nativeCount = entry.counts[nativeLanguage] ?? 0
    if (esCount > 0 && nativeCount > 0) {
      eligible.push({ slug: entry.slug, elementCount: Math.min(esCount, nativeCount) })
    }
  }
  return eligible
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

export function buildSessionPool(
  eligible: EligibleSentence[],
  poolSize: number = SESSION_POOL_SIZE,
  random: () => number = Math.random,
): EligibleSentence[] {
  return shuffle(eligible, random).slice(0, Math.min(poolSize, eligible.length))
}

export function initUsageState(pool: EligibleSentence[]): SentenceUsageState[] {
  return pool.map((sentence) => ({
    slug: sentence.slug,
    elementCount: sentence.elementCount,
    elementUsesRemaining: Array(sentence.elementCount).fill(MAX_USES_PER_ELEMENT),
    everUsed: false,
  }))
}

export function pickNextRound(
  usage: SentenceUsageState[],
  random: () => number = Math.random,
): { round: ListeningRound; nextUsage: SentenceUsageState[] } | null {
  const candidates = usage.filter((u) => u.elementUsesRemaining.some((n) => n > 0))
  if (candidates.length === 0) return null

  const chosen = candidates[Math.floor(random() * candidates.length)]

  let elementIndex: number
  if (!chosen.everUsed) {
    elementIndex = 0
  } else {
    const eligibleIndices = chosen.elementUsesRemaining
      .map((n, idx) => (n > 0 ? idx : -1))
      .filter((idx) => idx !== -1)
    elementIndex = eligibleIndices[Math.floor(random() * eligibleIndices.length)]
  }

  const nextUsage = usage.map((u) =>
    u.slug === chosen.slug
      ? {
          ...u,
          elementUsesRemaining: u.elementUsesRemaining.map((n, idx) => (idx === elementIndex ? n - 1 : n)),
          everUsed: true,
        }
      : u,
  )

  return { round: { slug: chosen.slug, element: elementIndex + 1 }, nextUsage }
}

export function totalRounds(pool: EligibleSentence[]): number {
  return pool.reduce((sum, s) => sum + s.elementCount * MAX_USES_PER_ELEMENT, 0)
}

export function usesConsumed(usage: SentenceUsageState[]): number {
  return usage.reduce(
    (sum, u) => sum + u.elementUsesRemaining.reduce((s, n) => s + (MAX_USES_PER_ELEMENT - n), 0),
    0,
  )
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
 * lekcji). Sesja losuje `sentenceCount` zdań spośród `eligible`, więc do oszacowania liczby elementów
 * używamy średniej liczby elementów na zdanie z całej puli kwalifikujących się zdań.
 */
export function estimateLessonSeconds(
  eligible: EligibleSentence[],
  sentenceCount: number,
  answerWaitSeconds: number,
): number {
  if (eligible.length === 0) return 0
  const avgElementsPerSentence = eligible.reduce((sum, s) => sum + s.elementCount, 0) / eligible.length
  const sampledSentences = Math.min(sentenceCount, eligible.length)
  const estimatedRounds = sampledSentences * avgElementsPerSentence * MAX_USES_PER_ELEMENT
  return estimateRemainingSeconds(estimatedRounds, answerWaitSeconds)
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
  return metadata?.[lesson]?.parts?.[slug]?.[lang]?.[element - 1] ?? null
}
