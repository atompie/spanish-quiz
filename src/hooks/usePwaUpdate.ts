import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export type PwaUpdateStatus = 'idle' | 'checking' | 'up-to-date' | 'update-available'

/**
 * Wraps vite-plugin-pwa's registration hook to drive a manual "check for
 * update" / "install update" button instead of the plugin's own silent
 * auto-update (registerType: 'prompt' in vite.config.ts), since auto-applying
 * a new service worker could yank the user out mid-quiz.
 */
export function usePwaUpdate() {
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined)
  const [status, setStatus] = useState<PwaUpdateStatus>('idle')

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swScriptUrl, registration) {
      registrationRef.current = registration
    },
  })

  useEffect(() => {
    if (needRefresh) setStatus('update-available')
  }, [needRefresh])

  async function checkForUpdate() {
    if (needRefresh) {
      await updateServiceWorker(true)
      return
    }
    const registration = registrationRef.current
    if (!registration) return

    setStatus('checking')
    let foundUpdate = false
    const onUpdateFound = () => {
      foundUpdate = true
    }
    registration.addEventListener('updatefound', onUpdateFound)
    await registration.update()
    registration.removeEventListener('updatefound', onUpdateFound)
    if (!foundUpdate) setStatus('up-to-date')
  }

  return { status, checkForUpdate }
}
