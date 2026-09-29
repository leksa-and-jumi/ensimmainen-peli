import { describe, expect, it } from 'vitest';
import { parallaxOffset } from './parallax';

describe('parallaxOffset', () => {
  it('does not move when the monkey is in the middle', () => {
    expect(parallaxOffset(400, 400, 0.1)).toBeCloseTo(0);
  });

  it('slides the other way than the monkey', () => {
    expect(parallaxOffset(600, 400, 0.1)).toBeCloseTo(-20);
    expect(parallaxOffset(200, 400, 0.1)).toBeCloseTo(20);
  });

  it('slides near layers more than far layers', () => {
    const far = Math.abs(parallaxOffset(700, 400, 0.02));
    const near = Math.abs(parallaxOffset(700, 400, 0.1));
    expect(near).toBeGreaterThan(far);
  });
});
