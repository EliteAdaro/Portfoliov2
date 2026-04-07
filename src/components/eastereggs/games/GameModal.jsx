import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { X, Terminal } from 'lucide-react'
import { getGame } from './gamesRegistry'

/**
 * Modal that hosts a single playable game inside the CommandPalette overlay.
 */
export default function GameModal({ gameId, onClose, offset = 0 }) {
  if (!gameId) return null
  const game = getGame(gameId)
  if (!game) return null
  const GameComponent = game.component

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      style={{ transform: `translate(${offset}px, ${offset}px)` }}
      className="absolute w-[min(900px,94vw)] max-h-[92vh] bg-[#0a192f] border border-[#1d3461] rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
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
          kayne@portfolio ~/games/{game.id} $ <span className="text-primary">{game.emoji} {game.name}</span>
        </span>
        <button onClick={onClose} className="text-[#8892b0] hover:text-red-400 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Game body */}
      <div className="p-4 sm:p-6 overflow-auto flex justify-center">
        <Suspense fallback={<div className="text-primary font-mono py-12">Loading {game.name}...</div>}>
          <GameComponent />
        </Suspense>
      </div>
    </motion.div>
  )
}
