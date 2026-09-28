import { describe, expect, it } from 'vitest';
import { leafTilt, leafX, spawnLeaf, stepLeaf, type LeafRules } from './fallingLeaf';

const rules: LeafRules = {
  fallSpeed: 50,
  swayPixels: 20,
  swayPeriodMs: 1000,
  spread: 40,
  maxWaitMs: 3000,
};

describe('spawnLeaf', () => {
  const points = [
    { x: 100, y: 10 },
    { x: 500, y: 30 },
  ];

  it('starts near one of the spawn points', () => {
    const leaf = spawnLeaf(points, rules, () => 0.5);
    expect(leaf.startX).toBe(500);
    expect(leaf.y).toBe(30);
    expect(leaf.waitMs).toBe(1500);
    expect(leaf.ageMs).toBe(0);
  });

  it('can start at the first spawn point too', () => {
    const leaf = spawnLeaf(points, rules, () => 0);
    expect(leaf.startX).toBe(80);
    expect(leaf.y).toBe(10);
  });

  it('needs at least one spawn point', () => {
    expect(() => spawnLeaf([], rules)).toThrow();
  });
});

describe('stepLeaf', () => {
  const leaf = { startX: 100, y: 0, ageMs: 0, waitMs: 0, phase: 0 };

  it('waits before falling', () => {
    const next = stepLeaf({ ...leaf, waitMs: 500 }, 100, rules);
    expect(next.waitMs).toBe(400);
    expect(next.y).toBe(0);
  });

  it('falls down after waiting', () => {
    const next = stepLeaf(leaf, 1000, rules);
    expect(next.y).toBe(50);
    expect(next.ageMs).toBe(1000);
  });
});

describe('leafX and leafTilt', () => {
  it('sways from side to side around the start', () => {
    const leaf = { startX: 100, y: 0, ageMs: 0, waitMs: 0, phase: 0 };
    expect(leafX(leaf, rules)).toBeCloseTo(100);
    expect(leafX({ ...leaf, ageMs: 250 }, rules)).toBeCloseTo(120);
    expect(leafX({ ...leaf, ageMs: 750 }, rules)).toBeCloseTo(80);
  });

  it('tilts most when turning around', () => {
    const leaf = { startX: 100, y: 0, ageMs: 0, waitMs: 0, phase: 0 };
    expect(leafTilt(leaf, rules)).toBeCloseTo(0.6);
    expect(leafTilt({ ...leaf, ageMs: 250 }, rules)).toBeCloseTo(0);
  });
});
