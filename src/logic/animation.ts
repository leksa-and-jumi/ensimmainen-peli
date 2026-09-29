/**
 * Which picture of an animation to show: counts 0, 1, 2 … up to
 * `frameCount - 1` and starts again, one picture every `frameMs`.
 */
export function frameIndex(timeMs: number, frameMs: number, frameCount: number): number {
  if (frameMs <= 0 || frameCount <= 0) {
    throw new RangeError('frameMs and frameCount must be positive');
  }
  return Math.floor(timeMs / frameMs) % frameCount;
}
