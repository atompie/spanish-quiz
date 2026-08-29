import type { ReactNode } from 'react'
import { useTranslation } from '../../i18n/LanguageContext'
import { NavBar, type Screen } from './NavBar'

interface AppShellProps {
  screen: Screen
  onScreenChange: (screen: Screen) => void
  children: ReactNode
}

export function AppShell({ screen, onScreenChange, children }: AppShellProps) {
  const { t } = useTranslation()
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>{t.appTitle}</h1>
      </header>
      <main className="app-main">{children}</main>
      <NavBar current={screen} onChange={onScreenChange} />
    </div>
  )
}
