import { useState, useEffect, useRef, useCallback } from 'react'
import Leaderboard from './Leaderboard'
import ScoreSubmit from './ScoreSubmit'
import SnakeSettings, { DEFAULT_SETTINGS } from './SnakeSettings'
import {
  drawBoard,
  drawApple,
  drawBodySegment,
  drawHead,
  drawTail,
} from './snakeDrawHelpers'

const GRID = 20
const CELL = 20
const BASE_SPEED = 140
const MIN_SPEED = 60

// Spawn food on a free cell (not on the snake)
function spawnFood(snake) {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`))
  const free = []
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y })
    }
  }
  if (free.length === 0) return { x: 0, y: 0 }
  return free[Math.floor(Math.random() * free.length)]
}

export default function SnakeGame() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('snake-settings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS }
    } catch {
      return { ...DEFAULT_SETTINGS }
    }
  })
  const dirRef = useRef({ x: 1, y: 0 })
  const dirQueueRef = useRef([])
  const gameRef = useRef(null)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const settingsRef = useRef(settings)

  // Keep settingsRef in sync + persist
  useEffect(() => {
    settingsRef.current = settings
    try { localStorage.setItem('snake-settings', JSON.stringify(settings)) } catch {}
  }, [settings])

  const initGame = useCallback(() => {
    const snake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ]
    return { snake, food: spawnFood(snake) }
  }, [])

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

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      const map = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
        s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
        a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
        d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
      }

      const dir = map[e.key]
      if (!dir) return
      e.preventDefault()

      const queue = dirQueueRef.current
      if (queue.length >= 2) return

      const lastDir = queue.length > 0 ? queue[queue.length - 1] : dirRef.current
      const isReverse = dir.x + lastDir.x === 0 && dir.y + lastDir.y === 0
      const isSame = dir.x === lastDir.x && dir.y === lastDir.y
      if (!isReverse && !isSame) {
        queue.push(dir)
      }

      if (!started && !gameOver) setStarted(true)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, gameOver])

  // Game loop
  useEffect(() => {
    if (!started || gameOver) return

    let timeout
    let running = true

    const tick = () => {
      if (!running || gameOverRef.current) return

      const game = gameRef.current
      const canvas = canvasRef.current
      if (!game || !canvas) {
        timeout = setTimeout(tick, 16)
        return
      }

      // Dequeue direction
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

      // Self collision
      const willEat = head.x === game.food.x && head.y === game.food.y
      const checkTo = willEat ? game.snake.length : game.snake.length - 1
      for (let i = 0; i < checkTo; i++) {
        if (game.snake[i].x === head.x && game.snake[i].y === head.y) {
          handleGameOver()
          return
        }
      }

      game.snake.unshift(head)

      if (willEat) {
        scoreRef.current += 10
        setScore(scoreRef.current)
        game.food = spawnFood(game.snake)
      } else {
        game.snake.pop()
      }

      // === DRAW ===
      const ctx = canvas.getContext('2d')
      const s = settingsRef.current

      drawBoard(ctx, GRID, CELL, s)
      drawApple(ctx, game.food.x * CELL, game.food.y * CELL, CELL)

      const { snake } = game
      const len = snake.length

      // Tail
      if (len > 1) {
        drawTail(ctx, snake[len - 1], snake[len - 2], len, CELL, s)
      }

      // Body (back to front)
      for (let i = len - 2; i >= 1; i--) {
        drawBodySegment(ctx, snake[i], snake[i - 1], snake[i + 1], i, len, CELL, s)
      }

      // Head
      drawHead(ctx, snake[0], len > 1 ? snake[1] : null, CELL, s)

      if (running && !gameOverRef.current) {
        timeout = setTimeout(tick, getSpeed())
      }
    }

    timeout = setTimeout(tick, getSpeed())
    return () => { running = false; clearTimeout(timeout) }
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
                <p className="text-lightest-slate font-mono text-sm">Score: {score}</p>
              </div>
            </div>
          )}
        </div>

        {/* Settings below the game */}
        <SnakeSettings settings={settings} onChange={setSettings} />
      </div>

      {/* Leaderboard */}
      <div className="w-full lg:w-auto">
        <Leaderboard refreshKey={leaderboardKey} />
      </div>
    </div>
  )
}
