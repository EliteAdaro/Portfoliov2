import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Trophy, Medal } from 'lucide-react'
import { getHighscores } from '../../lib/highscoreService'

export default function Leaderboard({ refreshKey }) {
  const [scores, setScores] = useState([])
  const [open, setOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    getHighscores(10).then((data) => {
      if (mounted) {
        setScores(data)
        setLoading(false)
      }
    })

    return () => { mounted = false }
  }, [refreshKey])

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-400" />
    if (index === 1) return <Medal className="w-4 h-4 text-gray-300" />
    if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />
    return <span className="w-4 text-center text-xs text-slate-400 font-mono">{index + 1}</span>
  }

  return (
    <div className={`transition-all duration-300 ease-in-out ${open ? 'w-64' : 'w-10'}`}>
      <div className="relative h-full">
        {/* Toggle button */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute -left-3 top-4 z-10 w-6 h-6 rounded-full bg-navy-lighter border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-colors"
          aria-label={open ? 'Collapse leaderboard' : 'Expand leaderboard'}
        >
          {open
            ? <ChevronRight className="w-3 h-3 text-primary" />
            : <ChevronLeft className="w-3 h-3 text-primary" />
          }
        </button>

        {/* Panel */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            open ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="bg-navy-light/50 backdrop-blur-sm border border-navy-lighter rounded-lg p-4">
            <h3 className="text-sm font-mono font-semibold text-primary mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Highscores
            </h3>

            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 bg-navy-lighter/50 rounded animate-pulse" />
                ))}
              </div>
            ) : scores.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono">
                No scores yet. Be the first!
              </p>
            ) : (
              <ul className="space-y-1.5">
                {scores.map((entry, i) => (
                  <li
                    key={entry.id}
                    className={`flex items-center gap-2 py-1 px-2 rounded text-xs font-mono ${
                      i === 0
                        ? 'bg-yellow-400/10 border border-yellow-400/20'
                        : i < 3
                          ? 'bg-primary/5'
                          : ''
                    }`}
                  >
                    {getRankIcon(i)}
                    <span className="flex-1 truncate text-lightest-slate">
                      {entry.name}
                    </span>
                    <span className={`font-semibold ${
                      i === 0 ? 'text-yellow-400' : 'text-primary'
                    }`}>
                      {entry.score}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
