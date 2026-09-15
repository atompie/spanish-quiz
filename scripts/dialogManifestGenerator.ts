import fs from 'node:fs'
import path from 'node:path'
import type { AudioLangCode } from '../src/types/speak.ts'
import type { DialogManifestEntry } from '../src/types/dialog.ts'

/**
 * Skanowanie public/dialog/ i zapis public/dialog/manifest.json — logika współdzielona
 * przez CLI (scripts/generate-dialog-manifest.ts) i wtyczkę dev-server
 * (scripts/vite-plugin-dialog-manifest.ts), więc musi być bezstanowa (bez modułowych
 * zmiennych) — wywoływana wielokrotnie w tym samym procesie przez wtyczkę.
 *
 * Prawie kopia scripts/speakManifestGenerator.ts, ale bez poziomu `slug` — dialog nie ma
 * podczęści, tylko kwestie (public/dialog/dialog_N/<lang>/N.mp3 zamiast .../<slug>/<lang>/N.mp3).
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

export function scanDialogManifest(dialogDir: string): { entries: DialogManifestEntry[]; warnings: string[] } {
  const warnings: string[] = []

  if (!fs.existsSync(dialogDir)) return { entries: [], warnings }

  const entries: DialogManifestEntry[] = []

  const dialogDirs = fs
    .readdirSync(dialogDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  for (const dialog of dialogDirs) {
    const dialogPath = path.join(dialogDir, dialog)
    const counts: Partial<Record<AudioLangCode, number>> = {}

    const langDirs = fs
      .readdirSync(dialogPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)

    for (const langDir of langDirs) {
      if (!RECOGNIZED_LANGS.includes(langDir as AudioLangCode)) {
        warnings.push(`${dialog}/${langDir}: nierozpoznany katalog językowy — pomijam`)
        continue
      }
      const count = countContiguousMp3s(path.join(dialogPath, langDir), `${dialog}/${langDir}`, warnings)
      if (count > 0) {
        counts[langDir as AudioLangCode] = count
      }
    }

    if (Object.keys(counts).length === 0) {
      warnings.push(`${dialog}: brak użytecznych nagrań w żadnym języku — pomijam`)
      continue
    }

    entries.push({ dialog, counts })
  }

  return { entries, warnings }
}

export function writeDialogManifest(rootDir: string): { count: number; warnings: string[] } {
  const dialogDir = path.join(rootDir, 'public/dialog')
  const outputFile = path.join(dialogDir, 'manifest.json')

  const { entries, warnings } = scanDialogManifest(dialogDir)
  fs.writeFileSync(outputFile, JSON.stringify(entries, null, 2) + '\n')

  return { count: entries.length, warnings }
}
