import fs from 'node:fs'
import path from 'node:path'
import type { AudioLangCode, SpeakSentenceManifestEntry } from '../src/types/speak.ts'

/**
 * Skanowanie public/speak/ i zapis public/speak/manifest.json — logika współdzielona
 * przez CLI (scripts/generate-speak-manifest.ts) i wtyczkę dev-server
 * (scripts/vite-plugin-speak-manifest.ts), więc musi być bezstanowa (bez modułowych
 * zmiennych) — wywoływana wielokrotnie w tym samym procesie przez wtyczkę.
 *
 * Nigdy nie kończy się błędem z powodu niekompletnych/nieprawidłowych nagrań —
 * treść jest dokładana ręcznie z czasem, więc problemy są tylko ostrzeżeniami.
 */

const RECOGNIZED_LANGS: AudioLangCode[] = ['es', 'pl', 'en', 'de']

function countContiguousMp3s(dir: string, label: string, warnings: string[]): number {
  const files = fs.readdirSync(dir, { withFileTypes: true })
  const numbers = files
    .filter((f) => f.isFile())
    .map((f) => /^(\d+)\.mp3$/i.exec(f.name))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]))
    .sort((a, b) => a - b)

  if (numbers.length === 0) return 0

  if (numbers[0] !== 1) {
    warnings.push(`${label}: nagrania nie zaczynają się od 1.mp3 — pomijam`)
    return 0
  }

  let count = 1
  while (numbers.includes(count + 1)) count++

  const hasGap = numbers.some((n) => n > count)
  if (hasGap) {
    warnings.push(`${label}: luka w numeracji po ${count}.mp3 — ignoruję pliki od kolejnego numeru`)
  }

  return count
}

export function scanSpeakManifest(speakDir: string): { entries: SpeakSentenceManifestEntry[]; warnings: string[] } {
  const warnings: string[] = []

  if (!fs.existsSync(speakDir)) return { entries: [], warnings }

  const entries: SpeakSentenceManifestEntry[] = []

  const lessonDirs = fs
    .readdirSync(speakDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  for (const lesson of lessonDirs) {
    const lessonPath = path.join(speakDir, lesson)

    const slugDirs = fs
      .readdirSync(lessonPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()

    for (const slug of slugDirs) {
      const slugPath = path.join(lessonPath, slug)
      const counts: Partial<Record<AudioLangCode, number>> = {}

      const langDirs = fs
        .readdirSync(slugPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)

      for (const langDir of langDirs) {
        if (!RECOGNIZED_LANGS.includes(langDir as AudioLangCode)) {
          warnings.push(`${lesson}/${slug}/${langDir}: nierozpoznany katalog językowy — pomijam`)
          continue
        }
        const count = countContiguousMp3s(path.join(slugPath, langDir), `${lesson}/${slug}/${langDir}`, warnings)
        if (count > 0) {
          counts[langDir as AudioLangCode] = count
        }
      }

      if (Object.keys(counts).length === 0) {
        warnings.push(`${lesson}/${slug}: brak użytecznych nagrań w żadnym języku — pomijam`)
        continue
      }

      entries.push({ slug, lesson, counts })
    }
  }

  return { entries, warnings }
}

export function writeSpeakManifest(rootDir: string): { count: number; warnings: string[] } {
  const speakDir = path.join(rootDir, 'public/speak')
  const outputFile = path.join(speakDir, 'manifest.json')

  const { entries, warnings } = scanSpeakManifest(speakDir)
  fs.writeFileSync(outputFile, JSON.stringify(entries, null, 2) + '\n')

  return { count: entries.length, warnings }
}
