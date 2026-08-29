import { useCallback, useEffect, useState } from 'react'
import { loadTheme, saveTheme } from '../lib/storage'
import type { Theme } from '../types/theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => loadTheme())

  useEffect(() => {
    if (theme === 'system') {
      delete document.documentElement.dataset.theme
    } else {
      document.documentElement.dataset.theme = theme
    }
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    saveTheme(next)
  }, [])

  return { theme, setTheme }
}
