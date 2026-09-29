import Phaser from 'phaser';
import { COLORS, DEPTH, LIVES } from '../config';

/** A full heart picture, also used as the life icon in the shop. */
export const HEART_TEXTURE = 'heart-full';
const FULL = HEART_TEXTURE;
const EMPTY = 'heart-empty';

/** Draws a heart on a 24 x 22 grid. */
function drawHeart(g: Phaser.GameObjects.Graphics, u: number, color: number): void {
  g.fillStyle(color);
  g.fillCircle(7 * u, 7 * u, 6 * u);
  g.fillCircle(17 * u, 7 * u, 6 * u);
  g.fillTriangle(1.3 * u, 9.5 * u, 22.7 * u, 9.5 * u, 12 * u, 21 * u);
}

/** A row of hearts in the top left corner showing the lives left. */
export function createHearts(scene: Phaser.Scene): Phaser.GameObjects.Image[] {
  const { heartSize, start, heartsX, heartsY, heartGap } = LIVES;
  for (const [key, color] of [
    [FULL, COLORS.heart],
    [EMPTY, COLORS.heartLost],
  ] as const) {
    if (scene.textures.exists(key)) continue;
    const g = scene.add.graphics();
    drawHeart(g, heartSize / 24, color);
    g.generateTexture(key, heartSize, heartSize);
    g.destroy();
  }
  return Array.from({ length: start }, (_, i) =>
    scene.add
      .image(heartsX + i * (heartSize + heartGap), heartsY, FULL)
      .setOrigin(0)
      .setDepth(DEPTH.hud),
  );
}

/** Full hearts for the lives left, grey hearts for the lives lost. */
export function showLives(hearts: Phaser.GameObjects.Image[], lives: number): void {
  hearts.forEach((heart, i) => heart.setTexture(i < lives ? FULL : EMPTY));
}
