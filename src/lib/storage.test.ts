import { beforeEach, describe, expect, it } from 'vitest'
import { loadDialogNativeAudioEnabled, saveDialogNativeAudioEnabled } from './storage'

/** Środowisko testowe nie ładuje jsdom, więc `localStorage` nie istnieje globalnie — symulujemy
 * go minimalnym shimem w pamięci, wystarczającym dla `getItem`/`setItem`/`clear` używanych w storage.ts. */
function installLocalStorageShim() {
  let store: Record<string, string> = {}
  const shim: Storage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = value
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    key: (index) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length
    },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: shim, writable: true, configurable: true })
}

describe('dialogNativeAudioEnabled storage', () => {
  beforeEach(() => {
    installLocalStorageShim()
  })

  it('loads as false when no value is stored', () => {
    expect(loadDialogNativeAudioEnabled()).toBe(false)
  })

  it('round-trips a saved value', () => {
    saveDialogNativeAudioEnabled(true)
    expect(loadDialogNativeAudioEnabled()).toBe(true)

    saveDialogNativeAudioEnabled(false)
    expect(loadDialogNativeAudioEnabled()).toBe(false)
  })
})
