import { describe, expect, it } from 'vitest';
import { walkDirection } from './controls';

describe('walkDirection', () => {
  it('walks the way that is held', () => {
    expect(walkDirection(true, false)).toBe(-1);
    expect(walkDirection(false, true)).toBe(1);
  });

  it('stands still when nothing or both are held', () => {
    expect(walkDirection(false, false)).toBe(0);
    expect(walkDirection(true, true)).toBe(0);
  });
});
