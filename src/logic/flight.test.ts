import { describe, expect, it } from 'vitest';
import { bobOffset, flapFrame, stepFlight } from './flight';

describe('stepFlight', () => {
  it('flies in its direction', () => {
    expect(stepFlight(100, 1, 50, 0.1, 0, 800)).toBe(105);
    expect(stepFlight(100, -1, 50, 0.1, 0, 800)).toBe(95);
  });

  it('comes back from the other side', () => {
    expect(stepFlight(799, 1, 50, 0.1, 0, 800)).toBe(0);
    expect(stepFlight(1, -1, 50, 0.1, 0, 800)).toBe(800);
  });
});

describe('bobOffset', () => {
  it('goes up and down', () => {
    expect(bobOffset(0, 6, 1000)).toBeCloseTo(0);
    expect(bobOffset(250, 6, 1000)).toBeCloseTo(6);
    expect(bobOffset(750, 6, 1000)).toBeCloseTo(-6);
  });

  it('rejects a non-positive period', () => {
    expect(() => bobOffset(0, 6, 0)).toThrow(RangeError);
  });
});

describe('flapFrame', () => {
  it('switches wings every flap', () => {
    expect(flapFrame(0, 100)).toBe(0);
    expect(flapFrame(150, 100)).toBe(1);
    expect(flapFrame(250, 100)).toBe(0);
  });
});
