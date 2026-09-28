/** A moving body. Velocities are in pixels per second, y grows downwards. */
export interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
}

/** Allowed positions for the body. `maxY` is where it stands on the ground. */
export interface Area {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Moves the body one step with gravity and keeps it inside the area. */
export function stepBody(body: Body, dtSeconds: number, gravity: number, area: Area): Body {
  let vy = body.vy + gravity * dtSeconds;
  let y = body.y + vy * dtSeconds;
  let onGround = false;

  if (y >= area.maxY) {
    y = area.maxY;
    vy = 0;
    onGround = true;
  } else if (y < area.minY) {
    y = area.minY;
    vy = Math.max(vy, 0);
  }

  const x = Math.min(Math.max(body.x + body.vx * dtSeconds, area.minX), area.maxX);
  return { x, y, vx: body.vx, vy, onGround };
}

/** Velocity needed to move between two points in the given time. */
export function velocityBetween(
  from: { x: number; y: number },
  to: { x: number; y: number },
  dtSeconds: number,
): { vx: number; vy: number } {
  if (dtSeconds <= 0) return { vx: 0, vy: 0 };
  return { vx: (to.x - from.x) / dtSeconds, vy: (to.y - from.y) / dtSeconds };
}
