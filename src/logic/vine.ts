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

/** A springy value, like how far a vine is stretched, and how fast it changes. */
export interface Spring {
  pos: number;
  vel: number;
}

/**
 * Moves a spring one step towards `target`. A stiff spring pulls harder,
 * damping slows the bouncing down so it settles.
 */
export function stepSpring(
  spring: Spring,
  target: number,
  stiffness: number,
  damping: number,
  dtSeconds: number,
): Spring {
  const force = -stiffness * (spring.pos - target) - damping * spring.vel;
  const vel = spring.vel + force * dtSeconds;
  return { pos: spring.pos + vel * dtSeconds, vel };
}

type Point = { x: number; y: number };

/** A curved vine: from the anchor through a bend towards the tip. */
export interface VineCurve {
  start: Point;
  control: Point;
  end: Point;
}

/**
 * The bent shape of a swinging vine. The upper part stays closer to straight
 * down and lags behind the swing (`angularVelocity` in radians per second,
 * `lagSeconds` how far behind), so the vine looks like a floppy rope.
 */
export function vineCurve(
  vine: VineShape,
  angle: number,
  angularVelocity: number,
  lagSeconds: number,
): VineCurve {
  const bendAngle = angle * 0.4 - angularVelocity * lagSeconds;
  return {
    start: { x: vine.anchorX, y: 0 },
    control: vineTip({ anchorX: vine.anchorX, length: vine.length / 2 }, bendAngle),
    end: vineTip(vine, angle),
  };
}

/** A point along the curve: f = 0 is the anchor, f = 1 is the tip. */
export function pointOnCurve(curve: VineCurve, f: number): Point {
  const a = (1 - f) * (1 - f);
  const b = 2 * (1 - f) * f;
  const c = f * f;
  return {
    x: a * curve.start.x + b * curve.control.x + c * curve.end.x,
    y: a * curve.start.y + b * curve.control.y + c * curve.end.y,
  };
}
