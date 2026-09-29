import { describe, expect, it } from 'vitest';
import { gustStarted, treeLean, windStrength } from './wind';

describe('windStrength', () => {
  const waves = [
    { amplitude: 0.3, periodMs: 1000, phase: 0 },
    { amplitude: 0.2, periodMs: 400, phase: 0 },
  ];

  it('changes over time', () => {
    expect(windStrength(0, 0.4, waves)).toBeCloseTo(0.4);
    expect(windStrength(250, 0.4, waves)).not.toBeCloseTo(0.4);
  });

  it('stays between calm and strongest', () => {
    for (let t = 0; t < 5000; t += 37) {
      const wind = windStrength(
        t,
        0.5,
        waves.map((w) => ({ ...w, amplitude: 0.6 })),
      );
      expect(wind).toBeGreaterThanOrEqual(0);
      expect(wind).toBeLessThanOrEqual(1);
    }
  });

  it('rejects a wave without a length', () => {
    expect(() => windStrength(0, 0.4, [{ amplitude: 0.1, periodMs: 0, phase: 0 }])).toThrow(
      RangeError,
    );
  });
});

describe('gustStarted', () => {
  it('notices when the wind grows past the limit', () => {
    expect(gustStarted(0.5, 0.7, 0.6)).toBe(true);
  });

  it('does not repeat while the gust goes on or when it calms down', () => {
    expect(gustStarted(0.7, 0.8, 0.6)).toBe(false);
    expect(gustStarted(0.7, 0.5, 0.6)).toBe(false);
  });
});

describe('treeLean', () => {
  it('does not lean when calm', () => {
    expect(treeLean(0, 123, 2, 14, 3, 700)).toBe(0);
  });

  it('leans further in a stronger wind', () => {
    expect(treeLean(0.8, 0, 0, 14, 0, 700)).toBeGreaterThan(treeLean(0.3, 0, 0, 14, 0, 700));
  });

  it('flutters each tree in its own rhythm', () => {
    expect(treeLean(1, 100, 0, 14, 3, 700)).not.toBeCloseTo(treeLean(1, 100, 1, 14, 3, 700));
  });
});
