import { useEffect, useState } from 'react'
import type { Noun, NounMetadata } from '../types/noun'

const METADATA_URL = '/vocabulary/nouns/metadata.json'

export interface UseNounsResult {
  /** `null` dopóki trwa ładowanie. */
  nouns: Noun[] | null
  hasError: boolean
}

export function useNouns(): UseNounsResult {
  const [nouns, setNouns] = useState<Noun[] | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const response = await fetch(METADATA_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const metadata = (await response.json()) as NounMetadata
        if (!cancelled) {
          setNouns(
            Object.entries(metadata).map(([id, { es, ...translations }]) => ({ id, es, translations })),
          )
        }
      } catch {
        if (!cancelled) setHasError(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return { nouns, hasError }
}
