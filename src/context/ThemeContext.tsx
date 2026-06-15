import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'

type Theme = 'dark' | 'light'

export interface ChartColors {
  grid: string
  tick: string
  rpm: string
  rpmTarget: string
  pwm: string
  error: string
  zero: string
}

interface ThemeContextValue {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
  chart: ChartColors
}

const DARK_CHART: ChartColors = {
  grid:      '#2e2454',
  tick:      '#7B6DAA',
  rpm:       '#00c853',
  rpmTarget: '#ffab00',
  pwm:       '#ffab00',
  error:     '#7C3AED',
  zero:      'rgba(255,255,255,0.12)',
}

const LIGHT_CHART: ChartColors = {
  grid:      '#e5dff5',
  tick:      '#9990b0',
  rpm:       '#6D28D9',
  rpmTarget: '#9990b0',
  pwm:       '#6D28D9',
  error:     '#7C3AED',
  zero:      'rgba(109,40,217,0.2)',
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }, [])

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      chart: theme === 'dark' ? DARK_CHART : LIGHT_CHART,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
