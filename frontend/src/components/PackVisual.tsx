import { motion } from 'framer-motion'

// Vervangt de oude three.js/WebGL-doos (die alleen een egale kleurverloop-blok liet zien, geen
// enkele link met de echte set) door de echte set-logo-afbeelding op een booster-vormig paneel.
// Puur CSS/Framer Motion i.p.v. WebGL-textures: geen CORS-gedoe met externe afbeeldingen
// (images.pokemontcg.io), en werkt voor alle 174 gesyncte sets zonder handmatige 3D-assets.
interface PackVisualProps {
  colorFrom: string
  colorTo: string
  logoImage?: string
  tearing: boolean
}

function PackFace({
  colorFrom,
  colorTo,
  logoImage,
  clip,
}: {
  colorFrom: string
  colorTo: string
  logoImage?: string
  clip: 'left' | 'right'
}) {
  return (
    <div
      className="absolute inset-[6%] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15"
      style={{
        background: `linear-gradient(160deg, ${colorFrom}, ${colorTo})`,
        clipPath: clip === 'left' ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)',
      }}
    >
      {logoImage && (
        <img
          src={logoImage}
          alt=""
          className="absolute left-1/2 top-1/2 h-[62%] w-[80%] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-lg"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/25" />
      <div className="pointer-events-none absolute -inset-y-10 left-1/3 w-1/4 -skew-x-12 bg-white/20 blur-md" />
    </div>
  )
}

export function PackVisual({ colorFrom, colorTo, logoImage, tearing }: PackVisualProps) {
  return (
    <div className="relative h-full w-full" style={{ perspective: 900 }}>
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: 'center right' }}
        animate={
          tearing
            ? { x: '-14%', rotateZ: -14, opacity: 0 }
            : { rotateY: [-6, 6, -6], y: [0, -6, 0] }
        }
        transition={
          tearing
            ? { duration: 1.05, ease: 'easeIn' }
            : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <PackFace colorFrom={colorFrom} colorTo={colorTo} logoImage={logoImage} clip="left" />
      </motion.div>

      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: 'center left' }}
        animate={
          tearing
            ? { x: '14%', rotateZ: 14, opacity: 0 }
            : { rotateY: [-6, 6, -6], y: [0, -6, 0] }
        }
        transition={
          tearing
            ? { duration: 1.05, ease: 'easeIn' }
            : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <PackFace colorFrom={colorFrom} colorTo={colorTo} logoImage={logoImage} clip="right" />
      </motion.div>

      {!tearing && <div className="absolute inset-y-[8%] left-1/2 w-px -translate-x-1/2 bg-white/25" />}
    </div>
  )
}
