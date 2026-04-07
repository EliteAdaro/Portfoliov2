import { useEffect, useRef, useState, useCallback } from 'react'

// Standard Tetris: 10x20 board, 7 tetrominoes (I, O, T, S, Z, J, L).
// Controls: ←/→ move, ↓ soft drop, ↑ rotate, space hard drop.
// Scoring (standard): 1 line = 100, 2 = 300, 3 = 500, 4 (Tetris) = 800.
// Speed increases per 10 lines cleared.

const COLS = 10
const ROWS = 20
const CELL = 24

const SHAPES = {
  I: { color: '#06b6d4', cells: [[0,0],[1,0],[2,0],[3,0]] },
  O: { color: '#facc15', cells: [[0,0],[1,0],[0,1],[1,1]] },
  T: { color: '#a855f7', cells: [[0,0],[1,0],[2,0],[1,1]] },
  S: { color: '#22c55e', cells: [[1,0],[2,0],[0,1],[1,1]] },
  Z: { color: '#ef4444', cells: [[0,0],[1,0],[1,1],[2,1]] },
  J: { color: '#3b82f6', cells: [[0,0],[0,1],[1,1],[2,1]] },
  L: { color: '#fb923c', cells: [[2,0],[0,1],[1,1],[2,1]] },
}
const KEYS = Object.keys(SHAPES)

function newPiece() {
  const id = KEYS[Math.floor(Math.random() * KEYS.length)]
  const shape = SHAPES[id]
  return {
    id,
    color: shape.color,
    cells: shape.cells.map(([x, y]) => [x, y]),
    x: 3,
    y: 0,
  }
}

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

function rotate(piece) {
  // Rotate 90° CW around bounding box
  const xs = piece.cells.map((c) => c[0])
  const ys = piece.cells.map((c) => c[1])
  const maxX = Math.max(...xs)
  return { ...piece, cells: piece.cells.map(([x, y]) => [maxX - y, x]) }
}

function collides(board, piece, dx = 0, dy = 0, cells = piece.cells) {
  for (const [cx, cy] of cells) {
    const x = piece.x + cx + dx
    const y = piece.y + cy + dy
    if (x < 0 || x >= COLS || y >= ROWS) return true
    if (y >= 0 && board[y][x]) return true
  }
  return false
}

function merge(board, piece) {
  const next = board.map((row) => [...row])
  for (const [cx, cy] of piece.cells) {
    const x = piece.x + cx
    const y = piece.y + cy
    if (y >= 0) next[y][x] = piece.color
  }
  return next
}

function clearLines(board) {
  const remaining = board.filter((row) => row.some((cell) => !cell))
  const cleared = ROWS - remaining.length
  while (remaining.length < ROWS) remaining.unshift(Array(COLS).fill(null))
  return { board: remaining, cleared }
}

const LINE_SCORES = [0, 100, 300, 500, 800]

export default function Tetris() {
  const [board, setBoard] = useState(emptyBoard)
  const [piece, setPiece] = useState(newPiece)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [over, setOver] = useState(false)
  const boardRef = useRef(board)
  const pieceRef = useRef(piece)
  const overRef = useRef(false)

  useEffect(() => { boardRef.current = board }, [board])
  useEffect(() => { pieceRef.current = piece }, [piece])
  useEffect(() => { overRef.current = over }, [over])

  const lockAndNext = useCallback((p) => {
    const merged = merge(boardRef.current, p)
    const { board: cleared, cleared: lineCount } = clearLines(merged)
    setBoard(cleared)
    if (lineCount > 0) {
      setScore((s) => s + LINE_SCORES[lineCount])
      setLines((l) => l + lineCount)
    }
    const next = newPiece()
    if (collides(cleared, next)) {
      setOver(true)
    } else {
      setPiece(next)
    }
  }, [])

  const tryMove = useCallback((dx, dy) => {
    if (overRef.current) return false
    const p = pieceRef.current
    if (!collides(boardRef.current, p, dx, dy)) {
      setPiece({ ...p, x: p.x + dx, y: p.y + dy })
      return true
    }
    return false
  }, [])

  const tryRotate = useCallback(() => {
    if (overRef.current) return
    const p = pieceRef.current
    const rotated = rotate(p)
    if (!collides(boardRef.current, rotated)) setPiece(rotated)
  }, [])

  const hardDrop = useCallback(() => {
    if (overRef.current) return
    let p = pieceRef.current
    let dy = 0
    while (!collides(boardRef.current, p, 0, dy + 1)) dy++
    const dropped = { ...p, y: p.y + dy }
    lockAndNext(dropped)
  }, [lockAndNext])

  // Gravity tick
  useEffect(() => {
    if (over) return
    const speed = Math.max(120, 700 - lines * 25)
    const id = setInterval(() => {
      const p = pieceRef.current
      if (collides(boardRef.current, p, 0, 1)) {
        lockAndNext(p)
      } else {
        setPiece({ ...p, y: p.y + 1 })
      }
    }, speed)
    return () => clearInterval(id)
  }, [lines, over, lockAndNext])

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (over) return
      if (e.key === 'ArrowLeft') { e.preventDefault(); tryMove(-1, 0) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); tryMove(1, 0) }
      else if (e.key === 'ArrowDown') { e.preventDefault(); tryMove(0, 1) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); tryRotate() }
      else if (e.key === ' ') { e.preventDefault(); hardDrop() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [over, tryMove, tryRotate, hardDrop])

  // Render to canvas
  const canvasRef = useRef(null)
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = '#0a192f'
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

    // Grid
    ctx.strokeStyle = '#112240'
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke()
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke()
    }

    // Locked cells
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        ctx.fillStyle = board[y][x]
        ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2)
      }
    }

    // Active piece
    if (!over) {
      ctx.fillStyle = piece.color
      for (const [cx, cy] of piece.cells) {
        const x = piece.x + cx
        const y = piece.y + cy
        if (y >= 0) ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2)
      }
    }
  }, [board, piece, over])

  const reset = () => {
    setBoard(emptyBoard())
    setPiece(newPiece())
    setScore(0)
    setLines(0)
    setOver(false)
  }

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 font-mono text-xs">
        <span className="text-slate-400">Score: <span className="text-primary">{score}</span></span>
        <span className="text-slate-400">Lines: <span className="text-primary">{lines}</span></span>
        <button onClick={reset} className="text-slate-400 hover:text-primary underline">Reset</button>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          className="rounded border border-navy-lighter"
        />
        {over && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/85 rounded">
            <div className="text-center">
              <p className="text-red-400 font-mono text-sm mb-1">💀 Game Over</p>
              <p className="text-primary font-mono text-xs mb-3">Score: {score} • Lines: {lines}</p>
              <button onClick={reset} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="text-[10px] font-mono text-slate-500 mt-2 text-center">
        ←/→ move • ↑ rotate • ↓ soft drop • Space hard drop
      </p>
    </div>
  )
}
