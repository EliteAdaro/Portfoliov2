import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Shared chrome around each game: title bar + back button.
 */
export default function GameWrapper({ title, emoji, children, fullBleed = false }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-navy text-lightest-slate px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/games')}
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </button>
          <h1 className="text-xl sm:text-2xl font-mono font-bold text-primary flex items-center gap-2">
            <span>{emoji}</span> {title}
          </h1>
          <div className="w-[140px]" /> {/* spacer */}
        </div>

        <div className={fullBleed ? '' : 'flex justify-center'}>
          {children}
        </div>
      </div>
    </div>
  )
}
