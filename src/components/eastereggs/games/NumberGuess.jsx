import { useState, useMemo } from 'react'

// Number Guess: random number 1-100, 7 guesses, hi/lo feedback.
// Visual range bar narrows as you guess; history shown as chips.

const MAX_GUESSES = 7
const MIN = 1
const MAX = 100

export default function NumberGuess() {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * MAX) + 1)
  const [guess, setGuess] = useState('')
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState('playing')

  // Narrowed range derived from history
  const { lo, hi } = useMemo(() => {
    let lo = MIN, hi = MAX
    for (const h of history) {
      if (h.value < target && h.value >= lo) lo = h.value + 1
      if (h.value > target && h.value <= hi) hi = h.value - 1
    }
    return { lo, hi }
  }, [history, target])

  const reset = () => {
    setTarget(Math.floor(Math.random() * MAX) + 1)
    setGuess('')
    setHistory([])
    setStatus('playing')
  }

  const submit = (e) => {
    e.preventDefault()
    if (status !== 'playing') return
    const n = parseInt(guess, 10)
    if (isNaN(n) || n < MIN || n > MAX) return

    let hint, icon, color
    if (n === target) { hint = 'Correct'; icon = '🎯'; color = 'text-green-400' }
    else if (n < target) { hint = 'Higher'; icon = '⬆️'; color = 'text-cyan-400' }
    else { hint = 'Lower'; icon = '⬇️'; color = 'text-orange-400' }

    const next = [...history, { value: n, hint, icon, color }]
    setHistory(next)
    setGuess('')

    if (n === target) setStatus('won')
    else if (next.length >= MAX_GUESSES) setStatus('lost')
  }

  const remaining = MAX_GUESSES - history.length
  const loPct = ((lo - MIN) / (MAX - MIN)) * 100
  const hiPct = ((hi - MIN) / (MAX - MIN)) * 100
  const lastGuess = history[history.length - 1]

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-6 max-w-md w-full">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Guess the number</div>
        <div className="text-4xl font-mono font-bold text-primary">{MIN} – {MAX}</div>
      </div>

      {/* Guess pips */}
      <div className="flex justify-center gap-1.5 mb-5">
        {Array.from({ length: MAX_GUESSES }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-colors ${
              i < history.length
                ? history[i].hint === 'Correct' ? 'bg-green-400' : 'bg-primary/60'
                : 'bg-navy-lighter'
            }`}
          />
        ))}
      </div>

      {/* Range visualizer */}
      <div className="mb-5">
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
          <span>{MIN}</span>
          <span className="text-primary">Range: {lo} – {hi}</span>
          <span>{MAX}</span>
        </div>
        <div className="relative h-3 bg-navy rounded-full overflow-hidden border border-navy-lighter">
          <div
            className="absolute h-full bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40"
            style={{ left: `${loPct}%`, width: `${Math.max(0, hiPct - loPct)}%` }}
          />
          {lastGuess && (
            <div
              className="absolute top-0 h-full w-0.5 bg-yellow-400"
              style={{ left: `${((lastGuess.value - MIN) / (MAX - MIN)) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Last hint banner */}
      {lastGuess && status === 'playing' && (
        <div className={`text-center mb-4 font-mono text-sm ${lastGuess.color}`}>
          {lastGuess.icon} {lastGuess.value} → Try {lastGuess.hint.toLowerCase()}
        </div>
      )}

      {/* Input */}
      <form onSubmit={submit} className="flex gap-2 mb-4">
        <input
          type="number"
          min={lo}
          max={hi}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={status !== 'playing'}
          autoFocus
          className="flex-1 px-3 py-2 bg-navy border border-navy-lighter rounded text-lightest-slate font-mono text-center text-lg focus:outline-none focus:border-primary"
          placeholder={`${lo}–${hi}`}
        />
        <button
          type="submit"
          disabled={status !== 'playing' || !guess}
          className="px-5 py-2 bg-primary text-navy font-mono text-sm font-bold rounded hover:bg-primary-dark disabled:opacity-40"
        >
          Guess
        </button>
      </form>

      {/* History chips */}
      {history.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center mb-2">
          {history.map((h, i) => (
            <span
              key={i}
              className={`px-2 py-1 text-[11px] font-mono rounded border border-navy-lighter bg-navy/40 ${h.color}`}
            >
              {h.icon} {h.value}
            </span>
          ))}
        </div>
      )}

      <p className="text-center text-[10px] font-mono text-slate-500">
        {remaining} {remaining === 1 ? 'guess' : 'guesses'} left
      </p>

      {status === 'won' && (
        <div className="text-center mt-4">
          <p className="text-green-400 font-mono text-sm mb-3">🏆 Got it in {history.length} {history.length === 1 ? 'try' : 'tries'}!</p>
          <button onClick={reset} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">Play Again</button>
        </div>
      )}
      {status === 'lost' && (
        <div className="text-center mt-4">
          <p className="text-red-400 font-mono text-sm mb-1">💀 Out of guesses!</p>
          <p className="text-slate-400 font-mono text-xs mb-3">The number was <span className="text-primary">{target}</span></p>
          <button onClick={reset} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">Try Again</button>
        </div>
      )}
    </div>
  )
}
