import { describe, expect, it } from 'vitest';
import { monkeyPose, type MonkeyState } from './pose';

const state = (overrides: Partial<MonkeyState>): MonkeyState => ({
  hanging: false,
  onGround: true,
  walking: false,
  ...overrides,
});

describe('monkeyPose', () => {
  it('stands still on the ground', () => {
    expect(monkeyPose(state({}), 0, 100, 300)).toBe('stand');
  });

  it('takes steps while walking', () => {
    expect(monkeyPose(state({ walking: true }), 50, 100, 300)).toBe('walkA');
    expect(monkeyPose(state({ walking: true }), 150, 100, 300)).toBe('walkB');
  });

  it('jumps in the air, even when walking keys are held', () => {
    expect(monkeyPose(state({ onGround: false, walking: true }), 0, 100, 300)).toBe('jump');
  });

  it('kicks its legs while hanging from a vine', () => {
    const hanging = state({ hanging: true, onGround: false });
    expect(monkeyPose(hanging, 100, 100, 300)).toBe('hangA');
    expect(monkeyPose(hanging, 400, 100, 300)).toBe('hangB');
  });
});
