// Spiegelt backend com.pokepack.user.LevelCurve, puur voor het live tekenen van de
// XP-voortgangsbalk (bv. direct na een pack-opening) zonder op een profiel-refetch te wachten.
// De backend blijft de enige bron van waarheid voor xp/level zelf.

export function xpRequiredForLevel(level: number): number {
  return 50 * level * (level - 1)
}

export function levelProgress(xp: number, level: number): { current: number; span: number; pct: number } {
  const floor = xpRequiredForLevel(level)
  const ceil = xpRequiredForLevel(level + 1)
  const span = ceil - floor
  const current = Math.max(0, xp - floor)
  const pct = span > 0 ? Math.min(100, Math.round((current / span) * 100)) : 100
  return { current, span, pct }
}
