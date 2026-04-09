import { motion } from 'framer-motion'
import { Languages } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage()
  const next = language === 'nl' ? 'EN' : 'NL'

  return (
    <motion.button
      onClick={toggleLanguage}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-1.5 p-2 rounded-lg text-slate-600 dark:text-light-slate hover:text-primary dark:hover:text-primary transition-colors font-mono text-xs"
      aria-label={`Switch language to ${next}`}
      title={`Switch to ${next}`}
    >
      <Languages size={18} />
      <span className="font-semibold">{language.toUpperCase()}</span>
    </motion.button>
  )
}
