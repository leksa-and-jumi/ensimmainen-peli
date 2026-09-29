import Phaser from 'phaser';
import { COLORS, JUNGLE, VINE } from '../config';
import { pointOnCurve, type VineCurve } from '../logic/vine';

/** A vine is redrawn every frame, because it bends and stretches. */
export function createVine(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.add.graphics();
}

/** Draws the vine as a bent rope with a few small leaves and a leaf at the tip. */
export function drawVine(g: Phaser.GameObjects.Graphics, curve: VineCurve): void {
  const w = JUNGLE.vineWidth;
  const points = Array.from({ length: VINE.curvePoints + 1 }, (_, i) => {
    const { x, y } = pointOnCurve(curve, i / VINE.curvePoints);
    return new Phaser.Math.Vector2(x, y);
  });

  g.clear();
  g.lineStyle(w, COLORS.vine);
  g.strokePoints(points, false);

  g.fillStyle(COLORS.leafLight);
  VINE.leafSpots.forEach((f, i) => {
    const { x, y } = pointOnCurve(curve, f);
    const side = i % 2 === 0 ? -1 : 1;
    g.fillEllipse(x + side * w * 1.2, y, w * 2.4, w * 1.4);
  });
  g.fillEllipse(curve.end.x, curve.end.y, w * 4, w * 2.5);
}
