import { useState, useEffect, useCallback } from 'react'

export default function CyberpunkMode() {
  const [active, setActive] = useState(false)
  const [clickTimes, setClickTimes] = useState([])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const now = Date.now()
      setClickTimes((prev) => {
        const recent = [...prev, now].filter((t) => now - t < 2000)
        if (recent.length >= 5) {
          setActive((a) => !a)
          return []
        }
        return recent
      })
    })

    // Watch for class changes on <html> (theme toggles change dark/light class)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (active) {
      root.classList.add('cyberpunk')
    } else {
      root.classList.remove('cyberpunk')
    }
    return () => root.classList.remove('cyberpunk')
  }, [active])

  if (!active) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] px-4 py-2 bg-fuchsia-500 text-black font-mono text-sm rounded-lg animate-pulse pointer-events-none">
      ⚡ CYBERPUNK MODE ⚡ (toggle theme 5x to deactivate)
    </div>
  )
}
