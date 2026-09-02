import path from 'node:path'
import type { Plugin } from 'vite'
import { writeSpeakManifest } from './speakManifestGenerator.ts'

const DEBOUNCE_MS = 300

/**
 * Podczas `npm run dev` obserwuje public/speak/ i na bieżąco przelicza manifest.json,
 * gdy ktoś dorzuci/usunie nagrania bez restartu serwera. `predev`/`prebuild` nadal
 * generują manifest raz na start — ta wtyczka tylko dopina live-reload w trakcie sesji dev.
 */
export function speakManifestPlugin(): Plugin {
  let root = process.cwd()
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function regenerate() {
    const { count, warnings } = writeSpeakManifest(root)
    if (warnings.length > 0) {
      console.warn(`[speak-manifest] ostrzeżenia (${warnings.length}):`)
      for (const w of warnings) console.warn(`  - ${w}`)
    }
    console.log(`[speak-manifest] odświeżono — ${count} zdań, ${warnings.length} ostrzeżeń.`)
  }

  return {
    name: 'speak-manifest-watch',
    configResolved(config) {
      root = config.root
    },
    configureServer(server) {
      const speakDir = path.join(root, 'public/speak')
      const manifestFile = path.join(speakDir, 'manifest.json')

      regenerate()
      server.watcher.add(speakDir)

      function onFsEvent(file: string) {
        const resolved = path.resolve(file)
        if (resolved === manifestFile) return
        if (!resolved.startsWith(speakDir + path.sep)) return

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
