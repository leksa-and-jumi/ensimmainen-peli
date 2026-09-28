import Phaser from 'phaser';
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRASS_HEIGHT,
  GROUND_HEIGHT,
  GROUND_Y,
  JUNGLE,
} from '../config';

/** Draws the static jungle scenery: shade, trees and the ground. */
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

  g.fillStyle(COLORS.ground);
  g.fillRect(0, GROUND_Y, GAME_WIDTH, GROUND_HEIGHT);
  g.fillStyle(COLORS.groundGrass);
  g.fillRect(0, GROUND_Y, GAME_WIDTH, GRASS_HEIGHT);
}
