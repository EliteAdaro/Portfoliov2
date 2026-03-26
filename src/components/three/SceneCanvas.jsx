import { Suspense, lazy, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'

const FloatingParticles = lazy(() => import('./FloatingParticles'))

function shouldRender3D() {
  if (typeof window === 'undefined') return false
  if (window.innerWidth < 768) return false
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)
    return false
  if (navigator.connection?.saveData) return false
  return true
}

export default function SceneCanvas() {
  const [show3D, setShow3D] = useState(false)

  useEffect(() => {
    setShow3D(shouldRender3D())
  }, [])

  if (!show3D) return null

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <FloatingParticles />
        </Suspense>
      </Canvas>
    </div>
  )
}
