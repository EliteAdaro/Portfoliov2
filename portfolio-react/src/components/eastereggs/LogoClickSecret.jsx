import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const messages = [
  null,    // 0
  null,    // 1
  null,    // 2
  '🤔',   // 3
  '👀',   // 4
  '🔥',   // 5
  'Almost there...', // 6
  null,    // 7 → trigger
]

export default function LogoClickSecret() {
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
              Achievement unlocked!
            </p>
            <p className="text-lightest-slate font-semibold">
              You found a secret! You&apos;re clearly someone who pays attention to detail.
            </p>
            <p className="text-slate-text text-sm mt-2">
              Fun fact: This portfolio has 7 easter eggs. How many can you find?
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
