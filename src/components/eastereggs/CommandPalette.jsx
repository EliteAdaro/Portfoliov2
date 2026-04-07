import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GamesHubModal from './games/GamesHubModal'
import GameModal from './games/GameModal'

const COMMANDS = {
  help: {
    description: 'Show available commands',
    output: `Available commands:
  about      — Who is Kayne?
  skills     — Technical skills
  projects   — View projects
  contact    — Get in touch
  resume     — Download CV
  theme      — Toggle dark/light mode
  games      — 🎮 Browse all mini-games
  snake      — 🐍 Quick-launch Snake
  clear      — Clear terminal
  sudo hire kayne — ???
  exit       — Close terminal`,
  },
  games: {
    description: 'Browse all mini-games',
    openGames: true,
  },
  snake: {
    description: 'Play Snake game',
    openGame: 'snake',
  },
  about: {
    description: 'About Kayne',
    action: () => {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
      return 'Navigating to About section...'
    },
  },
  skills: {
    description: 'View skills',
    action: () => {
      document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })
      return 'Navigating to Skills section...'
    },
  },
  projects: {
    description: 'View projects',
    action: () => {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
      return 'Navigating to Projects section...'
    },
  },
  contact: {
    description: 'Contact info',
    action: () => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      return 'Navigating to Contact section...'
    },
  },
  resume: {
    description: 'Open resume',
    action: () => {
      window.open('/CVKayneNeyens.pdf', '_blank')
      return 'Opening resume in new tab...'
    },
  },
  theme: {
    description: 'Toggle theme',
    action: () => {
      document.documentElement.classList.toggle('dark')
      document.documentElement.classList.toggle('light')
      return 'Theme toggled!'
    },
  },
  'sudo hire kayne': {
    description: '???',
    output: `
  ✅ Permission granted.
  ✅ Deploying Kayne to your team...
  ✅ Loading enthusiasm...    [██████████] 100%
  ✅ Loading creativity...    [██████████] 100%
  ✅ Loading coffee intake... [██████████] 100%

  🚀 Kayne successfully hired!

  (Just kidding... unless? 😏)
  Contact: kayne.99@hotmail.com`,
  },
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [gamesHubOpen, setGamesHubOpen] = useState(false)
  const [activeGame, setActiveGame] = useState(null)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([
    { type: 'ascii', text: `  _  __                       _   _
 | |/ /__ _ _  _ _ _  ___   | \\ | |
 | ' </ _\` | || | ' \\/ -_)  |  \\| |
 |_|\\_\\__,_|\\_, |_||_\\___|  |_|\\__|
            |__/` },
    { type: 'system', text: '⚡ Terminal ready — Type "help" for available commands' },
  ])
  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  const closeAll = useCallback(() => {
    setOpen(false)
    setGamesHubOpen(false)
    setActiveGame(null)
    setInput('')
  }, [])

  // Esc closes the topmost modal in the stack (game → hub → terminal)
  const closeTopmost = useCallback(() => {
    if (activeGame) setActiveGame(null)
    else if (gamesHubOpen) setGamesHubOpen(false)
    else closeAll()
  }, [activeGame, gamesHubOpen, closeAll])

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (open) closeAll()
        else setOpen(true)
      }
      if (e.key === 'Escape') closeTopmost()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closeAll, closeTopmost])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const handleSubmit = (e) => {
    e.preventDefault()
    const cmd = input.trim().toLowerCase()
    if (!cmd) return

    const newHistory = [...history, { type: 'input', text: `> ${cmd}` }]

    if (cmd === 'clear') {
      setHistory([{ type: 'system', text: 'Terminal cleared.' }])
      setInput('')
      return
    }

    if (cmd === 'exit') {
      closeAll()
      return
    }

    const command = COMMANDS[cmd]
    if (command) {
      if (command.openGames) {
        newHistory.push({ type: 'output', text: '🎮 Opening games hub...' })
        setHistory(newHistory)
        setInput('')
        setGamesHubOpen(true)
        return
      }
      if (command.openGame) {
        newHistory.push({ type: 'output', text: `🚀 Launching ${command.openGame}...` })
        setHistory(newHistory)
        setInput('')
        setActiveGame(command.openGame)
        return
      }
      const output = command.output || command.action?.()
      if (output) {
        newHistory.push({ type: 'output', text: output })
      }
    } else {
      newHistory.push({
        type: 'error',
        text: `Command not found: "${cmd}". Type "help" for available commands.`,
      })
    }

    setHistory(newHistory)
    setInput('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAll()
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={closeAll} />

          {/* Terminal */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            style={{ transform: gamesHubOpen || activeGame ? 'translate(-180px, -60px)' : 'none', transition: 'transform 0.3s ease' }}
            className="absolute w-full max-w-2xl bg-[#0a192f] border border-[#1d3461] rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
          >
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#112240] border-b border-[#1d3461]">
              <button onClick={closeAll} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-[#8892b0] font-mono">
                kayne@portfolio ~ $
              </span>
            </div>

            {/* Output */}
            <div
              ref={scrollRef}
              className="p-4 h-80 overflow-y-auto font-mono text-sm space-y-1"
            >
              {history.map((entry, i) => (
                <div
                  key={i}
                  className={
                    entry.type === 'input'
                      ? 'text-[#64ffda]'
                      : entry.type === 'error'
                      ? 'text-red-400'
                      : entry.type === 'ascii'
                      ? 'text-[#64ffda] whitespace-pre font-bold text-xs leading-tight'
                      : entry.type === 'system'
                      ? 'text-[#8892b0]'
                      : 'text-[#ccd6f6] whitespace-pre-wrap'
                  }
                >
                  {entry.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-4 py-3 border-t border-[#1d3461]"
            >
              <span className="text-[#64ffda] font-mono text-sm">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent text-[#ccd6f6] font-mono text-sm outline-none placeholder-[#8892b0]"
                placeholder="Type a command..."
                autoComplete="off"
                spellCheck={false}
              />
            </form>
          </motion.div>

          {/* Games Hub Modal — second window */}
          <AnimatePresence>
            <GamesHubModal
              key="games-hub"
              open={gamesHubOpen}
              onClose={() => setGamesHubOpen(false)}
              onSelectGame={(id) => setActiveGame(id)}
              offset={120}
            />
          </AnimatePresence>

          {/* Active Game Modal — third window */}
          <AnimatePresence>
            {activeGame && (
              <GameModal
                key={`game-${activeGame}`}
                gameId={activeGame}
                onClose={() => setActiveGame(null)}
                offset={240}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
