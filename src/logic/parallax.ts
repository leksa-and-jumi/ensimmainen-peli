/**
 * How far a background layer slides sideways. When the monkey moves right,
 * the layers slide a little left; near layers (bigger factor) slide more
 * than far ones, which makes the background look deep.
 */
export function parallaxOffset(focusX: number, centerX: number, factor: number): number {
  return -(focusX - centerX) * factor;
}
