import { describe, expect, it } from 'vitest';
import { blinkVisible, isProtected, loseLife } from './lives';

describe('loseLife', () => {
  it('takes one life away', () => {
    expect(loseLife(4)).toBe(3);
    expect(loseLife(1)).toBe(0);
  });

  it('never goes below zero', () => {
    expect(loseLife(0)).toBe(0);
  });
});

describe('isProtected', () => {
  it('is not protected before any hit', () => {
    expect(isProtected(1000, null, 2000)).toBe(false);
  });

  it('is protected for a moment after a hit', () => {
    expect(isProtected(1500, 1000, 2000)).toBe(true);
    expect(isProtected(3000, 1000, 2000)).toBe(false);
  });
});

describe('blinkVisible', () => {
  it('is visible when not protected', () => {
    expect(blinkVisible(5000, null, 2000, 100)).toBe(true);
    expect(blinkVisible(5000, 1000, 2000, 100)).toBe(true);
  });

  it('blinks while protected, starting hidden', () => {
    expect(blinkVisible(1050, 1000, 2000, 100)).toBe(false);
    expect(blinkVisible(1150, 1000, 2000, 100)).toBe(true);
    expect(blinkVisible(1250, 1000, 2000, 100)).toBe(false);
  });
});
