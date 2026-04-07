import { useState, useEffect, useRef } from 'react'

// Standard reaction test: wait for green, click as fast as possible.
// Clicking before green = false start. Average human reaction is ~250ms.

const STATES = {
  IDLE: 'idle',
  WAITING: 'waiting',
  GO: 'go',
  RESULT: 'result',
  FALSE_START: 'false_start',
}

export default function Reaction() {
  const [state, setState] = useState(STATES.IDLE)
  const [reactionMs, setReactionMs] = useState(0)
  const [best, setBest] = useState(() => {
    const saved = localStorage.getItem('reaction-best')
    return saved ? parseInt(saved, 10) : null
  })
  const goTimeRef = useRef(0)
  const timeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const start = () => {
    setState(STATES.WAITING)
    // Wide random range — 0.6s to 7.5s, can be very fast or slow
    const delay = 600 + Math.random() * 6900
    timeoutRef.current = setTimeout(() => {
      goTimeRef.current = performance.now()
      setState(STATES.GO)
    }, delay)
  }

  const handleClick = () => {
    if (state === STATES.IDLE || state === STATES.RESULT || state === STATES.FALSE_START) {
      start()
      return
    }
    if (state === STATES.WAITING) {
      clearTimeout(timeoutRef.current)
      setState(STATES.FALSE_START)
      return
    }
    if (state === STATES.GO) {
      const ms = Math.round(performance.now() - goTimeRef.current)
      setReactionMs(ms)
      setState(STATES.RESULT)
      if (best === null || ms < best) {
        setBest(ms)
        localStorage.setItem('reaction-best', String(ms))
      }
    }
  }

  const bgColor = {
    [STATES.IDLE]: 'bg-navy-light',
    [STATES.WAITING]: 'bg-red-600',
    [STATES.GO]: 'bg-green-500',
    [STATES.RESULT]: 'bg-primary/20',
    [STATES.FALSE_START]: 'bg-orange-600',
  }[state]

  const message = {
    [STATES.IDLE]: 'Click to start',
    [STATES.WAITING]: 'Wait for green...',
    [STATES.GO]: 'CLICK NOW!',
    [STATES.RESULT]: `${reactionMs} ms — click to retry`,
    [STATES.FALSE_START]: 'Too soon! Click to retry',
  }[state]

  return (
    <div className="w-full max-w-md">
      <button
        onClick={handleClick}
        className={`w-full h-72 rounded-xl border-2 border-navy-lighter ${bgColor} transition-colors flex items-center justify-center font-mono font-bold text-white text-2xl select-none`}
      >
        {message}
      </button>
      <div className="mt-4 flex items-center justify-between font-mono text-sm">
        <span className="text-slate-400">
          Best: <span className="text-primary">{best !== null ? `${best} ms` : '—'}</span>
        </span>
        <span className="text-[11px] text-slate-500">avg human ≈ 250ms</span>
      </div>
    </div>
  )
}
