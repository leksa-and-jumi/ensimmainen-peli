import { describe, expect, it } from 'vitest';
import { jumpHeight, stepBody, velocityBetween, type Body } from './physics';

const area = { minX: 0, maxX: 100, minY: 0, maxY: 100 };
const body = (overrides: Partial<Body> = {}): Body => ({
  x: 50,
  y: 50,
  vx: 0,
  vy: 0,
  onGround: false,
  ...overrides,
});

describe('stepBody', () => {
  it('pulls the body down with gravity', () => {
    const next = stepBody(body(), 0.1, 100, area);
    expect(next.vy).toBeCloseTo(10);
    expect(next.y).toBeCloseTo(51);
    expect(next.onGround).toBe(false);
  });

  it('lands on the ground and stops falling', () => {
    const next = stepBody(body({ y: 99, vy: 500 }), 0.1, 100, area);
    expect(next.y).toBe(100);
    expect(next.vy).toBe(0);
    expect(next.onGround).toBe(true);
  });

  it('jumps up when given an upward speed', () => {
    const next = stepBody(body({ y: 100, vy: -200 }), 0.1, 100, area);
    expect(next.y).toBeLessThan(100);
    expect(next.onGround).toBe(false);
  });

  it('stops at the ceiling', () => {
    const next = stepBody(body({ y: 1, vy: -500 }), 0.1, 100, area);
    expect(next.y).toBe(0);
    expect(next.vy).toBe(0);
  });

  it('keeps the body between the walls', () => {
    expect(stepBody(body({ x: 95, vx: 200 }), 0.1, 0, area).x).toBe(100);
    expect(stepBody(body({ x: 5, vx: -200 }), 0.1, 0, area).x).toBe(0);
  });
});

describe('velocityBetween', () => {
  it('divides the distance by the time', () => {
    expect(velocityBetween({ x: 0, y: 10 }, { x: 5, y: 0 }, 0.5)).toEqual({ vx: 10, vy: -20 });
  });

  it('returns zero for no time', () => {
    expect(velocityBetween({ x: 0, y: 0 }, { x: 5, y: 5 }, 0)).toEqual({ vx: 0, vy: 0 });
  });
});

describe('jumpHeight', () => {
  it('goes higher with a faster jump', () => {
    expect(jumpHeight(800, 1500)).toBeCloseTo(213.33);
    expect(jumpHeight(400, 1500)).toBeCloseTo(53.33);
  });

  it('rejects no gravity', () => {
    expect(() => jumpHeight(800, 0)).toThrow(RangeError);
  });
});
