import { useState, useEffect } from 'react'

// Standard rules: random number 1-100, player gets 7 guesses, hi/lo feedback.
const MAX_GUESSES = 7

export default function NumberGuess() {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 100) + 1)
  const [guess, setGuess] = useState('')
  const [history, setHistory] = useState([]) // [{ value, hint }]
  const [status, setStatus] = useState('playing') // playing | won | lost

  const reset = () => {
    setTarget(Math.floor(Math.random() * 100) + 1)
    setGuess('')
    setHistory([])
    setStatus('playing')
  }

  const submit = (e) => {
    e.preventDefault()
    if (status !== 'playing') return
    const n = parseInt(guess, 10)
    if (isNaN(n) || n < 1 || n > 100) return

    let hint
    if (n === target) hint = '🎯 Correct!'
    else if (n < target) hint = '⬆️ Higher'
    else hint = '⬇️ Lower'

    const next = [...history, { value: n, hint }]
    setHistory(next)
    setGuess('')

    if (n === target) setStatus('won')
    else if (next.length >= MAX_GUESSES) setStatus('lost')
  }

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-6 max-w-sm w-full">
      <p className="text-xs font-mono text-slate-400 mb-4">
        Guess the number between <span className="text-primary">1</span> and <span className="text-primary">100</span>. You have <span className="text-primary">{MAX_GUESSES - history.length}</span> guesses left.
      </p>

      <form onSubmit={submit} className="flex gap-2 mb-4">
        <input
          type="number"
          min={1}
          max={100}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={status !== 'playing'}
          className="flex-1 px-3 py-2 bg-navy border border-navy-lighter rounded text-lightest-slate font-mono text-sm focus:outline-none focus:border-primary"
          placeholder="1-100"
        />
        <button
          type="submit"
          disabled={status !== 'playing'}
          className="px-4 py-2 bg-primary text-navy font-mono text-sm font-semibold rounded hover:bg-primary-dark disabled:opacity-40"
        >
          Guess
        </button>
      </form>

      <ul className="space-y-1 mb-4 min-h-[140px]">
        {history.map((h, i) => (
          <li key={i} className="flex justify-between text-xs font-mono text-slate-300 px-2 py-1 bg-navy/40 rounded">
            <span>#{i + 1}: <span className="text-primary">{h.value}</span></span>
            <span>{h.hint}</span>
          </li>
        ))}
      </ul>

      {status === 'won' && (
        <div className="text-center">
          <p className="text-green-400 font-mono text-sm mb-3">🏆 You got it in {history.length} {history.length === 1 ? 'try' : 'tries'}!</p>
          <button onClick={reset} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">Play Again</button>
        </div>
      )}
      {status === 'lost' && (
        <div className="text-center">
          <p className="text-red-400 font-mono text-sm mb-1">💀 Out of guesses!</p>
          <p className="text-slate-400 font-mono text-xs mb-3">The number was <span className="text-primary">{target}</span></p>
          <button onClick={reset} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">Try Again</button>
        </div>
      )}
    </div>
  )
}
