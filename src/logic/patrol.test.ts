import { describe, expect, it } from 'vitest';
import { stepPatrol } from './patrol';

describe('stepPatrol', () => {
  it('walks in its direction', () => {
    expect(stepPatrol({ x: 50, direction: 1 }, 100, 0.1, 0, 100)).toEqual({ x: 60, direction: 1 });
    expect(stepPatrol({ x: 50, direction: -1 }, 100, 0.1, 0, 100)).toEqual({
      x: 40,
      direction: -1,
    });
  });

  it('turns around at the right edge', () => {
    expect(stepPatrol({ x: 95, direction: 1 }, 100, 0.1, 0, 100)).toEqual({
      x: 100,
      direction: -1,
    });
  });

  it('turns around at the left edge', () => {
    expect(stepPatrol({ x: 5, direction: -1 }, 100, 0.1, 0, 100)).toEqual({ x: 0, direction: 1 });
  });
});
