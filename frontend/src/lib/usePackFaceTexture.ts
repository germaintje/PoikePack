import { useEffect, useState } from 'react'
import * as THREE from 'three'

// Bakt de echte set-logo-afbeelding (van images.pokemontcg.io — die CDN stuurt
// "Access-Control-Allow-Origin: *", dus dit kan zonder canvas te "taint") samen met de
// pack-kleuren op één canvas, en gebruikt dát als WebGL-textuur. Zo blijft de look consistent
// (gradient + shine) ongeacht of het logo zelf transparant is, i.p.v. een los `<img>` los op de
// mesh proberen te plakken.
export function usePackFaceTexture(colorFrom: string, colorTo: string, logoUrl?: string): THREE.CanvasTexture | null {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    let cancelled = false
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function paint(img?: HTMLImageElement) {
      if (!ctx) return
      const grad = ctx.createLinearGradient(0, 0, 512, 512)
      grad.addColorStop(0, colorFrom)
      grad.addColorStop(1, colorTo)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 512, 512)

      ctx.save()
      ctx.globalAlpha = 0.16
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(0, 512 * 0.12)
      ctx.lineTo(512 * 0.32, 0)
      ctx.lineTo(512 * 0.5, 0)
      ctx.lineTo(512 * 0.18, 512 * 0.36)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      if (img && img.width > 0) {
        const maxW = 512 * 0.74
        const maxH = 512 * 0.4
        const scale = Math.min(maxW / img.width, maxH / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.save()
        ctx.shadowColor = 'rgba(0,0,0,0.45)'
        ctx.shadowBlur = 20
        ctx.drawImage(img, (512 - w) / 2, (512 - h) / 2 + 30, w, h)
        ctx.restore()
      }

      if (cancelled) return
      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.needsUpdate = true
      setTexture((prev) => {
        prev?.dispose()
        return tex
      })
    }

    if (!logoUrl) {
      paint()
      return () => {
        cancelled = true
      }
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => paint(img)
    img.onerror = () => paint()
    img.src = logoUrl

    return () => {
      cancelled = true
    }
  }, [colorFrom, colorTo, logoUrl])

  useEffect(() => () => texture?.dispose(), [texture])

  return texture
}
