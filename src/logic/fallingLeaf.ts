/**
 * A leaf that falls from a tree. It first waits (hidden) for `waitMs`, then
 * falls down while swaying from side to side around `startX`.
 */
export interface FallingLeaf {
  startX: number;
  y: number;
  ageMs: number;
  waitMs: number;
  phase: number;
}

export interface LeafRules {
  fallSpeed: number; // pixels per second
  swayPixels: number;
  swayPeriodMs: number;
  /** How far sideways from the spawn point a leaf may start. */
  spread: number;
  maxWaitMs: number;
}

/** A new leaf at one of the spawn points, waiting a random time before falling. */
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
    waitMs: random() * rules.maxWaitMs,
    phase: random() * 2 * Math.PI,
  };
}

/** Moves the leaf one step: waiting first, then falling. */
export function stepLeaf(leaf: FallingLeaf, dtMs: number, rules: LeafRules): FallingLeaf {
  if (leaf.waitMs > 0) return { ...leaf, waitMs: Math.max(0, leaf.waitMs - dtMs) };
  return { ...leaf, ageMs: leaf.ageMs + dtMs, y: leaf.y + rules.fallSpeed * (dtMs / 1000) };
}

/** Where the leaf is sideways right now, swaying around its start. */
export function leafX(leaf: FallingLeaf, rules: LeafRules): number {
  return leaf.startX + rules.swayPixels * Math.sin(swayAngle(leaf, rules));
}

/** The leaf tilts one way and the other as it sways. In radians. */
export function leafTilt(leaf: FallingLeaf, rules: LeafRules): number {
  return 0.6 * Math.cos(swayAngle(leaf, rules));
}

function swayAngle(leaf: FallingLeaf, rules: LeafRules): number {
  return (2 * Math.PI * leaf.ageMs) / rules.swayPeriodMs + leaf.phase;
}
