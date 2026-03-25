import { useState, useEffect, useRef, useCallback } from 'react'
import Leaderboard from './Leaderboard'
import ScoreSubmit from './ScoreSubmit'

const GRID = 20
const CELL = 20
const BASE_SPEED = 140
const MIN_SPEED = 60

// Get direction from head to previous segment (for drawing head/tail rotation)
function getAngle(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (dx === 1) return 0           // right
  if (dx === -1) return Math.PI    // left
  if (dy === 1) return Math.PI / 2 // down
  return -Math.PI / 2              // up
}

// Spawn food on a free cell (not on the snake)
function spawnFood(snake) {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`))
  const free = []
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y })
    }
  }
  if (free.length === 0) return { x: 0, y: 0 } // snake fills the grid = win
  return free[Math.floor(Math.random() * free.length)]
}

// Draw an apple shape on canvas
function drawApple(ctx, x, y, size) {
  const cx = x + size / 2
  const cy = y + size / 2
  const r = size / 2 - 3

  // Apple body
  ctx.save()
  ctx.shadowColor = '#ff6b6b'
  ctx.shadowBlur = 8

  // Left half
  ctx.fillStyle = '#e74c3c'
  ctx.beginPath()
  ctx.arc(cx - r * 0.2, cy + r * 0.1, r * 0.85, 0, Math.PI * 2)
  ctx.fill()

  // Right half (slightly overlapping for apple shape)
  ctx.fillStyle = '#c0392b'
  ctx.beginPath()
  ctx.arc(cx + r * 0.2, cy + r * 0.1, r * 0.85, 0, Math.PI * 2)
  ctx.fill()

  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.beginPath()
  ctx.arc(cx - r * 0.3, cy - r * 0.2, r * 0.3, 0, Math.PI * 2)
  ctx.fill()

  // Stem
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#5d4037'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx, cy - r * 0.6)
  ctx.lineTo(cx + 1, cy - r * 1.1)
  ctx.stroke()

  // Leaf
  ctx.fillStyle = '#27ae60'
  ctx.beginPath()
  ctx.ellipse(cx + 3, cy - r * 0.9, 3, 1.5, Math.PI / 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Draw snake head with eyes
function drawHead(ctx, seg, nextSeg, size) {
  const x = seg.x * size + 1
  const y = seg.y * size + 1
  const s = size - 2
  const cx = x + s / 2
  const cy = y + s / 2

  // Head direction
  const angle = nextSeg ? getAngle(nextSeg, seg) : 0

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  // Head shape (rounded rectangle)
  ctx.fillStyle = '#64ffda'
  ctx.shadowColor = '#64ffda'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.roundRect(-s / 2, -s / 2, s, s, 5)
  ctx.fill()
  ctx.shadowBlur = 0

  // Eyes
  const eyeY = -s * 0.15
  const eyeX = s * 0.22
  const eyeR = s * 0.12

  // Eye whites
  ctx.fillStyle = '#0a192f'
  ctx.beginPath()
  ctx.arc(eyeX, eyeY - eyeR * 0.5, eyeR * 1.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(eyeX, eyeY + eyeR * 1.5, eyeR * 1.2, 0, Math.PI * 2)
  ctx.fill()

  // Pupils
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(eyeX + 1, eyeY - eyeR * 0.5, eyeR * 0.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(eyeX + 1, eyeY + eyeR * 1.5, eyeR * 0.6, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Draw snake tail (tapered end)
function drawTail(ctx, seg, prevSeg, size) {
  const x = seg.x * size + 1
  const y = seg.y * size + 1
  const s = size - 2
  const cx = x + s / 2
  const cy = y + s / 2

  const angle = prevSeg ? getAngle(seg, prevSeg) : 0

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  // Tapered tail shape
  ctx.fillStyle = '#3ab89a'
  ctx.beginPath()
  ctx.moveTo(-s / 2, -s / 3)        // narrow start
  ctx.lineTo(s / 2, -s / 2)         // wide end top
  ctx.quadraticCurveTo(s / 2 + 2, 0, s / 2, s / 2) // rounded wide end
  ctx.lineTo(-s / 2, s / 3)         // narrow start bottom
  ctx.quadraticCurveTo(-s / 2 - 2, 0, -s / 2, -s / 3) // rounded narrow
  ctx.fill()

  ctx.restore()
}

// Draw body segment
function drawBody(ctx, seg, size) {
  ctx.fillStyle = '#4fd1b0'
  ctx.beginPath()
  ctx.roundRect(
    seg.x * size + 2,
    seg.y * size + 2,
    size - 4,
    size - 4,
    4,
  )
  ctx.fill()
}

export default function SnakeGame() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const dirRef = useRef({ x: 1, y: 0 })
  const nextDirRef = useRef(null)
  const gameRef = useRef(null)
  const scoreRef = useRef(0)

  const initGame = useCallback(() => {
    const snake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ]
    return {
      snake,
      food: spawnFood(snake),
    }
  }, [])

  // Calculate speed — gets faster as score increases
  const getSpeed = useCallback(() => {
    const speedup = Math.floor(scoreRef.current / 50) * 10
    return Math.max(MIN_SPEED, BASE_SPEED - speedup)
  }, [])

  const restart = useCallback(() => {
    dirRef.current = { x: 1, y: 0 }
    nextDirRef.current = null
    gameRef.current = initGame()
    scoreRef.current = 0
    setScore(0)
    setGameOver(false)
    setShowSubmit(false)
    setStarted(true)
  }, [initGame])

  const handleGameOver = useCallback(() => {
    setGameOver(true)
    setShowSubmit(true)
  }, [])

  const handleScoreSubmitted = useCallback(() => {
    setShowSubmit(false)
    setLeaderboardKey((k) => k + 1)
  }, [])

  const handleSkipSubmit = useCallback(() => {
    setShowSubmit(false)
  }, [])

  useEffect(() => {
    gameRef.current = initGame()
  }, [initGame])

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      const map = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        W: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        S: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        A: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
        D: { x: 1, y: 0 },
      }

      const dir = map[e.key]
      if (!dir) return
      e.preventDefault()

      // Check against queued direction to prevent quick reverse
      const cur = nextDirRef.current || dirRef.current
      const isReverse = dir.x + cur.x === 0 && dir.y + cur.y === 0
      if (!isReverse) {
        nextDirRef.current = dir
      }

      if (!started && !gameOver) {
        setStarted(true)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, gameOver])

  // Game loop with dynamic speed
  useEffect(() => {
    if (!started || gameOver) return

    let timeout

    const tick = () => {
      const game = gameRef.current
      if (!game) return

      // Apply queued direction
      if (nextDirRef.current) {
        dirRef.current = nextDirRef.current
        nextDirRef.current = null
      }

      const head = { ...game.snake[0] }
      head.x += dirRef.current.x
      head.y += dirRef.current.y

      // Wall collision
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
        handleGameOver()
        return
      }

      // Self collision (skip the tail because it will move away)
      const checkSnake = game.snake.slice(0, -1)
      if (checkSnake.some((s) => s.x === head.x && s.y === head.y)) {
        handleGameOver()
        return
      }

      game.snake.unshift(head)

      // Eat food
      if (head.x === game.food.x && head.y === game.food.y) {
        scoreRef.current += 10
        setScore(scoreRef.current)
        game.food = spawnFood(game.snake)
      } else {
        game.snake.pop()
      }

      // === DRAW ===
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')

      // Background
      ctx.fillStyle = '#0a192f'
      ctx.fillRect(0, 0, GRID * CELL, GRID * CELL)

      // Grid lines
      ctx.strokeStyle = '#112240'
      ctx.lineWidth = 0.5
      for (let i = 0; i <= GRID; i++) {
        ctx.beginPath()
        ctx.moveTo(i * CELL, 0)
        ctx.lineTo(i * CELL, GRID * CELL)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i * CELL)
        ctx.lineTo(GRID * CELL, i * CELL)
        ctx.stroke()
      }

      // Apple
      drawApple(ctx, game.food.x * CELL, game.food.y * CELL, CELL)

      // Snake body (middle segments)
      const { snake } = game
      for (let i = 1; i < snake.length - 1; i++) {
        drawBody(ctx, snake[i], CELL)
      }

      // Snake tail
      if (snake.length > 1) {
        drawTail(ctx, snake[snake.length - 1], snake[snake.length - 2], CELL)
      }

      // Snake head (drawn last so it's on top)
      drawHead(ctx, snake[0], snake.length > 1 ? snake[1] : null, CELL)

      // Schedule next tick with dynamic speed
      timeout = setTimeout(tick, getSpeed())
    }

    timeout = setTimeout(tick, getSpeed())
    return () => clearTimeout(timeout)
  }, [started, gameOver, handleGameOver, getSpeed])

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-4">
      {/* Game area */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-between w-full max-w-[400px]">
          <span className="font-mono text-primary text-sm">Score: {score}</span>
          {gameOver && !showSubmit && (
            <button
              onClick={restart}
              className="px-4 py-1 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10 transition-colors"
            >
              Play Again
            </button>
          )}
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={GRID * CELL}
            height={GRID * CELL}
            className="rounded-lg border border-navy-lighter"
          />

          {!started && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy/80 rounded-lg">
              <p className="text-lightest-slate font-mono text-sm text-center">
                Press arrow keys or WASD to start
              </p>
            </div>
          )}

          {gameOver && showSubmit && score > 0 && (
            <ScoreSubmit
              score={score}
              onSubmitted={handleScoreSubmitted}
              onSkip={handleSkipSubmit}
            />
          )}

          {gameOver && !showSubmit && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy/80 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary mb-2">Game Over!</p>
                <p className="text-lightest-slate font-mono text-sm">
                  Score: {score}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="w-full lg:w-auto">
        <Leaderboard refreshKey={leaderboardKey} />
      </div>
    </div>
  )
}
