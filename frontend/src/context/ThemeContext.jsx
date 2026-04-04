import { createContext, useContext, useEffect, useState } from 'react'
import { templateAPI } from '../api/services'

const ThemeContext = createContext(null)

const THEMES = [
  { name: 'Teal',   color: '#0F9E7B', light: '#E6F7F3' },
  { name: 'Blue',   color: '#2563EB', light: '#EFF6FF' },
  { name: 'Purple', color: '#7C3AED', light: '#F5F3FF' },
  { name: 'Gold',   color: '#F0BF4C', light: '#FFFBEB' },
  { name: 'Rose',   color: '#E11D48', light: '#FFF1F2' },
  { name: 'Slate',  color: '#475569', light: '#F1F5F9' },
]

function applyTheme(color) {
  if (!color) return
  const theme = THEMES.find(t => t.color === color) || THEMES[0]
  document.documentElement.style.setProperty('--primary', theme.color)
  document.documentElement.style.setProperty('--primary-light', theme.light)
}

export function ThemeProvider({ children }) {
  const [themeColor, setThemeColor] = useState('#0F9E7B')

  // Load theme from backend on mount
  const loadTheme = async () => {
    try {
      const r = await templateAPI.getLetterhead()
      const color = r.data.data?.themeColor
      if (color) {
        setThemeColor(color)
        applyTheme(color)
      }
    } catch {}
  }

  useEffect(() => {
    applyTheme(themeColor)
  }, [themeColor])

  const changeTheme = async (color) => {
    setThemeColor(color)
    applyTheme(color)
    // Save to backend
    try {
      const r = await templateAPI.getLetterhead()
      const existing = r.data.data || {}
      await templateAPI.saveLetterhead({ ...existing, themeColor: color })
    } catch {}
  }

  return (
    <ThemeContext.Provider value={{ themeColor, changeTheme, loadTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)