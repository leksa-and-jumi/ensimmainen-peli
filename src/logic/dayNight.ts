/**
 * How dark it is: 0 = bright day, 1 = darkest night.
 *
 * One cycle goes: day, dusk (getting darker), night, dawn (getting lighter).
 * Dusk and dawn each take `fadeFraction` of the cycle; day and night share
 * the rest equally.
 */
export function darkness(timeMs: number, cycleMs: number, fadeFraction: number): number {
  if (cycleMs <= 0) throw new RangeError(`cycleMs (${cycleMs}) must be positive`);
  if (fadeFraction <= 0 || fadeFraction > 0.5) {
    throw new RangeError(`fadeFraction (${fadeFraction}) must be in (0, 0.5]`);
  }

  const p = (((timeMs % cycleMs) + cycleMs) % cycleMs) / cycleMs;
  const duskStart = 0.5 - fadeFraction;
  const dawnStart = 1 - fadeFraction;

  if (p < duskStart) return 0;
  if (p < 0.5) return (p - duskStart) / fadeFraction;
  if (p < dawnStart) return 1;
  return 1 - (p - dawnStart) / fadeFraction;
}
