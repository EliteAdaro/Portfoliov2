import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Trophy, Medal, Clock, Calendar, CalendarDays, Crown } from 'lucide-react'
import { getHighscores } from '../../lib/highscoreService'

const TABS = [
  { key: 'all', label: 'All-Time', icon: Crown },
  { key: 'monthly', label: 'Month', icon: CalendarDays },
  { key: 'weekly', label: 'Week', icon: Calendar },
  { key: 'daily', label: 'Today', icon: Clock },
]

export default function Leaderboard({ refreshKey }) {
  const [scores, setScores] = useState([])
  const [open, setOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    let mounted = true
    setLoading(true)

    getHighscores(10, activeTab).then((data) => {
      if (mounted) {
        setScores(data)
        setLoading(false)
      }
    })

    return () => { mounted = false }
  }, [refreshKey, activeTab])

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-400" />
    if (index === 1) return <Medal className="w-4 h-4 text-gray-300" />
    if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />
    return <span className="w-4 text-center text-xs text-slate-400 font-mono">{index + 1}</span>
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div className={`transition-all duration-300 ease-in-out ${open ? 'w-72' : 'w-10'}`}>
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
              Leaderboard
            </h3>

            {/* Tabs */}
            <div className="flex gap-1 mb-3 p-0.5 bg-navy/50 rounded-md">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1 text-[10px] font-mono rounded transition-all ${
                      activeTab === tab.key
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Score list */}
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 bg-navy-lighter/50 rounded animate-pulse" />
                ))}
              </div>
            ) : scores.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono text-center py-4">
                {activeTab === 'daily' && 'No scores today yet. Be the first!'}
                {activeTab === 'weekly' && 'No scores this week yet.'}
                {activeTab === 'monthly' && 'No scores this month yet.'}
                {activeTab === 'all' && 'No scores yet. Be the first!'}
              </p>
            ) : (
              <ul className="space-y-1.5">
                {scores.map((entry, i) => (
                  <li
                    key={entry.id}
                    className={`flex items-center gap-2 py-1.5 px-2 rounded text-xs font-mono transition-colors ${
                      i === 0
                        ? 'bg-yellow-400/10 border border-yellow-400/20'
                        : i < 3
                          ? 'bg-primary/5'
                          : 'hover:bg-navy-lighter/30'
                    }`}
                  >
                    {getRankIcon(i)}
                    <span className="flex-1 truncate text-lightest-slate">
                      {entry.name}
                    </span>
                    <span className="text-[9px] text-slate-500 hidden sm:block">
                      {formatDate(entry.created_at)}
                    </span>
                    <span className={`font-semibold min-w-[36px] text-right ${
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
