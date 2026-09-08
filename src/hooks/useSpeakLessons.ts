import { useEffect, useState } from 'react'
import { getAvailableLessons } from '../lib/listeningSession'
import type { SpeakMetadata, SpeakSentenceManifestEntry } from '../types/speak'

const MANIFEST_URL = '/speak/manifest.json'
const METADATA_URL = '/speak/metadata.json'

export interface UseSpeakLessonsResult {
  /** `null` dopóki trwa ładowanie. */
  lessons: string[] | null
  /** Surowy manifest (do wyliczeń typu szacowany czas trwania lekcji), `null` dopóki trwa ładowanie. */
  manifest: SpeakSentenceManifestEntry[] | null
  /** Transkrypcje zdań (do wyciągania np. reprezentatywnego słowa tematu), `null` dopóki trwa ładowanie lub gdy się nie powiodło. */
  metadata: SpeakMetadata | null
  hasError: boolean
}

export function useSpeakLessons(): UseSpeakLessonsResult {
  const [lessons, setLessons] = useState<string[] | null>(null)
  const [manifest, setManifest] = useState<SpeakSentenceManifestEntry[] | null>(null)
  const [metadata, setMetadata] = useState<SpeakMetadata | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const response = await fetch(MANIFEST_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = (await response.json()) as SpeakSentenceManifestEntry[]
        if (!cancelled) {
          setManifest(data)
          setLessons(getAvailableLessons(data))
        }
      } catch {
        if (!cancelled) setHasError(true)
      }
    })()

    void (async () => {
      try {
        const response = await fetch(METADATA_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = (await response.json()) as SpeakMetadata
        if (!cancelled) setMetadata(data)
      } catch {
        // Brak transkrypcji nie blokuje wyboru lekcji — używane tylko jako opcjonalny podgląd tematu.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return { lessons, manifest, metadata, hasError }
}
