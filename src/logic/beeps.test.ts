import { describe, expect, it } from 'vitest';
import { beepNotes } from './beeps';

const rules = {
  count: 3,
  firstHz: 800,
  stepRatio: 0.5,
  beepMs: 100,
  gapMs: 200,
  lastBeepMs: 300,
};

describe('beepNotes', () => {
  it('makes the asked number of beeps, one after another', () => {
    const notes = beepNotes(rules);
    expect(notes).toHaveLength(3);
    expect(notes.map((n) => n.startMs)).toEqual([0, 200, 400]);
  });

  it('goes lower with each beep and keeps each beep steady', () => {
    const notes = beepNotes(rules);
    expect(notes.map((n) => n.fromHz)).toEqual([800, 400, 200]);
    expect(notes.every((n) => n.fromHz === n.toHz)).toBe(true);
  });

  it('makes the last beep longer', () => {
    expect(beepNotes(rules).map((n) => n.durationMs)).toEqual([100, 100, 300]);
  });
});
