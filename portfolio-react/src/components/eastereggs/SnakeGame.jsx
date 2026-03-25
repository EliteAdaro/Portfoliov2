import { useState, useEffect, useRef, useCallback } from 'react'
import Leaderboard from './Leaderboard'
import ScoreSubmit from './ScoreSubmit'

const GRID = 20
const CELL = 20
const SPEED = 120

export default function SnakeGame() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const dirRef = useRef({ x: 1, y: 0 })
  const gameRef = useRef(null)

  const initGame = useCallback(() => {
    return {
      snake: [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 },
      ],
      food: {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      },
    }
  }, [])

  const restart = useCallback(() => {
    dirRef.current = { x: 1, y: 0 }
    gameRef.current = initGame()
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
    setLeaderboardKey((k) => k + 1) // refresh leaderboard
  }, [])

  const handleSkipSubmit = useCallback(() => {
    setShowSubmit(false)
  }, [])

  useEffect(() => {
    gameRef.current = initGame()
  }, [initGame])

  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      }

      const dir = map[e.key]
      if (!dir) return
      e.preventDefault()

      // Prevent reversing direction
      const cur = dirRef.current
      if (dir.x !== -cur.x || dir.y !== -cur.y) {
        dirRef.current = dir
      }

      if (!started && !gameOver) {
        setStarted(true)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, gameOver])

  useEffect(() => {
    if (!started || gameOver) return

    const interval = setInterval(() => {
      const game = gameRef.current
      if (!game) return

      const head = { ...game.snake[0] }
      head.x += dirRef.current.x
      head.y += dirRef.current.y

      // Wall collision
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
        handleGameOver()
        return
      }

      // Self collision
      if (game.snake.some((s) => s.x === head.x && s.y === head.y)) {
        handleGameOver()
        return
      }

      game.snake.unshift(head)

      // Eat food
      if (head.x === game.food.x && head.y === game.food.y) {
        setScore((s) => s + 10)
        game.food = {
          x: Math.floor(Math.random() * GRID),
          y: Math.floor(Math.random() * GRID),
        }
      } else {
        game.snake.pop()
      }

      // Draw
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
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

      // Food
      ctx.fillStyle = '#ff6b6b'
      ctx.shadowColor = '#ff6b6b'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(
        game.food.x * CELL + CELL / 2,
        game.food.y * CELL + CELL / 2,
        CELL / 2 - 2,
        0,
        Math.PI * 2,
      )
      ctx.fill()
      ctx.shadowBlur = 0

      // Snake
      game.snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#64ffda' : '#4fd1b0'
        ctx.shadowColor = '#64ffda'
        ctx.shadowBlur = i === 0 ? 8 : 0
        ctx.beginPath()
        ctx.roundRect(
          seg.x * CELL + 1,
          seg.y * CELL + 1,
          CELL - 2,
          CELL - 2,
          4,
        )
        ctx.fill()
      })
      ctx.shadowBlur = 0
    }, SPEED)

    return () => clearInterval(interval)
  }, [started, gameOver, handleGameOver])

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

      {/* Leaderboard - right side on desktop, below on mobile */}
      <div className="w-full lg:w-auto">
        <Leaderboard refreshKey={leaderboardKey} />
      </div>
    </div>
  )
}
