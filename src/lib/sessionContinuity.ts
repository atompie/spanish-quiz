const SESSION_KEY_PREFIX = 'quiz.session.'

function sessionKey(kind: string): string {
  return `${SESSION_KEY_PREFIX}${kind}`
}

/** Zapisuje wznawialny stan sesji (np. listening/dialog) w `sessionStorage`, keyed per typ sesji.
 * Celowo `sessionStorage`, nie `localStorage` — sesja ma przetrwać jedno zawieszenie/przeładowanie
 * w ramach tej samej wizyty, a nie wracać po dniach jako nieaktualny stan. */
export function saveSessionState<T>(kind: string, state: T): void {
  try {
    sessionStorage.setItem(sessionKey(kind), JSON.stringify(state))
  } catch {
    // sessionStorage niedostępny (np. tryb prywatny) — pomijamy zapis
  }
}

export function loadSessionState<T>(kind: string): T | null {
  try {
    const raw = sessionStorage.getItem(sessionKey(kind))
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function clearSessionState(kind: string): void {
  try {
    sessionStorage.removeItem(sessionKey(kind))
  } catch {
    // ignore
  }
}

interface WakeLockNavigatorLike {
  wakeLock?: {
    request(type: 'screen'): Promise<WakeLockSentinel>
  }
}

export function isWakeLockSupported(nav: WakeLockNavigatorLike = navigator): boolean {
  return typeof nav.wakeLock?.request === 'function'
}

/** Best-effort: zwraca `null` zamiast rzucać, gdy Wake Lock jest niewspierany, odrzucony przez
 * platformę, albo zablokowany (np. oszczędzanie baterii) — funkcja jest niekrytyczna dla działania
 * sesji, więc żaden błąd nie powinien przerywać quizu. */
export async function requestScreenWakeLock(
  nav: WakeLockNavigatorLike = navigator,
): Promise<WakeLockSentinel | null> {
  if (!isWakeLockSupported(nav)) return null
  try {
    return await nav.wakeLock!.request('screen')
  } catch {
    return null
  }
}

export async function releaseScreenWakeLock(lock: WakeLockSentinel | null): Promise<void> {
  if (!lock) return
  try {
    await lock.release()
  } catch {
    // już zwolniony/nieaktywny — nic do zrobienia
  }
}

export interface VisibilityDocumentLike {
  hidden: boolean
  addEventListener(type: 'visibilitychange' | 'pagehide' | 'pageshow', listener: () => void): void
  removeEventListener(type: 'visibilitychange' | 'pagehide' | 'pageshow', listener: () => void): void
}

/** Obserwuje ukrycie/przywrócenie strony przez `visibilitychange` i `pagehide` jednocześnie
 * (na iOS `pagehide` bywa jedynym niezawodnym sygnałem tuż przed zawieszeniem procesu), ale
 * dedupikuje tak, by `onHide`/`onShow` wywołały się dokładnie raz na przejście, nawet gdy oba
 * zdarzenia wystrzelą razem. */
export function observeVisibility(
  doc: VisibilityDocumentLike,
  callbacks: { onHide: () => void; onShow: () => void },
): () => void {
  let isHiddenNotified = false

  function notifyHide() {
    if (isHiddenNotified) return
    isHiddenNotified = true
    callbacks.onHide()
  }

  function notifyShow() {
    if (!isHiddenNotified) return
    isHiddenNotified = false
    callbacks.onShow()
  }

  function handleVisibilityChange() {
    if (doc.hidden) notifyHide()
    else notifyShow()
  }

  function handlePageHide() {
    notifyHide()
  }

  doc.addEventListener('visibilitychange', handleVisibilityChange)
  doc.addEventListener('pagehide', handlePageHide)

  return () => {
    doc.removeEventListener('visibilitychange', handleVisibilityChange)
    doc.removeEventListener('pagehide', handlePageHide)
  }
}
