import { useState, useEffect, useCallback } from 'react'

// Standard 2048: 4x4 grid. Arrow keys slide tiles in direction. Tiles with
// same value merge once per move (gaining their sum). After each move, a
// new 2 (90%) or 4 (10%) spawns in a random empty cell. Win at 2048.
// Game over when no moves are possible.

const SIZE = 4

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function clone(board) {
  return board.map((row) => [...row])
}

function spawnTile(board) {
  const empties = []
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!board[r][c]) empties.push([r, c])
  if (empties.length === 0) return board
  const [r, c] = empties[Math.floor(Math.random() * empties.length)]
  board[r][c] = Math.random() < 0.9 ? 2 : 4
  return board
}

function startBoard() {
  const b = emptyBoard()
  spawnTile(b)
  spawnTile(b)
  return b
}

// Slide a single row to the left, merging once. Returns { row, gained }.
function slideRow(row) {
  const filtered = row.filter((v) => v)
  let gained = 0
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2
      gained += filtered[i]
      filtered.splice(i + 1, 1)
    }
  }
  while (filtered.length < SIZE) filtered.push(0)
  return { row: filtered, gained }
}

function rotateCW(b) {
  const out = emptyBoard()
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) out[c][SIZE - 1 - r] = b[r][c]
  return out
}
function rotateCCW(b) {
  const out = emptyBoard()
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) out[SIZE - 1 - c][r] = b[r][c]
  return out
}

function move(board, dir) {
  // Normalize: rotate so the move becomes "left", slide each row, rotate back.
  let b = clone(board)
  if (dir === 'up') b = rotateCCW(b)
  else if (dir === 'down') b = rotateCW(b)
  else if (dir === 'right') b = b.map((row) => row.slice().reverse())

  let totalGained = 0
  let changed = false
  const newBoard = b.map((row) => {
    const { row: newRow, gained } = slideRow(row)
    totalGained += gained
    if (!changed && newRow.some((v, i) => v !== row[i])) changed = true
    return newRow
  })

  let result = newBoard
  if (dir === 'up') result = rotateCW(newBoard)
  else if (dir === 'down') result = rotateCCW(newBoard)
  else if (dir === 'right') result = newBoard.map((row) => row.slice().reverse())

  return { board: result, gained: totalGained, changed }
}

function isGameOver(board) {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (!board[r][c]) return false
    if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return false
    if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return false
  }
  return true
}

const TILE_COLORS = {
  0:    'bg-navy-lighter text-transparent',
  2:    'bg-slate-200 text-navy',
  4:    'bg-slate-300 text-navy',
  8:    'bg-orange-300 text-white',
  16:   'bg-orange-400 text-white',
  32:   'bg-orange-500 text-white',
  64:   'bg-red-500 text-white',
  128:  'bg-yellow-400 text-navy',
  256:  'bg-yellow-500 text-navy',
  512:  'bg-yellow-600 text-white',
  1024: 'bg-primary text-navy',
  2048: 'bg-primary text-navy',
}

export default function Game2048() {
  const [board, setBoard] = useState(startBoard)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => parseInt(localStorage.getItem('2048-best') || '0', 10))
  const [won, setWon] = useState(false)
  const [over, setOver] = useState(false)

  const handleMove = useCallback((dir) => {
    if (over) return
    setBoard((current) => {
      const { board: next, gained, changed } = move(current, dir)
      if (!changed) return current
      spawnTile(next)
      setScore((s) => {
        const ns = s + gained
        if (ns > best) {
          setBest(ns)
          localStorage.setItem('2048-best', String(ns))
        }
        return ns
      })
      if (!won && next.some((row) => row.some((v) => v >= 2048))) setWon(true)
      if (isGameOver(next)) setOver(true)
      return next
    })
  }, [over, won, best])

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
                    w: 'up', s: 'down', a: 'left', d: 'right' }
      const dir = map[e.key]
      if (dir) {
        e.preventDefault()
        handleMove(dir)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleMove])

  const reset = () => {
    setBoard(startBoard())
    setScore(0)
    setWon(false)
    setOver(false)
  }

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 font-mono text-xs gap-3">
        <div className="flex gap-3">
          <span className="text-slate-400">Score: <span className="text-primary">{score}</span></span>
          <span className="text-slate-400">Best: <span className="text-primary">{best}</span></span>
        </div>
        <button onClick={reset} className="text-slate-400 hover:text-primary underline">New Game</button>
      </div>

      <div className="grid grid-cols-4 gap-2 bg-navy/40 p-2 rounded">
        {board.flat().map((value, i) => (
          <div
            key={i}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded flex items-center justify-center font-mono font-bold text-xl ${TILE_COLORS[value] || 'bg-primary text-navy'}`}
          >
            {value || ''}
          </div>
        ))}
      </div>

      <p className="text-[10px] font-mono text-slate-500 mt-3 text-center">Arrow keys / WASD to move</p>

      {over && (
        <div className="mt-3 text-center">
          <p className="text-red-400 font-mono text-sm mb-2">💀 No moves left — Score: {score}</p>
          <button onClick={reset} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">Try Again</button>
        </div>
      )}
      {won && !over && (
        <p className="text-yellow-400 font-mono text-xs text-center mt-3">🏆 You hit 2048! Keep going for more.</p>
      )}
    </div>
  )
}
