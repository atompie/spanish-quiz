import { useEffect, useState } from 'react'
import { getAvailableLessons } from '../lib/listeningSession'
import type { SpeakSentenceManifestEntry } from '../types/speak'

const MANIFEST_URL = '/speak/manifest.json'

export interface UseSpeakLessonsResult {
  /** `null` dopóki trwa ładowanie. */
  lessons: string[] | null
  hasError: boolean
}

export function useSpeakLessons(): UseSpeakLessonsResult {
  const [lessons, setLessons] = useState<string[] | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const response = await fetch(MANIFEST_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const manifest = (await response.json()) as SpeakSentenceManifestEntry[]
        if (!cancelled) setLessons(getAvailableLessons(manifest))
      } catch {
        if (!cancelled) setHasError(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return { lessons, hasError }
}
