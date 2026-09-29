/**
 * How visible the game's name is at the start: fully visible for `showMs`,
 * then fading away over `fadeMs`. 1 = fully visible, 0 = gone.
 */
export function titleAlpha(timeMs: number, showMs: number, fadeMs: number): number {
  if (timeMs <= showMs) return 1;
  if (fadeMs <= 0) return 0;
  return Math.max(0, 1 - (timeMs - showMs) / fadeMs);
}
