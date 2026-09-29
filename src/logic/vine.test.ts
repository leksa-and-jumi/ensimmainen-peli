import { describe, expect, it } from 'vitest';
import {
  approach,
  findGrabbableVine,
  pointOnCurve,
  stepSpring,
  swingAngle,
  vineCurve,
  vineTip,
} from './vine';

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

describe('stepSpring', () => {
  it('pulls towards the target', () => {
    const next = stepSpring({ pos: 0, vel: 0 }, 10, 100, 0, 0.01);
    expect(next.vel).toBeGreaterThan(0);
    expect(next.pos).toBeGreaterThan(0);
  });

  it('bounces past the target and settles there', () => {
    let spring = { pos: 0, vel: 0 };
    let overshot = false;
    for (let i = 0; i < 1000; i++) {
      spring = stepSpring(spring, 10, 100, 5, 0.01);
      if (spring.pos > 10) overshot = true;
    }
    expect(overshot).toBe(true);
    expect(spring.pos).toBeCloseTo(10);
  });
});

describe('vineCurve', () => {
  const vine = { anchorX: 100, length: 200 };

  it('is straight down when still', () => {
    const curve = vineCurve(vine, 0, 0, 0.2);
    expect(curve.start).toEqual({ x: 100, y: 0 });
    expect(curve.control.x).toBeCloseTo(100);
    expect(curve.control.y).toBeCloseTo(100);
    expect(curve.end).toEqual({ x: 100, y: 200 });
  });

  it('ends at the tip and bends against the swing', () => {
    const curve = vineCurve(vine, 0.3, 1, 0.2);
    expect(curve.end).toEqual(vineTip(vine, 0.3));
    // Swinging clockwise (tip moving left), the middle lags to the right.
    const straight = vineCurve(vine, 0.3, 0, 0.2);
    expect(curve.control.x).toBeGreaterThan(straight.control.x);
  });
});

describe('pointOnCurve', () => {
  it('starts at the anchor and ends at the tip', () => {
    const curve = { start: { x: 0, y: 0 }, control: { x: 10, y: 50 }, end: { x: 0, y: 100 } };
    expect(pointOnCurve(curve, 0)).toEqual({ x: 0, y: 0 });
    expect(pointOnCurve(curve, 1)).toEqual({ x: 0, y: 100 });
    expect(pointOnCurve(curve, 0.5)).toEqual({ x: 5, y: 50 });
  });
});
