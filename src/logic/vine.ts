/** A vine hangs straight down from (anchorX, 0) when its angle is 0. */
export interface VineShape {
  anchorX: number;
  length: number;
}

/**
 * Position of the vine's tip. The angle is in radians and uses the same
 * direction as Phaser rotation (positive = clockwise, so the tip moves left).
 */
export function vineTip(vine: VineShape, angle: number): { x: number; y: number } {
  return {
    x: vine.anchorX - vine.length * Math.sin(angle),
    y: vine.length * Math.cos(angle),
  };
}

/** Back-and-forth swing angle at a moment in time. */
export function swingAngle(timeMs: number, amplitude: number, periodMs: number, phase = 0): number {
  if (periodMs <= 0) {
    throw new RangeError(`periodMs (${periodMs}) must be positive`);
  }
  return amplitude * Math.sin((2 * Math.PI * timeMs) / periodMs + phase);
}

/** Move `current` towards `target` by at most `maxStep`. */
export function approach(current: number, target: number, maxStep: number): number {
  if (current < target) return Math.min(current + maxStep, target);
  return Math.max(current - maxStep, target);
}

/**
 * Index of the first vine whose tip is within `radius` of the point, or null.
 * The vine at `ignoreIndex` is skipped (the one the monkey just let go of).
 */
export function findGrabbableVine(
  point: { x: number; y: number },
  tips: readonly { x: number; y: number }[],
  radius: number,
  ignoreIndex: number | null = null,
): number | null {
  for (const [index, tip] of tips.entries()) {
    if (index === ignoreIndex) continue;
    if (Math.hypot(point.x - tip.x, point.y - tip.y) <= radius) return index;
  }
  return null;
}
