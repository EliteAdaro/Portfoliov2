import { createContext, useContext, useEffect, useState } from 'react'

const LanguageContext = createContext()

export const LANGUAGES = [
  { code: 'nl', label: 'Nederlands', short: 'NL', flag: '🇳🇱' },
  { code: 'en', label: 'English',    short: 'EN', flag: '🇬🇧' },
]

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language')
      if (saved && LANGUAGES.some((l) => l.code === saved)) return saved
      const browser = navigator.language?.slice(0, 2)
      if (browser === 'nl') return 'nl'
    }
    return 'en'
  })

  useEffect(() => {
    document.documentElement.lang = language
    localStorage.setItem('language', language)
  }, [language])

  const toggleLanguage = () =>
    setLanguage((l) => (l === 'nl' ? 'en' : 'nl'))

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
