/**
 * A leaf that falls from a tree. It falls down while swaying from side to
 * side around `startX`, and the wind carries it sideways (`driftX`).
 */
export interface FallingLeaf {
  startX: number;
  y: number;
  ageMs: number;
  phase: number;
  driftX: number;
}

export interface LeafRules {
  fallSpeed: number; // pixels per second
  swayPixels: number;
  swayPeriodMs: number;
  /** How far sideways from the spawn point a leaf may start. */
  spread: number;
  /** How fast the strongest wind carries a leaf sideways, in pixels per second. */
  windDrift: number;
}

/** A new leaf at one of the spawn points. */
export function spawnLeaf(
  spawnPoints: readonly { x: number; y: number }[],
  rules: LeafRules,
  random: () => number = Math.random,
): FallingLeaf {
  const index = Math.min(Math.floor(random() * spawnPoints.length), spawnPoints.length - 1);
  const point = spawnPoints[index];
  if (!point) throw new Error('Leaves need at least one spawn point');
  return {
    startX: point.x + (random() - 0.5) * rules.spread,
    y: point.y,
    ageMs: 0,
    phase: random() * 2 * Math.PI,
    driftX: 0,
  };
}

/** Moves the leaf one step down, and sideways with the wind (0 = calm, 1 = strongest). */
export function stepLeaf(
  leaf: FallingLeaf,
  dtMs: number,
  rules: LeafRules,
  wind: number,
): FallingLeaf {
  const dt = dtMs / 1000;
  return {
    ...leaf,
    ageMs: leaf.ageMs + dtMs,
    y: leaf.y + rules.fallSpeed * dt,
    driftX: leaf.driftX + wind * rules.windDrift * dt,
  };
}

/** Where the leaf is sideways right now, swaying around its path. */
export function leafX(leaf: FallingLeaf, rules: LeafRules): number {
  return leaf.startX + leaf.driftX + rules.swayPixels * Math.sin(swayAngle(leaf, rules));
}

/** The leaf tilts one way and the other as it sways. In radians. */
export function leafTilt(leaf: FallingLeaf, rules: LeafRules): number {
  return 0.6 * Math.cos(swayAngle(leaf, rules));
}

/**
 * In calm weather a single leaf falls now and then. True when one should fall
 * during this frame, on average `perSecond` times a second.
 */
export function calmLeafDue(
  dtMs: number,
  perSecond: number,
  random: () => number = Math.random,
): boolean {
  return random() < (perSecond * dtMs) / 1000;
}

function swayAngle(leaf: FallingLeaf, rules: LeafRules): number {
  return (2 * Math.PI * leaf.ageMs) / rules.swayPeriodMs + leaf.phase;
}
