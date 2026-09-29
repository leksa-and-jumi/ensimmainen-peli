import { describe, expect, it } from 'vitest';
import { frameIndex } from './animation';

describe('frameIndex', () => {
  it('counts through the pictures and starts again', () => {
    expect(frameIndex(0, 100, 4)).toBe(0);
    expect(frameIndex(150, 100, 4)).toBe(1);
    expect(frameIndex(399, 100, 4)).toBe(3);
    expect(frameIndex(400, 100, 4)).toBe(0);
  });

  it('rejects bad settings', () => {
    expect(() => frameIndex(0, 0, 4)).toThrow(RangeError);
    expect(() => frameIndex(0, 100, 0)).toThrow(RangeError);
  });
});
