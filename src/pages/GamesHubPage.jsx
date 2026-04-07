import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Terminal, ArrowLeft } from 'lucide-react'
import { GAMES } from '../components/eastereggs/games/gamesRegistry'

export default function GamesHubPage() {
  const navigate = useNavigate()

  return (
    <section className="min-h-screen bg-navy px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-6 px-3 py-1.5 text-sm font-mono text-slate-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio
        </button>

        {/* Terminal-style window */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a192f] border border-[#1d3461] rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#112240] border-b border-[#1d3461]">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-3 text-xs text-[#8892b0] font-mono flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              kayne@portfolio ~/games $
            </span>
          </div>

          {/* Header */}
          <div className="p-6 font-mono text-sm">
            <div className="text-primary mb-1">$ ls -la ./games</div>
            <div className="text-[#8892b0] text-xs mb-4">
              {GAMES.length} games available — pick one to play
            </div>

            {/* Games grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GAMES.map((game, i) => (
                <motion.button
                  key={game.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/games/${game.id}`)}
                  className="group text-left p-4 bg-[#112240]/60 border border-[#1d3461] hover:border-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{game.emoji}</span>
                    <span className="text-primary font-semibold">{game.name}</span>
                  </div>
                  <p className="text-[11px] text-[#8892b0] leading-relaxed">
                    {game.description}
                  </p>
                </motion.button>
              ))}
            </div>

            <div className="text-[#8892b0] text-[11px] mt-6">
              💡 tip: press <kbd className="px-1.5 py-0.5 bg-[#112240] border border-[#1d3461] rounded text-primary">Ctrl+K</kbd> anywhere on the site, type <span className="text-primary">games</span> to come back here
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
