import { describe, expect, it } from 'vitest';
import { birdCall, nextCallDelayMs, pickCallKind, type BirdCallRules } from './birdCalls';

const rules: BirdCallRules = {
  hootChance: 0.3,
  tweet: { minNotes: 2, maxNotes: 5, minHz: 2000, maxHz: 3000, gapMs: 100, noteMs: 60 },
  hoot: { minHz: 400, maxHz: 500, gapMs: 300, noteMs: 250 },
};

describe('pickCallKind', () => {
  it('hoots sometimes and tweets otherwise', () => {
    expect(pickCallKind(rules, () => 0.1)).toBe('hoot');
    expect(pickCallKind(rules, () => 0.9)).toBe('tweet');
  });
});

describe('birdCall', () => {
  it('makes a hoot of two falling notes', () => {
    const notes = birdCall('hoot', rules, () => 0);
    expect(notes).toHaveLength(2);
    expect(notes[1]?.startMs).toBe(300);
    expect(notes[0]?.fromHz).toBeCloseTo(440);
    expect(notes[0]?.toHz).toBeCloseTo(360);
  });

  it('makes tweets of rising notes', () => {
    const notes = birdCall('tweet', rules, () => 0);
    expect(notes).toHaveLength(2);
    expect(notes[0]?.fromHz).toBe(2000);
    expect(notes[0]?.toHz).toBeCloseTo(2800);
    expect(notes[1]?.startMs).toBe(100);
  });

  it('never makes more tweets than the maximum', () => {
    expect(birdCall('tweet', rules, () => 1)).toHaveLength(5);
  });
});

describe('nextCallDelayMs', () => {
  it('is between the min and max', () => {
    expect(nextCallDelayMs(500, 1500, () => 0)).toBe(500);
    expect(nextCallDelayMs(500, 1500, () => 0.5)).toBe(1000);
  });
});
