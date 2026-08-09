import { motion } from 'framer-motion'
import type { CardData } from '../lib/types'
import { getRarityStyle, isHolo } from '../lib/rarity'

interface CardTileProps {
  card: CardData
  size?: 'sm' | 'lg'
  isDuplicate?: boolean
  isClimax?: boolean
  /** Aantal exemplaren in bezit. Toont een "×N"-badge i.p.v. "Dupe" als > 1. */
  quantity?: number
}

export function CardTile({ card, size = 'sm', isDuplicate, isClimax, quantity }: CardTileProps) {
  const style = getRarityStyle(card.rarity)
  const dims = size === 'lg' ? 'w-56 h-80 sm:w-64 sm:h-[23rem]' : 'w-24 h-36'
  const glowColor = card.colorFrom ?? '#ffd166'

  return (
    <div
      className={`relative ${dims} rounded-xl ring-2 ${style.ring} ${style.glow} overflow-hidden select-none bg-slate-800`}
      style={
        card.colorFrom && card.colorTo
          ? { background: `linear-gradient(155deg, ${card.colorFrom}, ${card.colorTo})` }
          : undefined
      }
    >
      {card.image && (
        <img
          src={card.image}
          alt={card.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {isHolo(card.rarity) && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.55) 35%, rgba(255,255,255,0.05) 45%, transparent 60%)',
            mixBlendMode: 'overlay',
          }}
          animate={{ backgroundPositionX: ['-120%', '220%'] }}
          transition={{
            duration: isClimax ? 2.2 : 3.2,
            repeat: Infinity,
            repeatDelay: isClimax ? 0.4 : 1.4,
            ease: 'easeInOut',
          }}
        />
      )}

      {isClimax && (
        <motion.div
          className="pointer-events-none absolute -inset-6 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${glowColor}aa, transparent 70%)` }}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative flex h-full flex-col p-2.5">
        <div className="flex items-start justify-between">
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${style.badge} ${
              size === 'sm' ? 'text-[7px]' : ''
            }`}
          >
            {card.rarity}
          </span>
          {quantity && quantity > 1 ? (
            <span className="rounded-full bg-black/40 px-1.5 py-0.5 text-[8px] font-semibold text-white/80">
              ×{quantity}
            </span>
          ) : (
            isDuplicate && (
              <span className="rounded-full bg-black/40 px-1.5 py-0.5 text-[8px] font-semibold text-white/80">
                Dupe
              </span>
            )
          )}
        </div>

        {!card.image && (
          <div className="flex flex-1 items-center justify-center">
            <span className={size === 'lg' ? 'text-7xl drop-shadow-lg' : 'text-3xl'}>
              {card.glyph}
            </span>
          </div>
        )}
        {card.image && <div className="flex-1" />}

        <div className="rounded-md bg-black/30 px-2 py-1 backdrop-blur-sm">
          <p className={`truncate font-semibold text-white ${size === 'lg' ? 'text-sm' : 'text-[9px]'}`}>
            {card.name}
          </p>
          {size === 'lg' && (
            <p className="truncate text-[10px] text-white/70">
              {card.setName} · {card.number}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function LockedCardTile({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const dims = size === 'lg' ? 'w-56 h-80 sm:w-64 sm:h-[23rem]' : 'w-24 h-36'
  return (
    <div
      className={`relative ${dims} rounded-xl ring-1 ring-white/5 overflow-hidden bg-white/[0.03]`}
    >
      <div className="flex h-full items-center justify-center">
        <span className="text-2xl text-white/15">?</span>
      </div>
    </div>
  )
}

export function CardBack({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const dims = size === 'lg' ? 'w-56 h-80 sm:w-64 sm:h-[23rem]' : 'w-24 h-36'
  return (
    <div
      className={`relative ${dims} rounded-xl ring-2 ring-white/10 overflow-hidden`}
      style={{ background: 'linear-gradient(155deg, #2a1f4d, #120b26)' }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 14px)',
        }}
      />
      <div className="relative flex h-full items-center justify-center">
        <span className="text-4xl opacity-80">⬡</span>
      </div>
    </div>
  )
}
