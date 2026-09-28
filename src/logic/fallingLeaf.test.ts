import { describe, expect, it } from 'vitest';
import { calmLeafDue, leafTilt, leafX, spawnLeaf, stepLeaf, type LeafRules } from './fallingLeaf';

const rules: LeafRules = {
  fallSpeed: 50,
  swayPixels: 20,
  swayPeriodMs: 1000,
  spread: 40,
  windDrift: 60,
};

const leaf = { startX: 100, y: 0, ageMs: 0, phase: 0, driftX: 0 };

describe('spawnLeaf', () => {
  const points = [
    { x: 100, y: 10 },
    { x: 500, y: 30 },
  ];

  it('starts near one of the spawn points', () => {
    const spawned = spawnLeaf(points, rules, () => 0.5);
    expect(spawned.startX).toBe(500);
    expect(spawned.y).toBe(30);
    expect(spawned.ageMs).toBe(0);
    expect(spawned.driftX).toBe(0);
  });

  it('can start at the first spawn point too', () => {
    const spawned = spawnLeaf(points, rules, () => 0);
    expect(spawned.startX).toBe(80);
    expect(spawned.y).toBe(10);
  });

  it('needs at least one spawn point', () => {
    expect(() => spawnLeaf([], rules)).toThrow();
  });
});

describe('stepLeaf', () => {
  it('falls down', () => {
    const next = stepLeaf(leaf, 1000, rules, 0);
    expect(next.y).toBe(50);
    expect(next.ageMs).toBe(1000);
    expect(next.driftX).toBe(0);
  });

  it('is carried sideways by the wind', () => {
    expect(stepLeaf(leaf, 1000, rules, 0.5).driftX).toBe(30);
    expect(stepLeaf(leaf, 1000, rules, 1).driftX).toBe(60);
  });
});

describe('leafX and leafTilt', () => {
  it('sways from side to side around its path', () => {
    expect(leafX(leaf, rules)).toBeCloseTo(100);
    expect(leafX({ ...leaf, ageMs: 250 }, rules)).toBeCloseTo(120);
    expect(leafX({ ...leaf, ageMs: 750 }, rules)).toBeCloseTo(80);
    expect(leafX({ ...leaf, driftX: 30 }, rules)).toBeCloseTo(130);
  });

  it('tilts most when turning around', () => {
    expect(leafTilt(leaf, rules)).toBeCloseTo(0.6);
    expect(leafTilt({ ...leaf, ageMs: 250 }, rules)).toBeCloseTo(0);
  });
});

describe('calmLeafDue', () => {
  it('lets a leaf fall now and then', () => {
    // 0.5 leaves a second, 100 ms frame: a 5 % chance.
    expect(calmLeafDue(100, 0.5, () => 0.04)).toBe(true);
    expect(calmLeafDue(100, 0.5, () => 0.06)).toBe(false);
  });
});
