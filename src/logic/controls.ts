/** Which way to walk: -1 = left, 1 = right, 0 = stand still (also when both are held). */
export function walkDirection(left: boolean, right: boolean): -1 | 0 | 1 {
  if (left === right) return 0;
  return left ? -1 : 1;
}
