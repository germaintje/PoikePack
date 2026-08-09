export function PokeballIcon({ className = 'h-6 w-6', spin = false }: { className?: string; spin?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`${className} ${spin ? 'animate-spin' : ''}`}
      style={spin ? { animationDuration: '2.5s' } : undefined}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22" fill="#f4f4f5" stroke="#18181b" strokeWidth="2.5" />
      <path d="M2 24a22 22 0 0 1 44 0Z" fill="#ef4444" stroke="#18181b" strokeWidth="2.5" />
      <rect x="2" y="21.5" width="44" height="5" fill="#18181b" />
      <circle cx="24" cy="24" r="7" fill="#f4f4f5" stroke="#18181b" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="3" fill="#f4f4f5" stroke="#18181b" strokeWidth="2" />
    </svg>
  )
}
