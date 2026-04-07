import { useState, useEffect } from 'react'

// Standard Minesweeper (beginner): 9x9 grid with 10 mines.
// Left click = reveal. Right click = flag. Numbers show adjacent mine count.
// Empty cells (no adjacent mines) auto-reveal neighbors recursively.
// Win when all non-mine cells are revealed.

const SIZE = 9
const MINES = 10

function buildBoard() {
  // Empty grid
  const grid = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({ mine: false, revealed: false, flagged: false, count: 0 })),
  )
  // Place mines
  let placed = 0
  while (placed < MINES) {
    const r = Math.floor(Math.random() * SIZE)
    const c = Math.floor(Math.random() * SIZE)
    if (!grid[r][c].mine) {
      grid[r][c].mine = true
      placed++
    }
  }
  // Calculate counts
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (grid[r][c].mine) continue
    let count = 0
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && grid[nr][nc].mine) count++
    }
    grid[r][c].count = count
  }
  return grid
}

function revealRecursive(grid, r, c) {
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return
  const cell = grid[r][c]
  if (cell.revealed || cell.flagged || cell.mine) return
  cell.revealed = true
  if (cell.count === 0) {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      revealRecursive(grid, r + dr, c + dc)
    }
  }
}

const NUM_COLORS = ['', 'text-blue-400', 'text-green-400', 'text-red-400', 'text-purple-400', 'text-yellow-400', 'text-cyan-400', 'text-pink-400', 'text-white']

export default function Minesweeper() {
  const [board, setBoard] = useState(buildBoard)
  const [status, setStatus] = useState('playing') // playing | won | lost
  const [flags, setFlags] = useState(0)

  const reset = () => {
    setBoard(buildBoard())
    setStatus('playing')
    setFlags(0)
  }

  const checkWin = (grid) => {
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c].mine && !grid[r][c].revealed) return false
    }
    return true
  }

  const reveal = (r, c) => {
    if (status !== 'playing') return
    const cell = board[r][c]
    if (cell.flagged || cell.revealed) return
    const next = board.map((row) => row.map((c) => ({ ...c })))
    if (next[r][c].mine) {
      // Reveal all mines
      for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (next[i][j].mine) next[i][j].revealed = true
      setBoard(next)
      setStatus('lost')
      return
    }
    revealRecursive(next, r, c)
    setBoard(next)
    if (checkWin(next)) setStatus('won')
  }

  const flag = (e, r, c) => {
    e.preventDefault()
    if (status !== 'playing') return
    const cell = board[r][c]
    if (cell.revealed) return
    const next = board.map((row) => row.map((c) => ({ ...c })))
    next[r][c].flagged = !next[r][c].flagged
    setBoard(next)
    setFlags((f) => f + (next[r][c].flagged ? 1 : -1))
  }

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 font-mono text-xs">
        <span className="text-slate-400">💣 <span className="text-primary">{MINES - flags}</span></span>
        <span className={
          status === 'won' ? 'text-green-400' :
          status === 'lost' ? 'text-red-400' : 'text-slate-400'
        }>
          {status === 'playing' ? 'Playing' : status === 'won' ? '🏆 You won!' : '💥 Boom!'}
        </span>
        <button onClick={reset} className="text-slate-400 hover:text-primary underline">Reset</button>
      </div>

      <div className="inline-block bg-navy/40 p-1 rounded select-none">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => {
              const base = 'w-8 h-8 flex items-center justify-center font-mono font-bold text-sm border border-navy-lighter'
              if (!cell.revealed) {
                return (
                  <button
                    key={c}
                    onClick={() => reveal(r, c)}
                    onContextMenu={(e) => flag(e, r, c)}
                    className={`${base} bg-navy hover:bg-navy-lighter`}
                  >
                    {cell.flagged ? '🚩' : ''}
                  </button>
                )
              }
              return (
                <div key={c} className={`${base} bg-navy-light`}>
                  {cell.mine ? '💣' : cell.count > 0 ? <span className={NUM_COLORS[cell.count]}>{cell.count}</span> : ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <p className="text-[10px] font-mono text-slate-500 mt-2 text-center">Left click reveal • Right click flag</p>
    </div>
  )
}
