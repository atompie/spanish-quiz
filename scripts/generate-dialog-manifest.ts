import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeDialogManifest } from './dialogManifestGenerator.ts'

/**
 * Generuje public/dialog/manifest.json ze skanu public/dialog/.
 * Uruchamiane automatycznie przed `npm run dev` / `npm run build` (predev/prebuild),
 * a w trakcie `npm run dev` również na bieżąco przez scripts/vite-plugin-dialog-manifest.ts.
 * Ręczne odświeżenie: npm run generate:dialog-manifest
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const { count, warnings } = writeDialogManifest(ROOT)

if (warnings.length > 0) {
  console.warn(`Ostrzeżenia (${warnings.length}):`)
  for (const w of warnings) console.warn(`  - ${w}`)
}
console.log(`Wygenerowano public/dialog/manifest.json — ${count} dialogów, ${warnings.length} ostrzeżeń.`)
