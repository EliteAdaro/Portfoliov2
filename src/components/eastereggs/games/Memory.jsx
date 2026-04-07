import { useState, useEffect } from 'react'

// Memory: configurable grid size (4x4, 6x6) and optional time pressure.
// Click two cards; matching pairs stay revealed. Track moves + time.

const EMOJIS = ['🍎','🍌','🍇','🍓','🥝','🍒','🍑','🥥','🍍','🍉','🥭','🍋','🥕','🌽','🍆','🍄','🥑','🌶️']

const SIZES = [
  { label: '4×4 (Easy)',   cols: 4, rows: 4 },
  { label: '6×4 (Normal)', cols: 6, rows: 4 },
  { label: '6×6 (Hard)',   cols: 6, rows: 6 },
]

const TIMERS = [
  { label: 'No timer', value: 0 },
  { label: '60s',      value: 60 },
  { label: '90s',      value: 90 },
  { label: '2 min',    value: 120 },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(cols, rows) {
  const total = cols * rows
  const pairs = total / 2
  const chosen = shuffle(EMOJIS).slice(0, pairs)
  return shuffle([...chosen, ...chosen]).map((emoji, i) => ({
    id: i,
    emoji,
    matched: false,
  }))
}

export default function Memory() {
  const [size, setSize] = useState(SIZES[0])
  const [timerSec, setTimerSec] = useState(0)
  const [deck, setDeck] = useState(() => buildDeck(SIZES[0].cols, SIZES[0].rows))
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [lost, setLost] = useState(false)

  const won = deck.every((c) => c.matched)
  const elapsed = startedAt ? Math.floor((now - startedAt) / 1000) : 0
  const timeLeft = timerSec ? Math.max(0, timerSec - elapsed) : null

  // Tick clock
  useEffect(() => {
    if (!startedAt || won || lost) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [startedAt, won, lost])

  // Time-out check
  useEffect(() => {
    if (timerSec && timeLeft === 0 && !won) setLost(true)
  }, [timeLeft, timerSec, won])

  const click = (i) => {
    if (locked || won || lost) return
    if (deck[i].matched || flipped.includes(i)) return
    if (flipped.length === 2) return
    if (!startedAt) setStartedAt(Date.now())

    const next = [...flipped, i]
    setFlipped(next)

    if (next.length === 2) {
      setMoves((m) => m + 1)
      setLocked(true)
      const [a, b] = next
      if (deck[a].emoji === deck[b].emoji) {
        setTimeout(() => {
          setDeck((d) => d.map((c, idx) => (idx === a || idx === b ? { ...c, matched: true } : c)))
          setFlipped([])
          setLocked(false)
        }, 400)
      } else {
        setTimeout(() => {
          setFlipped([])
          setLocked(false)
        }, 800)
      }
    }
  }

  const reset = (newSize = size, newTimer = timerSec) => {
    setSize(newSize)
    setTimerSec(newTimer)
    setDeck(buildDeck(newSize.cols, newSize.rows))
    setFlipped([])
    setMoves(0)
    setLocked(false)
    setStartedAt(null)
    setLost(false)
    setNow(Date.now())
  }

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-6">
      {/* Settings */}
      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-mono text-slate-400 mr-1">SIZE</span>
          {SIZES.map((s) => (
            <button
              key={s.label}
              onClick={() => reset(s, timerSec)}
              className={`px-2 py-1 text-[10px] font-mono rounded border transition-all ${
                size.label === s.label ? 'border-primary text-primary bg-primary/10' : 'border-navy-lighter text-slate-400 hover:border-slate-500'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-mono text-slate-400 mr-1">TIMER</span>
          {TIMERS.map((t) => (
            <button
              key={t.label}
              onClick={() => reset(size, t.value)}
              className={`px-2 py-1 text-[10px] font-mono rounded border transition-all ${
                timerSec === t.value ? 'border-primary text-primary bg-primary/10' : 'border-navy-lighter text-slate-400 hover:border-slate-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-3 font-mono text-xs">
        <span className="text-slate-400">Moves: <span className="text-primary">{moves}</span></span>
        {timerSec > 0 && (
          <span className={`${timeLeft < 10 ? 'text-red-400' : 'text-slate-400'}`}>
            Time: <span className="text-primary">{timeLeft}s</span>
          </span>
        )}
        <button onClick={() => reset()} className="text-slate-400 hover:text-primary underline">Reset</button>
      </div>

      <div
        className="grid gap-2 justify-center"
        style={{ gridTemplateColumns: `repeat(${size.cols}, minmax(0, 1fr))` }}
      >
        {deck.map((card, i) => {
          const showing = card.matched || flipped.includes(i)
          return (
            <button
              key={card.id}
              onClick={() => click(i)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg text-2xl flex items-center justify-center transition-all ${
                showing
                  ? card.matched
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-navy border-2 border-primary'
                  : 'bg-navy border-2 border-navy-lighter hover:border-slate-500'
              }`}
            >
              {showing ? card.emoji : '❔'}
            </button>
          )
        })}
      </div>

      {won && (
        <div className="text-center mt-4">
          <p className="text-green-400 font-mono text-sm mb-2">🏆 Solved in {moves} moves • {elapsed}s</p>
          <button onClick={() => reset()} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">
            Play Again
          </button>
        </div>
      )}
      {lost && (
        <div className="text-center mt-4">
          <p className="text-red-400 font-mono text-sm mb-2">⏰ Time&apos;s up!</p>
          <button onClick={() => reset()} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
