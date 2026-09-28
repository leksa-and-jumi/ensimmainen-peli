import { describe, expect, it } from 'vitest';
import { approach, findGrabbableVine, swingAngle, vineTip } from './vine';

describe('vineTip', () => {
  const vine = { anchorX: 100, length: 50 };

  it('hangs straight down at angle 0', () => {
    expect(vineTip(vine, 0)).toEqual({ x: 100, y: 50 });
  });

  it('moves the tip left for a positive (clockwise) angle', () => {
    const tip = vineTip(vine, Math.PI / 2);
    expect(tip.x).toBeCloseTo(50);
    expect(tip.y).toBeCloseTo(0);
  });
});

describe('swingAngle', () => {
  it('starts at zero and peaks at a quarter period', () => {
    expect(swingAngle(0, 0.5, 1000)).toBeCloseTo(0);
    expect(swingAngle(250, 0.5, 1000)).toBeCloseTo(0.5);
    expect(swingAngle(750, 0.5, 1000)).toBeCloseTo(-0.5);
  });

  it('uses the phase offset', () => {
    expect(swingAngle(0, 1, 1000, Math.PI / 2)).toBeCloseTo(1);
  });

  it('rejects a non-positive period', () => {
    expect(() => swingAngle(0, 1, 0)).toThrow(RangeError);
  });
});

describe('approach', () => {
  it('steps towards the target without overshooting', () => {
    expect(approach(0, 10, 3)).toBe(3);
    expect(approach(9, 10, 3)).toBe(10);
    expect(approach(10, 0, 4)).toBe(6);
    expect(approach(1, 0, 4)).toBe(0);
  });
});

describe('findGrabbableVine', () => {
  const tips = [
    { x: 0, y: 0 },
    { x: 100, y: 100 },
  ];

  it('finds a vine tip within the radius', () => {
    expect(findGrabbableVine({ x: 95, y: 104 }, tips, 10)).toBe(1);
  });

  it('returns null when no tip is close enough', () => {
    expect(findGrabbableVine({ x: 50, y: 50 }, tips, 10)).toBeNull();
  });

  it('skips the ignored vine', () => {
    expect(findGrabbableVine({ x: 1, y: 1 }, tips, 10, 0)).toBeNull();
  });
});
