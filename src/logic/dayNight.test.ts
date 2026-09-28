import { describe, expect, it } from 'vitest';
import { darkness } from './dayNight';

// A 1000 ms cycle: day 0–400, dusk 400–500, night 500–900, dawn 900–1000.
describe('darkness', () => {
  it('is bright during the day', () => {
    expect(darkness(0, 1000, 0.1)).toBe(0);
    expect(darkness(399, 1000, 0.1)).toBe(0);
  });

  it('gets darker at dusk', () => {
    expect(darkness(450, 1000, 0.1)).toBeCloseTo(0.5);
  });

  it('is dark at night', () => {
    expect(darkness(500, 1000, 0.1)).toBe(1);
    expect(darkness(899, 1000, 0.1)).toBe(1);
  });

  it('gets lighter at dawn', () => {
    expect(darkness(950, 1000, 0.1)).toBeCloseTo(0.5);
  });

  it('starts a new day after each cycle', () => {
    expect(darkness(1000, 1000, 0.1)).toBe(0);
    expect(darkness(1450, 1000, 0.1)).toBeCloseTo(0.5);
  });

  it('rejects bad settings', () => {
    expect(() => darkness(0, 0, 0.1)).toThrow(RangeError);
    expect(() => darkness(0, 1000, 0)).toThrow(RangeError);
    expect(() => darkness(0, 1000, 0.6)).toThrow(RangeError);
  });
});
