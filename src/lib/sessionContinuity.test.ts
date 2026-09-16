import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearSessionState,
  isWakeLockSupported,
  loadSessionState,
  observeVisibility,
  releaseScreenWakeLock,
  requestScreenWakeLock,
  saveSessionState,
  type VisibilityDocumentLike,
} from './sessionContinuity'

/** Środowisko testowe nie ładuje jsdom, więc `sessionStorage` nie istnieje globalnie — symulujemy
 * go minimalnym shimem w pamięci, tak jak storage.test.ts robi to dla `localStorage`. */
function installSessionStorageShim() {
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
  Object.defineProperty(globalThis, 'sessionStorage', { value: shim, writable: true, configurable: true })
}

describe('session state persistence', () => {
  beforeEach(() => {
    installSessionStorageShim()
  })

  it('loads as null when nothing is stored', () => {
    expect(loadSessionState('listening')).toBeNull()
  })

  it('round-trips saved state', () => {
    const state = { lesson: 'lesson_A1.1.1', roundIndex: 3, phase: 'answering' }
    saveSessionState('listening', state)
    expect(loadSessionState('listening')).toEqual(state)
  })

  it('keeps state for different kinds independent', () => {
    saveSessionState('listening', { roundIndex: 1 })
    saveSessionState('dialog', { turnIndex: 2 })
    expect(loadSessionState('listening')).toEqual({ roundIndex: 1 })
    expect(loadSessionState('dialog')).toEqual({ turnIndex: 2 })
  })

  it('loads as null instead of throwing when the stored value is corrupt', () => {
    sessionStorage.setItem('quiz.session.listening', '{not json')
    expect(loadSessionState('listening')).toBeNull()
  })

  it('clears stored state', () => {
    saveSessionState('listening', { roundIndex: 1 })
    clearSessionState('listening')
    expect(loadSessionState('listening')).toBeNull()
  })
})

describe('screen wake lock', () => {
  it('reports unsupported when navigator has no wakeLock', () => {
    expect(isWakeLockSupported({})).toBe(false)
  })

  it('reports supported when navigator exposes wakeLock.request', () => {
    expect(isWakeLockSupported({ wakeLock: { request: vi.fn() } })).toBe(true)
  })

  it('requests a lock and returns it when supported', async () => {
    const sentinel = { release: vi.fn() } as unknown as WakeLockSentinel
    const nav = { wakeLock: { request: vi.fn().mockResolvedValue(sentinel) } }
    const lock = await requestScreenWakeLock(nav)
    expect(nav.wakeLock.request).toHaveBeenCalledWith('screen')
    expect(lock).toBe(sentinel)
  })

  it('returns null instead of throwing when unsupported', async () => {
    await expect(requestScreenWakeLock({})).resolves.toBeNull()
  })

  it('returns null instead of throwing when the request rejects', async () => {
    const nav = { wakeLock: { request: vi.fn().mockRejectedValue(new Error('denied')) } }
    await expect(requestScreenWakeLock(nav)).resolves.toBeNull()
  })

  it('releases a held lock', async () => {
    const release = vi.fn().mockResolvedValue(undefined)
    await releaseScreenWakeLock({ release } as unknown as WakeLockSentinel)
    expect(release).toHaveBeenCalled()
  })

  it('does nothing when releasing a null lock', async () => {
    await expect(releaseScreenWakeLock(null)).resolves.toBeUndefined()
  })

  it('swallows an error thrown while releasing an already-released lock', async () => {
    const release = vi.fn().mockRejectedValue(new Error('already released'))
    await expect(releaseScreenWakeLock({ release } as unknown as WakeLockSentinel)).resolves.toBeUndefined()
  })
})

describe('observeVisibility', () => {
  function createDocStub(): VisibilityDocumentLike & {
    dispatch(type: 'visibilitychange' | 'pagehide' | 'pageshow'): void
  } {
    const listeners: Record<string, Array<() => void>> = {}
    return {
      hidden: false,
      addEventListener(type, listener) {
        listeners[type] ??= []
        listeners[type].push(listener)
      },
      removeEventListener(type, listener) {
        listeners[type] = (listeners[type] ?? []).filter((l) => l !== listener)
      },
      dispatch(type) {
        for (const listener of listeners[type] ?? []) listener()
      },
    }
  }

  it('fires onHide once when the page becomes hidden', () => {
    const doc = createDocStub()
    const onHide = vi.fn()
    const onShow = vi.fn()
    observeVisibility(doc, { onHide, onShow })

    doc.hidden = true
    doc.dispatch('visibilitychange')

    expect(onHide).toHaveBeenCalledTimes(1)
    expect(onShow).not.toHaveBeenCalled()
  })

  it('fires onShow once when the page becomes visible again', () => {
    const doc = createDocStub()
    const onHide = vi.fn()
    const onShow = vi.fn()
    observeVisibility(doc, { onHide, onShow })

    doc.hidden = true
    doc.dispatch('visibilitychange')
    doc.hidden = false
    doc.dispatch('visibilitychange')

    expect(onHide).toHaveBeenCalledTimes(1)
    expect(onShow).toHaveBeenCalledTimes(1)
  })

  it('does not double-fire onHide when pagehide and visibilitychange both fire', () => {
    const doc = createDocStub()
    const onHide = vi.fn()
    const onShow = vi.fn()
    observeVisibility(doc, { onHide, onShow })

    doc.hidden = true
    doc.dispatch('visibilitychange')
    doc.dispatch('pagehide')

    expect(onHide).toHaveBeenCalledTimes(1)
  })

  it('stops notifying after unsubscribe', () => {
    const doc = createDocStub()
    const onHide = vi.fn()
    const onShow = vi.fn()
    const unsubscribe = observeVisibility(doc, { onHide, onShow })

    unsubscribe()
    doc.hidden = true
    doc.dispatch('visibilitychange')

    expect(onHide).not.toHaveBeenCalled()
  })
})
