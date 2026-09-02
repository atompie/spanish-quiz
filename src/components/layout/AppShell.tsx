import type { ReactNode } from 'react'
import { NavBar, type Screen } from './NavBar'

interface AppShellProps {
  screen: Screen
  onScreenChange: (screen: Screen) => void
  children: ReactNode
}

export function AppShell({ screen, onScreenChange, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <main className="app-main">{children}</main>
      <NavBar current={screen} onChange={onScreenChange} />
    </div>
  )
}
