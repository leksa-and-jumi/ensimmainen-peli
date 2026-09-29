import Phaser from 'phaser';
import { COLORS, JUNGLE, VINE } from '../config';
import { pointOnCurve, type VineCurve } from '../logic/vine';

/** A vine is redrawn every frame, because it bends and stretches. */
export function createVine(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.add.graphics();
}

/** A leaf: pointed at both ends, with a lighter middle vein. `angle` in radians. */
function drawLeaf(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  length: number,
  angle: number,
): void {
  const along = (d: number, side: number) => ({
    x: x + Math.cos(angle) * d - Math.sin(angle) * side,
    y: y + Math.sin(angle) * d + Math.cos(angle) * side,
  });
  const half = length / 2;
  const tip = along(half, 0);
  const back = along(-half, 0);
  const left = along(0, -length * 0.28);
  const right = along(0, length * 0.28);
  g.fillStyle(COLORS.vineDark);
  g.fillTriangle(back.x, back.y, left.x, left.y, tip.x, tip.y);
  g.fillTriangle(back.x, back.y, right.x, right.y, tip.x, tip.y);
  g.fillStyle(COLORS.leafLight);
  const inner = (p: { x: number; y: number }) => ({ x: (p.x * 3 + x) / 4, y: (p.y * 3 + y) / 4 });
  const [t, b, l, r] = [inner(tip), inner(back), inner(left), inner(right)];
  g.fillTriangle(b.x, b.y, l.x, l.y, t.x, t.y);
  g.fillTriangle(b.x, b.y, r.x, r.y, t.x, t.y);
  g.lineStyle(1, COLORS.vineDark);
  g.lineBetween(back.x, back.y, tip.x, tip.y);
}

/**
 * Draws the vine as a bent rope: a dark edge, the green rope and a light
 * stripe down one side, with pointed leaves along it and a bunch at the tip.
 */
export function drawVine(g: Phaser.GameObjects.Graphics, curve: VineCurve): void {
  const w = JUNGLE.vineWidth;
  const points = Array.from({ length: VINE.curvePoints + 1 }, (_, i) => {
    const { x, y } = pointOnCurve(curve, i / VINE.curvePoints);
    return new Phaser.Math.Vector2(x, y);
  });

  g.clear();
  g.lineStyle(w + 2, COLORS.vineDark);
  g.strokePoints(points, false);
  g.lineStyle(w, COLORS.vine);
  g.strokePoints(points, false);
  g.lineStyle(1.5, COLORS.vineLight);
  g.strokePoints(
    points.map((p) => new Phaser.Math.Vector2(p.x - w * 0.2, p.y)),
    false,
  );

  VINE.leafSpots.forEach((f, i) => {
    const { x, y } = pointOnCurve(curve, f);
    const side = i % 2 === 0 ? -1 : 1;
    drawLeaf(g, x + side * w * 1.6, y, w * 3.2, side > 0 ? 0.5 : Math.PI - 0.5);
  });
  const { x: tx, y: ty } = curve.end;
  drawLeaf(g, tx - w, ty + 1, w * 3.6, Math.PI - 0.9);
  drawLeaf(g, tx + w, ty + 1, w * 3.6, 0.9);
  drawLeaf(g, tx, ty + w * 0.8, w * 3.4, Math.PI / 2);
}
