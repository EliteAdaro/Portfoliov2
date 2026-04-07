import { useState, useEffect } from 'react'

// Standard tic-tac-toe: 3x3 grid, X starts (player), O is AI.
// AI uses minimax for unbeatable play. Win on row/col/diagonal.

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
]

function checkWinner(b) {
  for (const [a,b1,c] of LINES) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return { winner: b[a], line: [a,b1,c] }
  }
  if (b.every((cell) => cell)) return { winner: 'draw' }
  return null
}

// Minimax: returns { score, move }. X = player (-1), O = ai (+1).
function minimax(b, isAi) {
  const result = checkWinner(b)
  if (result) {
    if (result.winner === 'O') return { score: 10 }
    if (result.winner === 'X') return { score: -10 }
    return { score: 0 }
  }
  const moves = []
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      const copy = [...b]
      copy[i] = isAi ? 'O' : 'X'
      const { score } = minimax(copy, !isAi)
      moves.push({ index: i, score })
    }
  }
  if (isAi) {
    const best = moves.reduce((a, m) => (m.score > a.score ? m : a), { score: -Infinity })
    return { score: best.score, move: best.index }
  } else {
    const best = moves.reduce((a, m) => (m.score < a.score ? m : a), { score: Infinity })
    return { score: best.score, move: best.index }
  }
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState('X') // X = player
  const [result, setResult] = useState(null)
  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 })

  // AI move
  useEffect(() => {
    if (result || turn !== 'O') return
    const t = setTimeout(() => {
      const { move } = minimax(board, true)
      if (move !== undefined) {
        const next = [...board]
        next[move] = 'O'
        setBoard(next)
        setTurn('X')
      }
    }, 350)
    return () => clearTimeout(t)
  }, [board, turn, result])

  // Result detection
  useEffect(() => {
    const r = checkWinner(board)
    if (r && !result) {
      setResult(r)
      setScore((s) => ({
        ...s,
        [r.winner === 'draw' ? 'draw' : r.winner]: s[r.winner === 'draw' ? 'draw' : r.winner] + 1,
      }))
    }
  }, [board, result])

  const click = (i) => {
    if (board[i] || result || turn !== 'X') return
    const next = [...board]
    next[i] = 'X'
    setBoard(next)
    setTurn('O')
  }

  const reset = () => {
    setBoard(Array(9).fill(null))
    setTurn('X')
    setResult(null)
  }

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-6">
      {/* Score */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs font-mono">
        <div className="bg-navy/40 rounded p-2">
          <div className="text-slate-400">YOU (X)</div>
          <div className="text-lg text-primary">{score.X}</div>
        </div>
        <div className="bg-navy/40 rounded p-2">
          <div className="text-slate-400">DRAWS</div>
          <div className="text-lg text-yellow-400">{score.draw}</div>
        </div>
        <div className="bg-navy/40 rounded p-2">
          <div className="text-slate-400">AI (O)</div>
          <div className="text-lg text-red-400">{score.O}</div>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((cell, i) => {
          const winning = result?.line?.includes(i)
          return (
            <button
              key={i}
              onClick={() => click(i)}
              className={`w-20 h-20 rounded text-4xl font-bold font-mono transition-all ${
                winning ? 'bg-primary/20 border-2 border-primary' :
                'bg-navy border border-navy-lighter hover:border-primary'
              } ${cell === 'X' ? 'text-primary' : 'text-red-400'}`}
            >
              {cell || ''}
            </button>
          )
        })}
      </div>

      <div className="text-center">
        {result ? (
          <>
            <p className="font-mono text-sm mb-3">
              {result.winner === 'draw' ? "🤝 It's a draw" :
                result.winner === 'X' ? '🏆 You win!' : '💀 AI wins'}
            </p>
            <button onClick={reset} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">
              Play Again
            </button>
          </>
        ) : (
          <p className="text-xs font-mono text-slate-400">{turn === 'X' ? 'Your turn' : 'AI thinking...'}</p>
        )}
      </div>
    </div>
  )
}
