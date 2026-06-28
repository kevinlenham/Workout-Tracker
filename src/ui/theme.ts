import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'workouts-theme'
const THEME_COLORS: Record<ThemeMode, string> = {
  light: '#f8fafc',
  dark: '#20242c',
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

export function getStoredTheme(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return isThemeMode(stored) ? stored : 'light'
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLORS[theme])
}

export function initializeTheme() {
  applyTheme(getStoredTheme())
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme())

  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  return { theme, setTheme: setThemeState }
}
