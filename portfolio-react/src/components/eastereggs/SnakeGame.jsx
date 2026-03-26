import { useState, useEffect, useRef, useCallback } from 'react'
import Leaderboard from './Leaderboard'
import ScoreSubmit from './ScoreSubmit'
import SnakeSettings, { DEFAULT_SETTINGS } from './SnakeSettings'
import { createGame, getSpeed, tick as engineTick, GRID, CELL, MAX_SCORE } from './snakeEngine'
import { createKeyHandler, dequeueDirection } from './snakeInput'
import {
  drawBoard, drawFood, drawBodySegment, drawHead, drawTail,
} from './snakeDrawHelpers'
import {
  createAprilFoolsState, maybeTriggerPrank, onFoodEaten,
  getSpeedModifier, applyInvertedControls, getShakeOffset,
  getPrankMessage, drawAprilFoolsExtras,
} from './snakeAprilFools'

export default function SnakeGame() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const [prankMsg, setPrankMsg] = useState(null)
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
  const gameStartRef = useRef(Date.now())
  const settingsRef = useRef(settings)
  const aprilRef = useRef(createAprilFoolsState())

  // Sync settings ref + persist
  useEffect(() => {
    settingsRef.current = settings
    try { localStorage.setItem('snake-settings', JSON.stringify(settings)) } catch {}
  }, [settings])

  const restart = useCallback(() => {
    dirRef.current = { x: 1, y: 0 }
    dirQueueRef.current = []
    gameRef.current = createGame()
    scoreRef.current = 0
    gameOverRef.current = false
    gameStartRef.current = Date.now()
    aprilRef.current = createAprilFoolsState()
    setPrankMsg(null)
    setScore(0)
    setGameOver(false)
    setGameWon(false)
    setShowSubmit(false)
    setStarted(true)
  }, [])

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

  // Init game
  useEffect(() => {
    gameRef.current = createGame()
  }, [])

  // Keyboard input
  useEffect(() => {
    const handler = createKeyHandler(
      { dirRef, dirQueueRef },
      {
        onStart: () => {
          if (!started && !gameOver) setStarted(true)
        },
      },
    )
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [started, gameOver])

  // Game loop
  useEffect(() => {
    if (!started || gameOver) return

    let timeout
    let running = true

    const gameTick = () => {
      if (!running || gameOverRef.current) return

      const game = gameRef.current
      const canvas = canvasRef.current
      if (!game || !canvas) {
        timeout = setTimeout(gameTick, 16)
        return
      }

      const april = aprilRef.current

      // Dequeue direction + apply April Fools inversion
      let direction = dequeueDirection(dirRef, dirQueueRef)
      direction = applyInvertedControls(april, direction)

      // Run engine tick
      const result = engineTick(game, direction)

      if (!result.alive) {
        handleGameOver()
        return
      }

      if (result.ate) {
        scoreRef.current += 10
        setScore(scoreRef.current)
        onFoodEaten(april)
      }

      // Win condition — snake fills the entire board
      if (result.won) {
        gameOverRef.current = true
        setGameWon(true)
        setGameOver(true)
        setShowSubmit(true)
        return
      }

      // April Fools — maybe trigger a prank
      maybeTriggerPrank(april, game, scoreRef.current)

      // Update prank message for UI
      const msg = getPrankMessage(april)
      setPrankMsg((prev) => prev !== msg ? msg : prev)

      // === DRAW ===
      const ctx = canvas.getContext('2d')
      const s = settingsRef.current

      // Screen shake
      const shake = getShakeOffset(april)
      ctx.save()
      ctx.translate(shake.x, shake.y)

      drawBoard(ctx, GRID, CELL, s)

      // April Fools extras (fake food)
      drawAprilFoolsExtras(ctx, april, drawFood, CELL, s)

      // Real food
      drawFood(ctx, game.food.x * CELL, game.food.y * CELL, CELL, s)

      // Snake
      const { snake } = game
      const len = snake.length

      if (len > 1) {
        drawTail(ctx, snake[len - 1], snake[len - 2], len, CELL, s)
      }

      for (let i = len - 2; i >= 1; i--) {
        drawBodySegment(ctx, snake[i], snake[i - 1], snake[i + 1], i, len, CELL, s)
      }

      drawHead(ctx, snake[0], len > 1 ? snake[1] : null, CELL, s)

      ctx.restore() // undo shake transform

      // Schedule next tick (with April Fools speed modifier)
      if (running && !gameOverRef.current) {
        const baseSpeed = getSpeed(scoreRef.current, settingsRef.current.difficulty)
        const modifier = getSpeedModifier(april)
        timeout = setTimeout(gameTick, Math.round(baseSpeed * modifier))
      }
    }

    const baseSpeed = getSpeed(scoreRef.current, settingsRef.current.difficulty)
    timeout = setTimeout(gameTick, baseSpeed)
    return () => { running = false; clearTimeout(timeout) }
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

          {/* April Fools prank message */}
          {prankMsg && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-red-500/90 text-white text-xs font-mono rounded-full animate-bounce whitespace-nowrap">
              {prankMsg}
            </div>
          )}

          {!started && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy/80 rounded-lg">
              <div className="text-center">
                <p className="text-lightest-slate font-mono text-sm">
                  Press arrow keys or WASD to start
                </p>
                {aprilRef.current.active && (
                  <p className="text-red-400 font-mono text-xs mt-2 animate-pulse">
                    🎉 April Fools Mode Active! 🎉
                  </p>
                )}
              </div>
            </div>
          )}

          {gameOver && showSubmit && score > 0 && (
            <ScoreSubmit
              score={score}
              difficulty={settings.difficulty}
              gameDuration={Date.now() - gameStartRef.current}
              onSubmitted={handleScoreSubmitted}
              onSkip={handleSkipSubmit}
            />
          )}

          {gameOver && (!showSubmit || score === 0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy/80 rounded-lg">
              <div className="text-center">
                {gameWon ? (
                  <>
                    <p className="text-2xl font-bold text-yellow-400 mb-1">🏆 PERFECT GAME! 🏆</p>
                    <p className="text-primary font-mono text-sm mb-1">You filled the entire board!</p>
                    <p className="text-lightest-slate font-mono text-xs">Max Score: {MAX_SCORE}</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-primary mb-2">Game Over!</p>
                    <p className="text-lightest-slate font-mono text-sm">
                      {score === 0 ? 'Better luck next time!' : `Score: ${score}`}
                    </p>
                  </>
                )}
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
