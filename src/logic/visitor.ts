/**
 * A visitor is away for a while, then walks across the screen from one side
 * to the other, leaves, and later comes back again.
 */
export type Visitor =
  { phase: 'away'; timeLeftMs: number } | { phase: 'walking'; x: number; direction: 1 | -1 };

export interface VisitorRules {
  speed: number; // pixels per second
  awayMinMs: number;
  awayMaxMs: number;
  /** Walking starts and ends at these x positions, just outside the screen. */
  leftX: number;
  rightX: number;
}

/** A random time to stay away, between the rule's min and max. */
export function awayTime(rules: VisitorRules, random: () => number = Math.random): number {
  return rules.awayMinMs + random() * (rules.awayMaxMs - rules.awayMinMs);
}

/** Advances the visitor by one frame. */
export function stepVisitor(
  visitor: Visitor,
  dtMs: number,
  rules: VisitorRules,
  random: () => number = Math.random,
): Visitor {
  if (visitor.phase === 'away') {
    const timeLeftMs = visitor.timeLeftMs - dtMs;
    if (timeLeftMs > 0) return { phase: 'away', timeLeftMs };
    return random() < 0.5
      ? { phase: 'walking', x: rules.leftX, direction: 1 }
      : { phase: 'walking', x: rules.rightX, direction: -1 };
  }

  const x = visitor.x + visitor.direction * rules.speed * (dtMs / 1000);
  const leftTheScreen = visitor.direction === 1 ? x >= rules.rightX : x <= rules.leftX;
  if (leftTheScreen) return { phase: 'away', timeLeftMs: awayTime(rules, random) };
  return { phase: 'walking', x, direction: visitor.direction };
}
