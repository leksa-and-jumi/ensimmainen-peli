/** One short whistle: the pitch slides from `fromHz` to `toHz`. */
export interface Chirp {
  startMs: number;
  durationMs: number;
  fromHz: number;
  toHz: number;
}

export type CallKind = 'tweet' | 'hoot';

export interface BirdCallRules {
  hootChance: number;
  tweet: {
    minNotes: number;
    maxNotes: number;
    minHz: number;
    maxHz: number;
    gapMs: number;
    noteMs: number;
  };
  hoot: { minHz: number; maxHz: number; gapMs: number; noteMs: number };
}

/** A random number between min and max. */
function between(min: number, max: number, random: () => number): number {
  return min + random() * (max - min);
}

/** Tweets are quick high whistles, hoots are two slow low notes. */
export function pickCallKind(rules: BirdCallRules, random: () => number = Math.random): CallKind {
  return random() < rules.hootChance ? 'hoot' : 'tweet';
}

/** The notes of one bird call. */
export function birdCall(
  kind: CallKind,
  rules: BirdCallRules,
  random: () => number = Math.random,
): Chirp[] {
  if (kind === 'hoot') {
    const { minHz, maxHz, gapMs, noteMs } = rules.hoot;
    const hz = between(minHz, maxHz, random);
    return [0, 1].map((i) => ({
      startMs: i * gapMs,
      durationMs: noteMs,
      fromHz: hz * 1.1,
      toHz: hz * 0.9,
    }));
  }

  const { minNotes, maxNotes, minHz, maxHz, gapMs, noteMs } = rules.tweet;
  const count = Math.floor(between(minNotes, maxNotes + 1, random));
  const hz = between(minHz, maxHz, random);
  return Array.from({ length: Math.min(count, maxNotes) }, (_, i) => ({
    startMs: i * gapMs,
    durationMs: noteMs,
    fromHz: hz,
    toHz: hz * 1.4,
  }));
}

/** How long to wait before the next bird call. */
export function nextCallDelayMs(
  minMs: number,
  maxMs: number,
  random: () => number = Math.random,
): number {
  return between(minMs, maxMs, random);
}
