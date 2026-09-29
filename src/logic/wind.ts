/** One slow wave in the wind. Several waves together make it change naturally. */
export interface WindWave {
  amplitude: number;
  periodMs: number;
  phase: number;
}

/**
 * How hard the wind blows right now: 0 = calm, 1 = strongest gust.
 * Waves with different lengths add up, so the wind never repeats the same way
 * for a long time. When several waves peak together, there is a gust.
 */
export function windStrength(timeMs: number, base: number, waves: readonly WindWave[]): number {
  let wind = base;
  for (const wave of waves) {
    if (wave.periodMs <= 0) throw new RangeError('Wind wave periodMs must be positive');
    wind += wave.amplitude * Math.sin((2 * Math.PI * timeMs) / wave.periodMs + wave.phase);
  }
  return Math.min(1, Math.max(0, wind));
}

/** True at the moment the wind grows past the gust limit. */
export function gustStarted(previous: number, current: number, gustLimit: number): boolean {
  return previous < gustLimit && current >= gustLimit;
}

/**
 * How many pixels a tree top leans with the wind. It bends further in a
 * stronger wind, and flutters a little, each tree in its own rhythm.
 */
export function treeLean(
  wind: number,
  timeMs: number,
  treeIndex: number,
  leanPixels: number,
  flutterPixels: number,
  flutterMs: number,
): number {
  const flutter =
    flutterPixels * wind * Math.sin((2 * Math.PI * timeMs) / flutterMs + treeIndex * 1.7);
  return wind * leanPixels + flutter;
}
