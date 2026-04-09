import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'

export default function LogoClickSecret() {
  const { t } = useLanguage()
  const messages = [
    null, null, null,
    '🤔', '👀', '🔥',
    t('eastereggs.almost'),
    null,
  ]
  const [clicks, setClicks] = useState(0)
  const [show, setShow] = useState(false)
  const [hint, setHint] = useState(null)

  useEffect(() => {
    const logo = document.querySelector('[data-logo]')
    if (!logo) return

    const handleClick = () => {
      setClicks((c) => {
        const next = c + 1
        if (next >= 7) {
          setShow(true)
          setTimeout(() => setShow(false), 5000)
          return 0
        }
        setHint(messages[next])
        if (messages[next]) {
          setTimeout(() => setHint(null), 1000)
        }
        return next
      })
    }

    logo.addEventListener('click', handleClick)
    return () => logo.removeEventListener('click', handleClick)
  }, [])

  return (
    <>
      {/* Hint bubbles */}
      <AnimatePresence>
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-16 left-6 z-[9999] text-2xl pointer-events-none"
          >
            {hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret panel */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] p-6 rounded-xl bg-navy-light border border-primary/50 shadow-2xl shadow-primary/20 text-center max-w-sm"
          >
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-primary font-mono text-sm mb-2">
              {t('eastereggs.achievement')}
            </p>
            <p className="text-lightest-slate font-semibold">
              {t('eastereggs.foundSecret')}
            </p>
            <p className="text-slate-text text-sm mt-2">
              {t('eastereggs.funFact')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
