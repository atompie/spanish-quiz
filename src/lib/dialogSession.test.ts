import { describe, expect, it } from 'vitest'
import {
  buildDialogPlan,
  findDialogManifestEntry,
  hasRecording,
  pauseFromDuration,
  resolveNativeStepMode,
  sideForIndex,
  speakerForTurn,
  waitFromAudioDuration,
  waitFromWordCount,
} from './dialogSession'
import type { DialogManifestEntry } from '../types/dialog'

describe('waitFromAudioDuration', () => {
  it('clamps very short durations to the minimum', () => {
    expect(waitFromAudioDuration(0)).toBe(2)
  })

  it('clamps very long durations to the maximum', () => {
    expect(waitFromAudioDuration(100)).toBe(15)
  })

  it('applies the 1.5x + 1s formula in the middle range', () => {
    expect(waitFromAudioDuration(4)).toBe(4 * 1.5 + 1)
  })
})

describe('waitFromWordCount', () => {
  it('clamps very short texts to the minimum', () => {
    expect(waitFromWordCount('Hola')).toBe(2)
  })

  it('clamps very long texts to the maximum', () => {
    expect(waitFromWordCount(new Array(50).fill('palabra').join(' '))).toBe(15)
  })

  it('applies the 0.6*words + 1s formula in the middle range', () => {
    const text = 'una dos tres cuatro cinco seis siete ocho nueve diez'
    expect(waitFromWordCount(text)).toBe(0.6 * 10 + 1)
  })
})

describe('pauseFromDuration', () => {
  it('clamps very short durations to the minimum', () => {
    expect(pauseFromDuration(1)).toBe(2)
  })

  it('clamps very long durations to the maximum', () => {
    expect(pauseFromDuration(100)).toBe(15)
  })

  it('applies the 0.85x formula in the middle range', () => {
    expect(pauseFromDuration(10)).toBe(8.5)
  })
})

describe('speakerForTurn', () => {
  it('mode-a: native speaker takes even indices, learner takes odd indices', () => {
    expect(speakerForTurn(0, 'mode-a')).toBe('native')
    expect(speakerForTurn(1, 'mode-a')).toBe('learner')
    expect(speakerForTurn(2, 'mode-a')).toBe('native')
  })

  it('mode-b: learner takes even indices, native speaker takes odd indices', () => {
    expect(speakerForTurn(0, 'mode-b')).toBe('learner')
    expect(speakerForTurn(1, 'mode-b')).toBe('native')
    expect(speakerForTurn(2, 'mode-b')).toBe('learner')
  })
})

describe('sideForIndex', () => {
  it('puts even indices on the left', () => {
    expect(sideForIndex(0)).toBe('left')
    expect(sideForIndex(2)).toBe('left')
  })

  it('puts odd indices on the right', () => {
    expect(sideForIndex(1)).toBe('right')
    expect(sideForIndex(3)).toBe('right')
  })
})

describe('buildDialogPlan', () => {
  it('runs mode-a in full, then mode-b in full, matching the spec sequence', () => {
    const plan = buildDialogPlan(3)
    expect(plan).toEqual([
      { index: 0, mode: 'mode-a', speaker: 'native' },
      { index: 1, mode: 'mode-a', speaker: 'learner' },
      { index: 2, mode: 'mode-a', speaker: 'native' },
      { index: 0, mode: 'mode-b', speaker: 'learner' },
      { index: 1, mode: 'mode-b', speaker: 'native' },
      { index: 2, mode: 'mode-b', speaker: 'learner' },
    ])
  })
})

describe('hasRecording / missing-recording detection', () => {
  const entry: DialogManifestEntry = { dialog: 'dialog_1', counts: { es: 3, pl: 2 } }

  it('flags a turn as present when its index is within the manifest count', () => {
    expect(hasRecording(entry, 'es', 3)).toBe(true)
  })

  it('flags a turn as missing when its index exceeds the manifest count', () => {
    expect(hasRecording(entry, 'pl', 3)).toBe(false)
  })

  it('flags every turn as missing when the language is absent from the manifest entry', () => {
    expect(hasRecording(entry, 'de', 1)).toBe(false)
  })

  it('flags every turn as missing when the dialog itself is absent from the manifest', () => {
    expect(hasRecording(findDialogManifestEntry([entry], 'dialog_2'), 'es', 1)).toBe(false)
  })
})

describe('resolveNativeStepMode', () => {
  const entry: DialogManifestEntry = { dialog: 'dialog_1', counts: { es: 3, pl: 2 } }

  it('plays when audio is enabled and the recording exists', () => {
    expect(resolveNativeStepMode(true, entry, 'pl', 2)).toBe('play')
  })

  it('is text-only (single wait) when audio is disabled but the recording exists', () => {
    expect(resolveNativeStepMode(false, entry, 'pl', 2)).toBe('text-only')
  })

  it('is missing when audio is enabled but the recording does not exist', () => {
    expect(resolveNativeStepMode(true, entry, 'pl', 3)).toBe('missing')
  })

  it('is missing when audio is disabled and the recording does not exist', () => {
    expect(resolveNativeStepMode(false, entry, 'pl', 3)).toBe('missing')
  })
})
