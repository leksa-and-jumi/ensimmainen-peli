/**
 * Moves a flyer sideways. When it flies out of [minX, maxX] it comes back
 * in from the other side.
 */
export function stepFlight(
  x: number,
  direction: 1 | -1,
  speed: number,
  dtSeconds: number,
  minX: number,
  maxX: number,
): number {
  const next = x + direction * speed * dtSeconds;
  if (direction === 1 && next > maxX) return minX;
  if (direction === -1 && next < minX) return maxX;
  return next;
}

/** Small up-and-down movement while flying. */
export function bobOffset(timeMs: number, amplitude: number, periodMs: number, phase = 0): number {
  if (periodMs <= 0) {
    throw new RangeError(`periodMs (${periodMs}) must be positive`);
  }
  return amplitude * Math.sin((2 * Math.PI * timeMs) / periodMs + phase);
}

/** Which of the two wing pictures to show: 0 = wings up, 1 = wings down. */
export function flapFrame(timeMs: number, flapMs: number): 0 | 1 {
  return Math.floor(timeMs / flapMs) % 2 === 0 ? 0 : 1;
}
