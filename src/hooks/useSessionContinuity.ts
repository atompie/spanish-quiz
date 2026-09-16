import { useEffect, useRef } from 'react'
import { observeVisibility, releaseScreenWakeLock, requestScreenWakeLock } from '../lib/sessionContinuity'

/** Utrzymuje ekran obudzony, gdy `isActive` jest `true` (np. sesja odtwarza audio lub czeka na
 * odpowiedź), i zgłasza ukrycie/przywrócenie strony przez `onHide`/`onShow` — używane przez sesje
 * listening/dialog do zapobiegania blokadzie ekranu w trakcie aktywnego użycia oraz do wykrycia
 * zwinięcia aplikacji w tło. Best-effort: brak wsparcia Wake Lock nigdy nie przerywa sesji. */
export function useSessionContinuity(
  isActive: boolean,
  onHide: () => void,
  onShow: () => void,
): void {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const onHideRef = useRef(onHide)
  const onShowRef = useRef(onShow)

  useEffect(() => {
    onHideRef.current = onHide
  }, [onHide])
  useEffect(() => {
    onShowRef.current = onShow
  }, [onShow])

  useEffect(() => {
    if (!isActive) return

    let cancelled = false
    void requestScreenWakeLock().then((lock) => {
      if (cancelled) {
        void releaseScreenWakeLock(lock)
        return
      }
      wakeLockRef.current = lock
    })

    return () => {
      cancelled = true
      void releaseScreenWakeLock(wakeLockRef.current)
      wakeLockRef.current = null
    }
  }, [isActive])

  useEffect(() => {
    return observeVisibility(document, {
      onHide: () => onHideRef.current(),
      onShow: () => onShowRef.current(),
    })
  }, [])
}
