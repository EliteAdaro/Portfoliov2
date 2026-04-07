import { useEffect, useRef, useState } from 'react'

// Standard Pong: two paddles, a ball, first to 7. Player paddle is left
// (W/S or up/down). AI paddle on the right tracks the ball with capped speed.
// Ball angle on paddle hit depends on where it hits the paddle.

const W = 600
const H = 400
const PADDLE_W = 10
const PADDLE_H = 70
const BALL = 8
const WIN_SCORE = 7
const PADDLE_SPEED = 6
const AI_SPEED = 4.2
const BALL_SPEED = 4.5

export default function Pong() {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const [score, setScore] = useState({ p: 0, a: 0 })
  const [winner, setWinner] = useState(null)
  const keysRef = useRef({})

  const reset = (resetScore = true) => {
    stateRef.current = {
      px: 20,
      py: H / 2 - PADDLE_H / 2,
      ax: W - 20 - PADDLE_W,
      ay: H / 2 - PADDLE_H / 2,
      bx: W / 2,
      by: H / 2,
      bvx: BALL_SPEED * (Math.random() < 0.5 ? -1 : 1),
      bvy: (Math.random() - 0.5) * BALL_SPEED,
    }
    if (resetScore) {
      setScore({ p: 0, a: 0 })
      setWinner(null)
    }
  }

  useEffect(() => {
    reset()
  }, [])

  useEffect(() => {
    const onDown = (e) => { keysRef.current[e.key.toLowerCase()] = true }
    const onUp = (e) => { keysRef.current[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  useEffect(() => {
    if (winner) return
    let raf
    const ctx = canvasRef.current.getContext('2d')

    const loop = () => {
      const s = stateRef.current
      const k = keysRef.current

      // Player movement
      if (k['w'] || k['arrowup']) s.py -= PADDLE_SPEED
      if (k['s'] || k['arrowdown']) s.py += PADDLE_SPEED
      s.py = Math.max(0, Math.min(H - PADDLE_H, s.py))

      // AI movement (tracks ball, capped speed)
      const target = s.by - PADDLE_H / 2
      if (s.ay < target) s.ay += Math.min(AI_SPEED, target - s.ay)
      else s.ay -= Math.min(AI_SPEED, s.ay - target)
      s.ay = Math.max(0, Math.min(H - PADDLE_H, s.ay))

      // Ball
      s.bx += s.bvx
      s.by += s.bvy

      // Wall bounce
      if (s.by < 0 || s.by > H - BALL) s.bvy *= -1

      // Paddle bounce
      const hitsPaddle = (px, py) =>
        s.bx < px + PADDLE_W && s.bx + BALL > px && s.by < py + PADDLE_H && s.by + BALL > py

      if (hitsPaddle(s.px, s.py) && s.bvx < 0) {
        const offset = (s.by + BALL / 2 - (s.py + PADDLE_H / 2)) / (PADDLE_H / 2)
        s.bvx = Math.abs(BALL_SPEED) + 0.3
        s.bvy = offset * BALL_SPEED
      }
      if (hitsPaddle(s.ax, s.ay) && s.bvx > 0) {
        const offset = (s.by + BALL / 2 - (s.ay + PADDLE_H / 2)) / (PADDLE_H / 2)
        s.bvx = -(Math.abs(BALL_SPEED) + 0.3)
        s.bvy = offset * BALL_SPEED
      }

      // Score
      if (s.bx < -BALL) {
        setScore((sc) => {
          const ns = { ...sc, a: sc.a + 1 }
          if (ns.a >= WIN_SCORE) setWinner('AI')
          return ns
        })
        reset(false)
      } else if (s.bx > W) {
        setScore((sc) => {
          const ns = { ...sc, p: sc.p + 1 }
          if (ns.p >= WIN_SCORE) setWinner('You')
          return ns
        })
        reset(false)
      }

      // Draw
      ctx.fillStyle = '#0a192f'
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = '#1d3461'
      ctx.setLineDash([6, 8])
      ctx.beginPath()
      ctx.moveTo(W / 2, 0)
      ctx.lineTo(W / 2, H)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#64ffda'
      ctx.fillRect(s.px, s.py, PADDLE_W, PADDLE_H)
      ctx.fillRect(s.ax, s.ay, PADDLE_W, PADDLE_H)
      ctx.fillRect(s.bx, s.by, BALL, BALL)

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [winner])

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 font-mono text-sm">
        <span>You: <span className="text-primary">{score.p}</span></span>
        <span className="text-xs text-slate-500">First to {WIN_SCORE}</span>
        <span>AI: <span className="text-red-400">{score.a}</span></span>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="rounded border border-navy-lighter w-full max-w-full" />
      <p className="text-[10px] font-mono text-slate-500 mt-2 text-center">W/S or ↑/↓ to move</p>
      {winner && (
        <div className="text-center mt-3">
          <p className={`font-mono text-sm mb-2 ${winner === 'You' ? 'text-green-400' : 'text-red-400'}`}>
            {winner === 'You' ? '🏆 You win!' : '💀 AI wins'}
          </p>
          <button onClick={() => reset(true)} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">
            Rematch
          </button>
        </div>
      )}
    </div>
  )
}
