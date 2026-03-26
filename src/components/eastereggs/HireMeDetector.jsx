import { useState, useEffect, useCallback } from 'react'

function Confetti({ onComplete }) {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none'
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')

    const colors = ['#64ffda', '#ccd6f6', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff']
    const pieces = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
    }))

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      pieces.forEach((p) => {
        p.y += p.vy
        p.x += p.vx
        p.rot += p.rotSpeed

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })

      frame++
      if (frame < 180) {
        requestAnimationFrame(animate)
      } else {
        canvas.remove()
        onComplete()
      }
    }

    requestAnimationFrame(animate)
    return () => canvas.remove()
  }, [onComplete])

  return null
}

function HireMessage() {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] text-center pointer-events-none animate-bounce">
      <p className="text-4xl md:text-6xl font-extrabold text-primary drop-shadow-lg">
        Yes, I&apos;m available! 🚀
      </p>
      <p className="text-lg text-lightest-slate mt-2 font-mono">
        Let&apos;s build something amazing together
      </p>
    </div>
  )
}

export default function HireMeDetector() {
  const [buffer, setBuffer] = useState('')
  const [triggered, setTriggered] = useState(false)

  const handleComplete = useCallback(() => setTriggered(false), [])

  useEffect(() => {
    if (triggered) return

    const onKeyDown = (e) => {
      // Ignore if user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      setBuffer((prev) => {
        const next = (prev + e.key).slice(-7).toLowerCase()
        if (next.includes('hire me') || next.includes('hireme')) {
          setTriggered(true)
          return ''
        }
        return next
      })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [triggered])

  if (!triggered) return null

  return (
    <>
      <Confetti onComplete={handleComplete} />
      <HireMessage />
    </>
  )
}
