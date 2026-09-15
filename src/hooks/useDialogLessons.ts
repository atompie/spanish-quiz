import { useEffect, useState } from 'react'
import { getAvailableDialogs } from '../lib/dialogSession'
import type { DialogManifestEntry, DialogMetadata } from '../types/dialog'

const MANIFEST_URL = '/dialog/manifest.json'
const METADATA_URL = '/dialog/metadata.json'

export interface UseDialogLessonsResult {
  /** `null` dopóki trwa ładowanie. */
  dialogs: string[] | null
  metadata: DialogMetadata | null
  hasError: boolean
}

export function useDialogLessons(): UseDialogLessonsResult {
  const [dialogs, setDialogs] = useState<string[] | null>(null)
  const [metadata, setMetadata] = useState<DialogMetadata | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const [manifestResponse, metadataResponse] = await Promise.all([
          fetch(MANIFEST_URL, { cache: 'no-store' }),
          fetch(METADATA_URL, { cache: 'no-store' }),
        ])
        if (!manifestResponse.ok) throw new Error(`HTTP ${manifestResponse.status}`)
        if (!metadataResponse.ok) throw new Error(`HTTP ${metadataResponse.status}`)
        const manifest = (await manifestResponse.json()) as DialogManifestEntry[]
        const fetchedMetadata = (await metadataResponse.json()) as DialogMetadata
        if (!cancelled) {
          setMetadata(fetchedMetadata)
          setDialogs(getAvailableDialogs(manifest))
        }
      } catch {
        if (!cancelled) setHasError(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return { dialogs, metadata, hasError }
}
