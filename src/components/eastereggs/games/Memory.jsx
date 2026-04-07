import { useState, useEffect } from 'react'

// Standard memory: 4x4 grid (8 pairs). Click two cards, if they match they
// stay revealed, otherwise flip back. Track moves.

const EMOJIS = ['🍎','🍌','🍇','🍓','🥝','🍒','🍑','🥥']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck() {
  return shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({
    id: i,
    emoji,
    matched: false,
  }))
}

export default function Memory() {
  const [deck, setDeck] = useState(buildDeck)
  const [flipped, setFlipped] = useState([]) // indexes
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)

  const won = deck.every((c) => c.matched)

  const click = (i) => {
    if (locked) return
    if (deck[i].matched || flipped.includes(i)) return
    if (flipped.length === 2) return

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

  const reset = () => {
    setDeck(buildDeck())
    setFlipped([])
    setMoves(0)
    setLocked(false)
  }

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 font-mono text-xs">
        <span className="text-slate-400">Moves: <span className="text-primary">{moves}</span></span>
        <button onClick={reset} className="text-slate-400 hover:text-primary underline">Reset</button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {deck.map((card, i) => {
          const showing = card.matched || flipped.includes(i)
          return (
            <button
              key={card.id}
              onClick={() => click(i)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg text-3xl flex items-center justify-center transition-all ${
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
          <p className="text-green-400 font-mono text-sm mb-2">🏆 Solved in {moves} moves!</p>
          <button onClick={reset} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
