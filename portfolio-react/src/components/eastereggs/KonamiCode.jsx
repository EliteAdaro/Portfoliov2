import { useState, useEffect, useCallback, useRef } from 'react'

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

function MatrixRain({ onComplete }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789KAYNE'
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    const drops = Array(columns).fill(1)

    let frame = 0
    const maxFrames = 300 // ~5 seconds at 60fps

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 25, 47, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#64ffda'
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillStyle = Math.random() > 0.95 ? '#ccd6f6' : '#64ffda'
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }

      frame++
      if (frame < maxFrames) {
        requestAnimationFrame(draw)
      } else {
        onComplete()
      }
    }

    const animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [onComplete])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] cursor-pointer"
      onClick={onComplete}
      style={{ background: '#0a192f' }}
    />
  )
}

export default function KonamiCode() {
  const [input, setInput] = useState([])
  const [active, setActive] = useState(false)

  const handleComplete = useCallback(() => setActive(false), [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (active) return

      setInput((prev) => {
        const next = [...prev, e.key].slice(-KONAMI.length)
        if (next.length === KONAMI.length && next.every((k, i) => k === KONAMI[i])) {
          setActive(true)
          return []
        }
        return next
      })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active])

  if (!active) return null
  return <MatrixRain onComplete={handleComplete} />
}
