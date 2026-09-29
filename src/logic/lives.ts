/** One life less, but never below zero. */
export function loseLife(lives: number): number {
  return Math.max(0, lives - 1);
}

/** After a hit the monkey can't be hit again for a moment. */
export function isProtected(nowMs: number, hitAtMs: number | null, protectMs: number): boolean {
  return hitAtMs !== null && nowMs - hitAtMs < protectMs;
}

/** While protected the monkey blinks: shown and hidden in turns every `blinkMs`. */
export function blinkVisible(
  nowMs: number,
  hitAtMs: number | null,
  protectMs: number,
  blinkMs: number,
): boolean {
  if (!isProtected(nowMs, hitAtMs, protectMs) || hitAtMs === null) return true;
  return Math.floor((nowMs - hitAtMs) / blinkMs) % 2 === 1;
}
