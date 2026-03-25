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

// Color for body segment based on position (gradient + alternating stripe)
function getBodyColor(index, total) {
  // Head-end: bright cyan → Tail-end: deep green
  const t = total > 1 ? index / (total - 1) : 0
  const isEven = index % 2 === 0
  // Alternate: even segments slightly brighter, odd segments slightly darker
  const shift = isEven ? 10 : -10
  const r = Math.round(Math.min(255, Math.max(0, 100 - t * 42 + shift)))
  const g = Math.round(Math.min(255, Math.max(0, 255 - t * 50 + shift)))
  const b = Math.round(Math.min(255, Math.max(0, 218 - t * 60 + shift)))
  return `rgb(${r}, ${g}, ${b})`
}

// Draw connected body segment — rounded rect that overlaps neighbors for smooth look
function drawBodySegment(ctx, seg, prev, next, index, total, size) {
  const cx = seg.x * size + size / 2
  const cy = seg.y * size + size / 2
  const color = getBodyColor(index, total)
  const w = size - 4  // segment width
  const h = size - 4

  ctx.fillStyle = color

  // Main body cell
  ctx.beginPath()
  ctx.roundRect(seg.x * size + 2, seg.y * size + 2, w, h, 4)
  ctx.fill()

  // Connector to previous segment (fills the gap between cells)
  if (prev) {
    const dx = prev.x - seg.x
    const dy = prev.y - seg.y
    if (dx !== 0) {
      // Horizontal connector
      const connX = dx > 0 ? seg.x * size + size - 2 : seg.x * size - size + 6
      ctx.fillRect(connX, seg.y * size + 3, size - 4, size - 6)
    } else if (dy !== 0) {
      // Vertical connector
      const connY = dy > 0 ? seg.y * size + size - 2 : seg.y * size - size + 6
      ctx.fillRect(seg.x * size + 3, connY, size - 6, size - 4)
    }
  }

  // Subtle inner highlight (scale pattern)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.beginPath()
  ctx.arc(cx - 1, cy - 1, size / 4, 0, Math.PI * 2)
  ctx.fill()
}

// Draw snake head with eyes and tongue
function drawHead(ctx, seg, nextSeg, size) {
  const s = size - 2
  const cx = seg.x * size + size / 2
  const cy = seg.y * size + size / 2

  const angle = nextSeg ? getAngle(nextSeg, seg) : 0

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  // Glow
  ctx.shadowColor = '#64ffda'
  ctx.shadowBlur = 12

  // Head shape — slightly wider at front
  ctx.fillStyle = '#64ffda'
  ctx.beginPath()
  ctx.roundRect(-s / 2, -s / 2, s, s, [3, 6, 6, 3])
  ctx.fill()
  ctx.shadowBlur = 0

  // Darker scale pattern on head
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.beginPath()
  ctx.roundRect(-s / 2 + 1, -s / 2 + 1, s / 2, s - 2, [2, 0, 0, 2])
  ctx.fill()

  // Tongue (flickering red tongue)
  ctx.strokeStyle = '#e74c3c'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(s / 2, 0)
  ctx.lineTo(s / 2 + 5, 0)
  // Fork
  ctx.moveTo(s / 2 + 4, 0)
  ctx.lineTo(s / 2 + 7, -2)
  ctx.moveTo(s / 2 + 4, 0)
  ctx.lineTo(s / 2 + 7, 2)
  ctx.stroke()

  // Eyes — positioned on the side of the head
  const eyeOffX = s * 0.15
  const eyeOffY = s * 0.25
  const eyeR = s * 0.14

  // Left eye
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(eyeOffX, -eyeOffY, eyeR, 0, Math.PI * 2)
  ctx.fill()

  // Right eye
  ctx.beginPath()
  ctx.arc(eyeOffX, eyeOffY, eyeR, 0, Math.PI * 2)
  ctx.fill()

  // Pupils (looking forward)
  ctx.fillStyle = '#0a192f'
  const pupilR = eyeR * 0.6
  ctx.beginPath()
  ctx.arc(eyeOffX + pupilR * 0.4, -eyeOffY, pupilR, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(eyeOffX + pupilR * 0.4, eyeOffY, pupilR, 0, Math.PI * 2)
  ctx.fill()

  // Eye shine
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(eyeOffX + pupilR * 0.5, -eyeOffY - pupilR * 0.3, pupilR * 0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(eyeOffX + pupilR * 0.5, eyeOffY - pupilR * 0.3, pupilR * 0.35, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Draw snake tail (tapered, smooth end)
function drawTail(ctx, seg, prevSeg, total, size) {
  const s = size - 2
  const cx = seg.x * size + size / 2
  const cy = seg.y * size + size / 2
  const color = getBodyColor(total - 1, total)

  const angle = prevSeg ? getAngle(seg, prevSeg) : 0

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  // Smooth tapered tail
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(-s / 2 - 2, 0)                         // pointy tip
  ctx.quadraticCurveTo(-s / 4, -s / 2.5, s / 3, -s / 2) // curve to wide top
  ctx.lineTo(s / 2, -s / 2)                          // top right
  ctx.lineTo(s / 2, s / 2)                           // bottom right
  ctx.lineTo(s / 3, s / 2)                           // bottom edge
  ctx.quadraticCurveTo(-s / 4, s / 2.5, -s / 2 - 2, 0)  // curve back to tip
  ctx.fill()

  // Highlight stripe
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.beginPath()
  ctx.moveTo(-s / 4, 0)
  ctx.quadraticCurveTo(0, -s / 4, s / 3, -s / 3)
  ctx.lineTo(s / 3, -s / 6)
  ctx.quadraticCurveTo(0, -s / 6, -s / 4, 0)
  ctx.fill()

  ctx.restore()
}

export default function SnakeGame() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const dirRef = useRef({ x: 1, y: 0 })
  const dirQueueRef = useRef([])
  const gameRef = useRef(null)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)

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
    dirQueueRef.current = []
    gameRef.current = initGame()
    scoreRef.current = 0
    gameOverRef.current = false
    setScore(0)
    setGameOver(false)
    setShowSubmit(false)
    setStarted(true)
  }, [initGame])

  const handleGameOver = useCallback(() => {
    gameOverRef.current = true
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

      // Direction queue: max 2 entries, each checked against the last
      const queue = dirQueueRef.current
      if (queue.length >= 2) return // don't buffer more than 2

      // Check against the last queued direction, or the current direction
      const lastDir = queue.length > 0 ? queue[queue.length - 1] : dirRef.current
      const isReverse = dir.x + lastDir.x === 0 && dir.y + lastDir.y === 0
      const isSame = dir.x === lastDir.x && dir.y === lastDir.y
      if (!isReverse && !isSame) {
        queue.push(dir)
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
    let running = true

    const tick = () => {
      if (!running || gameOverRef.current) return

      const game = gameRef.current
      const canvas = canvasRef.current
      if (!game || !canvas) {
        // Retry next frame if canvas isn't ready yet
        timeout = setTimeout(tick, 16)
        return
      }

      // Dequeue one direction per tick
      const queue = dirQueueRef.current
      if (queue.length > 0) {
        dirRef.current = queue.shift()
      }

      const head = { ...game.snake[0] }
      head.x += dirRef.current.x
      head.y += dirRef.current.y

      // Wall collision
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
        handleGameOver()
        return
      }

      // Self collision — check all segments except the tail
      // (tail moves away this tick, unless we eat food, but then
      //  the tail stays and head can't be where food+tail overlap)
      const willEat = head.x === game.food.x && head.y === game.food.y
      const checkTo = willEat ? game.snake.length : game.snake.length - 1
      for (let i = 0; i < checkTo; i++) {
        if (game.snake[i].x === head.x && game.snake[i].y === head.y) {
          handleGameOver()
          return
        }
      }

      game.snake.unshift(head)

      // Eat food
      if (willEat) {
        scoreRef.current += 10
        setScore(scoreRef.current)
        game.food = spawnFood(game.snake)
      } else {
        game.snake.pop()
      }

      // === DRAW ===
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

      // Snake — draw from tail to head so head is on top
      const { snake } = game
      const len = snake.length

      // Tail (last segment)
      if (len > 1) {
        drawTail(ctx, snake[len - 1], snake[len - 2], len, CELL)
      }

      // Body segments (middle, drawn back-to-front)
      for (let i = len - 2; i >= 1; i--) {
        drawBodySegment(
          ctx, snake[i],
          snake[i - 1],     // toward head
          snake[i + 1],     // toward tail
          i, len, CELL,
        )
      }

      // Head (first segment, drawn last)
      drawHead(ctx, snake[0], len > 1 ? snake[1] : null, CELL)

      // Schedule next tick with dynamic speed
      if (running && !gameOverRef.current) {
        timeout = setTimeout(tick, getSpeed())
      }
    }

    timeout = setTimeout(tick, getSpeed())
    return () => {
      running = false
      clearTimeout(timeout)
    }
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
