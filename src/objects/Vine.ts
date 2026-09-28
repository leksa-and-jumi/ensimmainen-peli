import Phaser from 'phaser';
import { COLORS, JUNGLE } from '../config';
import type { VineShape } from '../logic/vine';

/** A hanging vine. Its container rotates around the top anchor point. */
export function createVine(scene: Phaser.Scene, vine: VineShape): Phaser.GameObjects.Container {
  const w = JUNGLE.vineWidth;
  const g = scene.add.graphics();
  g.fillStyle(COLORS.vine);
  g.fillRect(-w / 2, 0, w, vine.length);
  g.fillStyle(COLORS.leafLight);
  g.fillEllipse(0, vine.length, w * 4, w * 2.5);
  return scene.add.container(vine.anchorX, 0, [g]);
}
