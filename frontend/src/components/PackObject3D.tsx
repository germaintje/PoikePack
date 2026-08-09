import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

interface PackMeshProps {
  colorFrom: string
  colorTo: string
  tearing: boolean
}

function PackMesh({ colorFrom, colorTo, tearing }: PackMeshProps) {
  const groupRef = useRef<THREE.Group>(null)
  const leftRef = useRef<THREE.Mesh>(null)
  const rightRef = useRef<THREE.Mesh>(null)
  const progress = useRef(0)
  const clock = useRef(0)

  useFrame((_, delta) => {
    const group = groupRef.current
    const left = leftRef.current
    const right = rightRef.current
    if (!group || !left || !right) return

    clock.current += delta

    if (!tearing) {
      group.rotation.y += delta * 0.55
      group.position.y = Math.sin(clock.current * 1.1) * 0.08
      return
    }

    progress.current = Math.min(progress.current + delta / 1.1, 1)
    const ease = 1 - Math.pow(1 - progress.current, 3)

    group.rotation.y += delta * (0.55 + ease * 5)
    group.scale.setScalar(1 + ease * 0.25)

    left.position.x = -0.9 * ease
    left.rotation.z = ease * 0.7
    right.position.x = 0.9 * ease
    right.rotation.z = -ease * 0.7
    ;[left, right].forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.transparent = true
      mat.opacity = 1 - ease
    })
  })

  return (
    <group ref={groupRef}>
      <mesh ref={leftRef} position={[-0.001, 0, 0]}>
        <boxGeometry args={[0.85, 2.3, 0.32]} />
        <meshStandardMaterial color={colorFrom} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh ref={rightRef} position={[0.001, 0, 0]}>
        <boxGeometry args={[0.85, 2.3, 0.32]} />
        <meshStandardMaterial color={colorTo} metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  )
}

interface PackObject3DProps {
  colorFrom: string
  colorTo: string
  tearing: boolean
}

export function PackObject3D({ colorFrom, colorTo, tearing }: PackObject3DProps) {
  return (
    <Canvas camera={{ position: [0, 0, 4.4], fov: 38 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <pointLight position={[-3, -2, 2]} intensity={0.5} color={colorFrom} />
      <PackMesh colorFrom={colorFrom} colorTo={colorTo} tearing={tearing} />
    </Canvas>
  )
}
