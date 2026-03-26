import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

export default function FloatingParticles({ count = 150 }) {
  const mesh = useRef()
  const elapsed = useRef(0)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      speeds[i] = 0.002 + Math.random() * 0.008
    }

    return { positions, speeds }
  }, [count])

  useFrame((_, delta) => {
    if (!mesh.current) return
    elapsed.current += delta
    const positions = mesh.current.geometry.attributes.position.array
    const time = elapsed.current

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += particles.speeds[i]
      positions[i * 3] += Math.sin(time + i) * 0.001

      if (positions[i * 3 + 1] > 10) {
        positions[i * 3 + 1] = -10
      }
    }

    mesh.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#64ffda"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
