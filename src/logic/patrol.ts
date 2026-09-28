/** Something that walks back and forth. `direction` is 1 (right) or -1 (left). */
export interface Patrol {
  x: number;
  direction: 1 | -1;
}

/** Moves the walker and turns it around at the edges of [minX, maxX]. */
export function stepPatrol(
  patrol: Patrol,
  speed: number,
  dtSeconds: number,
  minX: number,
  maxX: number,
): Patrol {
  const x = patrol.x + patrol.direction * speed * dtSeconds;
  if (x >= maxX) return { x: maxX, direction: -1 };
  if (x <= minX) return { x: minX, direction: 1 };
  return { x, direction: patrol.direction };
}
