import { useEffect, useRef, useState } from 'react'

// Standard Flappy Bird: gravity pulls bird down, space/click flaps upward.
// Pipes scroll left with a vertical gap. Hit pipe or ground = game over.
// Score +1 per pipe passed.

const W = 400
const H = 500
const BIRD_X = 80
const BIRD_R = 12
const GRAVITY = 0.45
const FLAP = -7.5
const PIPE_W = 55
const PIPE_GAP = 140
const PIPE_SPEED = 2.5
const PIPE_INTERVAL = 90 // frames

export default function Flappy() {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => parseInt(localStorage.getItem('flappy-best') || '0', 10))
  const [over, setOver] = useState(false)
  const [started, setStarted] = useState(false)

  const reset = () => {
    stateRef.current = {
      y: H / 2,
      vy: 0,
      pipes: [],
      frame: 0,
      score: 0,
    }
    setScore(0)
    setOver(false)
    setStarted(false)
  }

  useEffect(() => {
    reset()
  }, [])

  const flap = () => {
    if (over) {
      reset()
      return
    }
    if (!started) setStarted(true)
    stateRef.current.vy = FLAP
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault()
        flap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    let raf
    const ctx = canvasRef.current.getContext('2d')

    const loop = () => {
      const s = stateRef.current

      if (started && !over) {
        s.vy += GRAVITY
        s.y += s.vy
        s.frame++

        // Spawn pipe
        if (s.frame % PIPE_INTERVAL === 0) {
          const gapY = 60 + Math.random() * (H - PIPE_GAP - 120)
          s.pipes.push({ x: W, gapY, passed: false })
        }

        // Move pipes
        s.pipes.forEach((p) => { p.x -= PIPE_SPEED })
        s.pipes = s.pipes.filter((p) => p.x + PIPE_W > 0)

        // Score
        s.pipes.forEach((p) => {
          if (!p.passed && p.x + PIPE_W < BIRD_X) {
            p.passed = true
            s.score++
            setScore(s.score)
          }
        })

        // Collisions
        if (s.y - BIRD_R < 0 || s.y + BIRD_R > H) {
          setOver(true)
          if (s.score > best) {
            setBest(s.score)
            localStorage.setItem('flappy-best', String(s.score))
          }
        }
        for (const p of s.pipes) {
          if (BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W) {
            if (s.y - BIRD_R < p.gapY || s.y + BIRD_R > p.gapY + PIPE_GAP) {
              setOver(true)
              if (s.score > best) {
                setBest(s.score)
                localStorage.setItem('flappy-best', String(s.score))
              }
            }
          }
        }
      }

      // Draw
      ctx.fillStyle = '#0a192f'
      ctx.fillRect(0, 0, W, H)

      // Pipes
      ctx.fillStyle = '#64ffda'
      s.pipes.forEach((p) => {
        ctx.fillRect(p.x, 0, PIPE_W, p.gapY)
        ctx.fillRect(p.x, p.gapY + PIPE_GAP, PIPE_W, H - p.gapY - PIPE_GAP)
      })

      // Bird
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(BIRD_X, s.y, BIRD_R, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#0a192f'
      ctx.beginPath()
      ctx.arc(BIRD_X + 4, s.y - 3, 2, 0, Math.PI * 2)
      ctx.fill()

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [started, over, best])

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 font-mono text-xs">
        <span className="text-slate-400">Score: <span className="text-primary">{score}</span></span>
        <span className="text-slate-400">Best: <span className="text-primary">{best}</span></span>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={flap}
          className="rounded border border-navy-lighter cursor-pointer"
        />
        {!started && !over && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-primary font-mono text-sm bg-navy/80 px-4 py-2 rounded">Click or Space to start</p>
          </div>
        )}
        {over && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/80">
            <div className="text-center">
              <p className="text-red-400 font-mono text-sm mb-2">💀 Game Over — {score}</p>
              <button onClick={reset} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
