import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { usePackFaceTexture } from '../lib/usePackFaceTexture'

const SPARKLE_COUNT = 18

interface PackMeshProps {
  colorFrom: string
  colorTo: string
  logoImage?: string
  tearing: boolean
}

function PackMesh({ colorFrom, colorTo, logoImage, tearing }: PackMeshProps) {
  const faceTexture = usePackFaceTexture(colorFrom, colorTo, logoImage)

  const groupRef = useRef<THREE.Group>(null)
  const packRef = useRef<THREE.Mesh>(null)
  const flashRef = useRef<THREE.Mesh>(null)
  const sparkleGroupRef = useRef<THREE.Group>(null)
  const progress = useRef(0)
  const clock = useRef(0)

  const sparkleDirs = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }, () => {
        const angle = Math.random() * Math.PI * 2
        const upward = 0.4 + Math.random() * 0.9
        const radius = 0.9 + Math.random() * 1.6
        return new THREE.Vector3(Math.cos(angle) * radius, upward * radius, (Math.random() - 0.5) * 1.2)
      }),
    [],
  )

  const materials = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: colorTo, metalness: 0.55, roughness: 0.35 })
    const topBottom = new THREE.MeshStandardMaterial({ color: colorFrom, metalness: 0.5, roughness: 0.4 })
    const frontBack = new THREE.MeshStandardMaterial({
      map: faceTexture ?? undefined,
      color: faceTexture ? '#ffffff' : colorFrom,
      metalness: 0.25,
      roughness: 0.45,
    })
    return [side, side, topBottom, topBottom, frontBack, frontBack]
  }, [colorFrom, colorTo, faceTexture])

  useFrame((_, delta) => {
    const group = groupRef.current
    const pack = packRef.current
    const flash = flashRef.current
    const sparkles = sparkleGroupRef.current
    if (!group || !pack) return

    clock.current += delta

    if (!tearing) {
      group.rotation.y += delta * 0.5
      group.rotation.x = Math.sin(clock.current * 0.7) * 0.06
      group.position.y = Math.sin(clock.current * 1.1) * 0.09
      pack.scale.setScalar(1)
      materials.forEach((m) => {
        m.transparent = false
        m.opacity = 1
      })
      if (flash) (flash.material as THREE.MeshBasicMaterial).opacity = 0
      if (sparkles) sparkles.visible = false
      return
    }

    progress.current = Math.min(progress.current + delta / 1.15, 1)
    const p = progress.current
    const ease = 1 - Math.pow(1 - p, 3)

    group.rotation.y += delta * (0.5 + ease * 9)
    pack.scale.setScalar(1 + ease * 0.4)

    const fadeStart = 0.55
    const fadeT = p < fadeStart ? 0 : (p - fadeStart) / (1 - fadeStart)
    materials.forEach((m) => {
      m.transparent = true
      m.opacity = 1 - fadeT
    })

    if (flash) {
      const flashT = Math.max(0, Math.min(1, (p - 0.35) / 0.35))
      const mat = flash.material as THREE.MeshBasicMaterial
      mat.opacity = Math.sin(flashT * Math.PI) * 0.9
      flash.scale.setScalar(0.4 + flashT * 2.2)
    }

    if (sparkles) {
      sparkles.visible = p > 0.3
      const burstT = Math.max(0, Math.min(1, (p - 0.3) / 0.7))
      sparkles.children.forEach((child, i) => {
        const dir = sparkleDirs[i]
        child.position.set(dir.x * burstT, dir.y * burstT, dir.z * burstT)
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
        mat.opacity = (1 - burstT) * 0.9
        child.scale.setScalar(1 - burstT * 0.4)
      })
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={packRef} material={materials}>
        <boxGeometry args={[0.92, 2.3, 0.2]} />
      </mesh>
      <mesh ref={flashRef}>
        <circleGeometry args={[0.9, 32]} />
        <meshBasicMaterial color={colorFrom} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={sparkleGroupRef} visible={false}>
        {sparkleDirs.map((_, i) => (
          <mesh key={i}>
            <circleGeometry args={[0.055, 8]} />
            <meshBasicMaterial color={i % 2 === 0 ? colorFrom : '#ffffff'} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

interface PackVisualProps {
  colorFrom: string
  colorTo: string
  logoImage?: string
  tearing: boolean
}

export function PackVisual({ colorFrom, colorTo, logoImage, tearing }: PackVisualProps) {
  return (
    <Canvas camera={{ position: [0, 0, 4.4], fov: 38 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <pointLight position={[-3, -1.5, 2.5]} intensity={0.6} color={colorFrom} />
      <pointLight position={[2.5, 2, 3]} intensity={0.4} color="#ffffff" />
      <PackMesh colorFrom={colorFrom} colorTo={colorTo} logoImage={logoImage} tearing={tearing} />
    </Canvas>
  )
}
