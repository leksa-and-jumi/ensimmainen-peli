/** The pictures of the monkey. Two pictures in a row make a movement. */
export type MonkeyPose = 'stand' | 'walkA' | 'walkB' | 'jump' | 'hangA' | 'hangB';

export interface MonkeyState {
  hanging: boolean;
  onGround: boolean;
  walking: boolean;
}

/** Alternates between two pictures every `stepMs`. */
function alternate<T>(timeMs: number, stepMs: number, first: T, second: T): T {
  return Math.floor(timeMs / stepMs) % 2 === 0 ? first : second;
}

/** Which picture of the monkey to show right now. */
export function monkeyPose(
  state: MonkeyState,
  timeMs: number,
  stepMs: number,
  kickMs: number,
): MonkeyPose {
  if (state.hanging) return alternate(timeMs, kickMs, 'hangA', 'hangB');
  if (!state.onGround) return 'jump';
  if (state.walking) return alternate(timeMs, stepMs, 'walkA', 'walkB');
  return 'stand';
}
