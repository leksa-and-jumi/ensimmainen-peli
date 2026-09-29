import Phaser from 'phaser';
import { COLORS, SKY_BIRDS } from '../config';

/** 0 = wings up, 1 = wings down. */
export type WingFrame = 0 | 1;

const textureKey = (color: number, frame: WingFrame): string => `skyBird-${color}-${frame}`;

/** Draws a bird facing right on a 36 x 24 grid, with an orange beak. */
function drawBird(
  g: Phaser.GameObjects.Graphics,
  u: number,
  color: number,
  frame: WingFrame,
): void {
  g.fillStyle(color);
  g.fillTriangle(9 * u, 14 * u, 2 * u, 10 * u, 2 * u, 18 * u);
  g.fillEllipse(18 * u, 14 * u, 18 * u, 9 * u);
  g.fillCircle(27 * u, 11 * u, 5 * u);
  if (frame === 0) {
    g.fillTriangle(12 * u, 12 * u, 23 * u, 12 * u, 14 * u, 1 * u);
  } else {
    g.fillTriangle(12 * u, 15 * u, 23 * u, 15 * u, 14 * u, 23 * u);
  }
  g.fillStyle(COLORS.beak);
  g.fillTriangle(31 * u, 8.5 * u, 31 * u, 13.5 * u, 36 * u, 11 * u);
  g.fillStyle(COLORS.enemyEye);
  g.fillCircle(28.5 * u, 10 * u, 1.3 * u);
}

/** A colourful bird that flies in the sky. It is only decoration. */
export function createSkyBird(scene: Phaser.Scene, color: number): Phaser.GameObjects.Image {
  const { width, height, gridWidth } = SKY_BIRDS;
  for (const frame of [0, 1] as const) {
    const key = textureKey(color, frame);
    if (scene.textures.exists(key)) continue;
    const g = scene.add.graphics();
    drawBird(g, width / gridWidth, color, frame);
    g.generateTexture(key, width, height);
    g.destroy();
  }
  return scene.add.image(0, 0, textureKey(color, 0));
}

/** Shows the bird with its wings up or down. */
export function setSkyBirdFrame(
  bird: Phaser.GameObjects.Image,
  color: number,
  frame: WingFrame,
): void {
  const key = textureKey(color, frame);
  if (bird.texture.key !== key) bird.setTexture(key);
}
