import { motion } from 'framer-motion'
import { X, Terminal } from 'lucide-react'
import { GAMES } from './gamesRegistry'

/**
 * Second terminal window — shows all available mini-games as a grid.
 * Renders inside the CommandPalette overlay, slightly offset from the
 * main terminal so both are visible at once.
 */
export default function GamesHubModal({ open, onClose, onSelectGame, offset = 0 }) {
  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      style={{ transform: `translate(${offset}px, ${offset}px)` }}
      className="absolute w-[min(720px,92vw)] bg-[#0a192f] border border-[#1d3461] rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#112240] border-b border-[#1d3461]">
        <button
          onClick={onClose}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
          aria-label="Close"
        />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-3 text-xs text-[#8892b0] font-mono flex items-center gap-2 flex-1">
          <Terminal className="w-3 h-3" />
          kayne@portfolio ~/games $
        </span>
        <button onClick={onClose} className="text-[#8892b0] hover:text-red-400 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 font-mono text-sm max-h-[70vh] overflow-y-auto">
        <div className="text-primary mb-1">$ ls -la ./games</div>
        <div className="text-[#8892b0] text-xs mb-4">
          {GAMES.length} games available — pick one to play
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {GAMES.map((game, i) => (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelectGame(game.id)}
              className="group text-left p-3 bg-[#112240]/60 border border-[#1d3461] hover:border-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl group-hover:scale-110 transition-transform">{game.emoji}</span>
                <span className="text-primary font-semibold text-sm">{game.name}</span>
              </div>
              <p className="text-[10px] text-[#8892b0] leading-snug">
                {game.description}
              </p>
            </motion.button>
          ))}
        </div>

        <p className="text-[10px] text-[#8892b0] mt-4 text-center">
          💡 Click a game to launch it • close window to return to terminal
        </p>
      </div>
    </motion.div>
  )
}
