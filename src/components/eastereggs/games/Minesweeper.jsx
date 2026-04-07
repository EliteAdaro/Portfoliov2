import { useState } from 'react'

// Standard Minesweeper with configurable difficulty.
// Left click = reveal. Right click = flag. Numbers = adjacent mine count.
// Empty cells auto-reveal neighbors. Win when all non-mine cells revealed.

const DIFFICULTIES = [
  { label: 'Beginner',     rows: 9,  cols: 9,  mines: 10 },
  { label: 'Intermediate', rows: 16, cols: 16, mines: 40 },
  { label: 'Expert',       rows: 16, cols: 30, mines: 99 },
]

function buildBoard(rows, cols, mines) {
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, count: 0 })),
  )
  let placed = 0
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)
    if (!grid[r][c].mine) {
      grid[r][c].mine = true
      placed++
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c].mine) continue
    let count = 0
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].mine) count++
    }
    grid[r][c].count = count
  }
  return grid
}

function revealRecursive(grid, r, c, rows, cols) {
  if (r < 0 || r >= rows || c < 0 || c >= cols) return
  const cell = grid[r][c]
  if (cell.revealed || cell.flagged || cell.mine) return
  cell.revealed = true
  if (cell.count === 0) {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      revealRecursive(grid, r + dr, c + dc, rows, cols)
    }
  }
}

const NUM_COLORS = ['', 'text-blue-400', 'text-green-400', 'text-red-400', 'text-purple-400', 'text-yellow-400', 'text-cyan-400', 'text-pink-400', 'text-white']

export default function Minesweeper() {
  const [diff, setDiff] = useState(DIFFICULTIES[0])
  const [board, setBoard] = useState(() => buildBoard(DIFFICULTIES[0].rows, DIFFICULTIES[0].cols, DIFFICULTIES[0].mines))
  const [status, setStatus] = useState('playing')
  const [flags, setFlags] = useState(0)

  const reset = (newDiff = diff) => {
    setDiff(newDiff)
    setBoard(buildBoard(newDiff.rows, newDiff.cols, newDiff.mines))
    setStatus('playing')
    setFlags(0)
  }

  const checkWin = (grid) => {
    for (let r = 0; r < diff.rows; r++) for (let c = 0; c < diff.cols; c++) {
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
      for (let i = 0; i < diff.rows; i++) for (let j = 0; j < diff.cols; j++) if (next[i][j].mine) next[i][j].revealed = true
      setBoard(next)
      setStatus('lost')
      return
    }
    revealRecursive(next, r, c, diff.rows, diff.cols)
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

  // Smaller cells for bigger boards so they fit in modal
  const cellSize = diff.cols >= 30 ? 'w-6 h-6 text-xs' : diff.cols >= 16 ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-4">
      {/* Difficulty selector */}
      <div className="flex flex-wrap gap-1.5 items-center mb-3">
        <span className="text-[10px] font-mono text-slate-400 mr-1">DIFFICULTY</span>
        {DIFFICULTIES.map((d) => (
          <button
            key={d.label}
            onClick={() => reset(d)}
            className={`px-2 py-1 text-[10px] font-mono rounded border transition-all ${
              diff.label === d.label ? 'border-primary text-primary bg-primary/10' : 'border-navy-lighter text-slate-400 hover:border-slate-500'
            }`}
          >
            {d.label} ({d.rows}×{d.cols}/{d.mines})
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3 font-mono text-xs">
        <span className="text-slate-400">💣 <span className="text-primary">{diff.mines - flags}</span></span>
        <span className={
          status === 'won' ? 'text-green-400' :
          status === 'lost' ? 'text-red-400' : 'text-slate-400'
        }>
          {status === 'playing' ? 'Playing' : status === 'won' ? '🏆 You won!' : '💥 Boom!'}
        </span>
        <button onClick={() => reset()} className="text-slate-400 hover:text-primary underline">Reset</button>
      </div>

      <div className="overflow-auto max-w-full">
        <div className="inline-block bg-navy/40 p-1 rounded select-none">
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => {
                const base = `${cellSize} flex items-center justify-center font-mono font-bold border border-navy-lighter`
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
      </div>

      <p className="text-[10px] font-mono text-slate-500 mt-2 text-center">Left click reveal • Right click flag</p>
    </div>
  )
}
