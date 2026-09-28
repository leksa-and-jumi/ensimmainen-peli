import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, JUNGLE } from '../config';

/** Draws the jungle scenery: shady ground, trees and hanging vines. */
export function drawJungle(scene: Phaser.Scene): void {
  const g = scene.add.graphics();

  g.fillStyle(COLORS.jungleShade);
  for (const blob of JUNGLE.shadeBlobs) {
    g.fillCircle(blob.x * GAME_WIDTH, blob.y * GAME_HEIGHT, blob.radius);
  }

  for (const tree of JUNGLE.trees) {
    const x = tree.x * GAME_WIDTH;
    const top = GAME_HEIGHT - tree.height;
    const r = JUNGLE.leafRadius;

    g.fillStyle(COLORS.trunk);
    g.fillRect(x - JUNGLE.trunkWidth / 2, top, JUNGLE.trunkWidth, tree.height);

    g.fillStyle(COLORS.leaf);
    g.fillCircle(x - r * 0.8, top, r);
    g.fillCircle(x + r * 0.8, top, r);
    g.fillStyle(COLORS.leafLight);
    g.fillCircle(x, top - r * 0.5, r);
  }

  g.fillStyle(COLORS.vine);
  for (const vine of JUNGLE.vines) {
    const x = vine.x * GAME_WIDTH;
    g.fillRect(x - JUNGLE.vineWidth / 2, 0, JUNGLE.vineWidth, vine.length);
    g.fillStyle(COLORS.leafLight);
    g.fillEllipse(x, vine.length, JUNGLE.vineWidth * 4, JUNGLE.vineWidth * 2.5);
    g.fillStyle(COLORS.vine);
  }
}
