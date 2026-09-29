import type { Chirp } from './birdCalls';

export interface BeepRules {
  count: number;
  firstHz: number;
  /** Each beep is this much of the one before, so they go lower and lower. */
  stepRatio: number;
  beepMs: number;
  /** Time from the start of one beep to the start of the next. */
  gapMs: number;
  /** The last beep is longer, like a sad "piiiip". */
  lastBeepMs: number;
}

/** A row of beeps, each lower than the one before: piip, piip, piiiip. */
export function beepNotes(rules: BeepRules): Chirp[] {
  return Array.from({ length: rules.count }, (_, i) => {
    const hz = rules.firstHz * rules.stepRatio ** i;
    return {
      startMs: i * rules.gapMs,
      durationMs: i === rules.count - 1 ? rules.lastBeepMs : rules.beepMs,
      fromHz: hz,
      toHz: hz,
    };
  });
}
