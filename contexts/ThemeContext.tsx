'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ThemeType, THEMES, ThemeConfig } from '@/lib/themeConfig'

interface ThemeContextType {
  theme: ThemeType
  themeConfig: ThemeConfig
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('halloween')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('house-rating-theme') as ThemeType
    if (savedTheme && (savedTheme === 'halloween' || savedTheme === 'christmas')) {
      setThemeState(savedTheme)
    }
  }, [])

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme)
    localStorage.setItem('house-rating-theme', newTheme)
  }

  const themeConfig = THEMES[theme]

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
