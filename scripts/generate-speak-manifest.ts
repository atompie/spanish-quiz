import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeSpeakManifest } from './speakManifestGenerator.ts'

/**
 * Generuje public/speak/manifest.json ze skanu public/speak/.
 * Uruchamiane automatycznie przed `npm run dev` / `npm run build` (predev/prebuild),
 * a w trakcie `npm run dev` również na bieżąco przez scripts/vite-plugin-speak-manifest.ts.
 * Ręczne odświeżenie: npm run generate:speak-manifest
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const { count, warnings } = writeSpeakManifest(ROOT)

if (warnings.length > 0) {
  console.warn(`Ostrzeżenia (${warnings.length}):`)
  for (const w of warnings) console.warn(`  - ${w}`)
}
console.log(`Wygenerowano public/speak/manifest.json — ${count} zdań, ${warnings.length} ostrzeżeń.`)
