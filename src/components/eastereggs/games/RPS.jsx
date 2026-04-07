import { useState } from 'react'

// Standard rock-paper-scissors: rock beats scissors, scissors beats paper,
// paper beats rock. Player vs random AI. Track wins/losses/draws.
const CHOICES = [
  { id: 'rock', emoji: '✊', label: 'Rock' },
  { id: 'paper', emoji: '✋', label: 'Paper' },
  { id: 'scissors', emoji: '✌️', label: 'Scissors' },
]

const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' }

export default function RPS() {
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 })
  const [round, setRound] = useState(null) // { player, ai, result }

  const play = (playerId) => {
    const ai = CHOICES[Math.floor(Math.random() * 3)].id
    let result
    if (playerId === ai) result = 'draw'
    else if (BEATS[playerId] === ai) result = 'win'
    else result = 'loss'

    setRound({ player: playerId, ai, result })
    setScore((s) => ({
      wins: s.wins + (result === 'win' ? 1 : 0),
      losses: s.losses + (result === 'loss' ? 1 : 0),
      draws: s.draws + (result === 'draw' ? 1 : 0),
    }))
  }

  const reset = () => {
    setScore({ wins: 0, losses: 0, draws: 0 })
    setRound(null)
  }

  const find = (id) => CHOICES.find((c) => c.id === id)

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-6 max-w-md w-full">
      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-2 mb-6 text-center">
        <div className="bg-navy/40 rounded p-2">
          <div className="text-[10px] font-mono text-slate-400">WINS</div>
          <div className="text-xl font-mono text-green-400">{score.wins}</div>
        </div>
        <div className="bg-navy/40 rounded p-2">
          <div className="text-[10px] font-mono text-slate-400">DRAWS</div>
          <div className="text-xl font-mono text-yellow-400">{score.draws}</div>
        </div>
        <div className="bg-navy/40 rounded p-2">
          <div className="text-[10px] font-mono text-slate-400">LOSSES</div>
          <div className="text-xl font-mono text-red-400">{score.losses}</div>
        </div>
      </div>

      {/* Round display */}
      <div className="h-24 flex items-center justify-center gap-6 mb-6 bg-navy/30 rounded">
        {round ? (
          <>
            <div className="text-center">
              <div className="text-4xl">{find(round.player).emoji}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">YOU</div>
            </div>
            <div className={`text-xl font-mono font-bold ${
              round.result === 'win' ? 'text-green-400' :
              round.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {round.result === 'win' ? 'WIN' : round.result === 'loss' ? 'LOSS' : 'DRAW'}
            </div>
            <div className="text-center">
              <div className="text-4xl">{find(round.ai).emoji}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">AI</div>
            </div>
          </>
        ) : (
          <p className="text-xs font-mono text-slate-500">Pick your weapon...</p>
        )}
      </div>

      {/* Choice buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {CHOICES.map((c) => (
          <button
            key={c.id}
            onClick={() => play(c.id)}
            className="p-4 bg-navy border border-navy-lighter hover:border-primary rounded-lg transition-all hover:bg-primary/5"
          >
            <div className="text-3xl">{c.emoji}</div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">{c.label}</div>
          </button>
        ))}
      </div>

      <button
        onClick={reset}
        className="w-full text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors underline"
      >
        Reset score
      </button>
    </div>
  )
}
