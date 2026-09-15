import path from 'node:path'
import type { Plugin } from 'vite'
import { writeDialogManifest } from './dialogManifestGenerator.ts'

const DEBOUNCE_MS = 300

/**
 * Podczas `npm run dev` obserwuje public/dialog/ i na bieżąco przelicza manifest.json,
 * gdy ktoś dorzuci/usunie nagrania bez restartu serwera. `predev`/`prebuild` nadal
 * generują manifest raz na start — ta wtyczka tylko dopina live-reload w trakcie sesji dev.
 */
export function dialogManifestPlugin(): Plugin {
  let root = process.cwd()
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function regenerate() {
    const { count, warnings } = writeDialogManifest(root)
    if (warnings.length > 0) {
      console.warn(`[dialog-manifest] ostrzeżenia (${warnings.length}):`)
      for (const w of warnings) console.warn(`  - ${w}`)
    }
    console.log(`[dialog-manifest] odświeżono — ${count} dialogów, ${warnings.length} ostrzeżeń.`)
  }

  return {
    name: 'dialog-manifest-watch',
    configResolved(config) {
      root = config.root
    },
    configureServer(server) {
      const dialogDir = path.join(root, 'public/dialog')
      const manifestFile = path.join(dialogDir, 'manifest.json')

      regenerate()
      server.watcher.add(dialogDir)

      function onFsEvent(file: string) {
        const resolved = path.resolve(file)
        if (resolved === manifestFile) return
        if (!resolved.startsWith(dialogDir + path.sep)) return

        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(regenerate, DEBOUNCE_MS)
      }

      server.watcher.on('add', onFsEvent)
      server.watcher.on('unlink', onFsEvent)
      server.watcher.on('addDir', onFsEvent)
      server.watcher.on('unlinkDir', onFsEvent)
    },
  }
}
