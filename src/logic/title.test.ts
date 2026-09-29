import { describe, expect, it } from 'vitest';
import { titleAlpha } from './title';

describe('titleAlpha', () => {
  it('shows the name fully at first', () => {
    expect(titleAlpha(0, 2000, 1000)).toBe(1);
    expect(titleAlpha(2000, 2000, 1000)).toBe(1);
  });

  it('fades the name away', () => {
    expect(titleAlpha(2500, 2000, 1000)).toBeCloseTo(0.5);
  });

  it('is gone after fading', () => {
    expect(titleAlpha(3000, 2000, 1000)).toBe(0);
    expect(titleAlpha(9000, 2000, 1000)).toBe(0);
    expect(titleAlpha(2001, 2000, 0)).toBe(0);
  });
});
