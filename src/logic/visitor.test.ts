import { describe, expect, it } from 'vitest';
import { awayTime, stepVisitor, type VisitorRules } from './visitor';

const rules: VisitorRules = {
  speed: 100,
  awayMinMs: 1000,
  awayMaxMs: 3000,
  leftX: -50,
  rightX: 850,
};

describe('awayTime', () => {
  it('is between the min and max time', () => {
    expect(awayTime(rules, () => 0)).toBe(1000);
    expect(awayTime(rules, () => 0.5)).toBe(2000);
    expect(awayTime(rules, () => 1)).toBe(3000);
  });
});

describe('stepVisitor', () => {
  it('stays away until the time is up', () => {
    expect(stepVisitor({ phase: 'away', timeLeftMs: 500 }, 100, rules)).toEqual({
      phase: 'away',
      timeLeftMs: 400,
    });
  });

  it('comes in from the left or the right when the time is up', () => {
    expect(stepVisitor({ phase: 'away', timeLeftMs: 50 }, 100, rules, () => 0.2)).toEqual({
      phase: 'walking',
      x: -50,
      direction: 1,
    });
    expect(stepVisitor({ phase: 'away', timeLeftMs: 50 }, 100, rules, () => 0.8)).toEqual({
      phase: 'walking',
      x: 850,
      direction: -1,
    });
  });

  it('walks across the screen', () => {
    expect(stepVisitor({ phase: 'walking', x: 100, direction: 1 }, 100, rules)).toEqual({
      phase: 'walking',
      x: 110,
      direction: 1,
    });
  });

  it('goes away after walking out on the other side', () => {
    expect(stepVisitor({ phase: 'walking', x: 845, direction: 1 }, 100, rules, () => 0)).toEqual({
      phase: 'away',
      timeLeftMs: 1000,
    });
    expect(stepVisitor({ phase: 'walking', x: -45, direction: -1 }, 100, rules, () => 0)).toEqual({
      phase: 'away',
      timeLeftMs: 1000,
    });
  });
});
