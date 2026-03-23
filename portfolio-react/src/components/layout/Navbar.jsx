import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { navLinks } from '../../config/siteData'
import { useScrollSpy } from '../../hooks/useScrollSpy'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeId = useScrollSpy(
    navLinks.map((l) => l.href.replace('#', '')),
    200,
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLinkClick = () => setMobileOpen(false)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-navy/90 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.a
          href="#"
          className="flex items-center gap-2 group"
          whileHover={{ scale: 1.05 }}
        >
          <span className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-navy font-bold text-sm font-mono">
            KN
          </span>
          <span className="hidden sm:block font-semibold text-slate-900 dark:text-lightest-slate group-hover:text-primary transition-colors">
            Kayne Neyens
          </span>
        </motion.a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <a
              key={link.name}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-mono transition-colors ${
                activeId === link.href.replace('#', '')
                  ? 'text-primary'
                  : 'text-slate-600 dark:text-light-slate hover:text-primary dark:hover:text-primary'
              }`}
            >
              <span className="text-primary mr-1">0{i + 1}.</span>
              {link.name}
            </a>
          ))}
          <ThemeToggle />
          <a
            href="/CVKayneNeyens.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-mono hover:bg-primary/10 transition-colors"
          >
            Resume
          </a>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-600 dark:text-light-slate"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-navy-light border-t border-slate-200 dark:border-navy-lighter overflow-hidden"
          >
            <div className="flex flex-col items-center py-6 gap-4">
              {navLinks.map((link, i) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="text-slate-600 dark:text-light-slate hover:text-primary font-mono text-sm"
                >
                  <span className="text-primary">0{i + 1}.</span> {link.name}
                </a>
              ))}
              <a
                href="/CVKayneNeyens.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 border border-primary text-primary rounded-lg text-sm font-mono hover:bg-primary/10 transition-colors"
              >
                Resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
