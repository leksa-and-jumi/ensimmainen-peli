import Phaser from 'phaser';
import { COLORS, SKY_BIRDS } from '../config';

/** Texture keys for the two wing pictures: wings up and wings down. */
export const SKY_BIRD_FRAMES = ['skyBirdUp', 'skyBirdDown'] as const;

/**
 * Draws a bird facing right on a 36 x 24 grid. The bird is white so it can
 * be tinted to any colour; the black eye stays black.
 */
function drawBird(g: Phaser.GameObjects.Graphics, u: number, wingsUp: boolean): void {
  g.fillStyle(COLORS.cloud);
  g.fillTriangle(9 * u, 14 * u, 2 * u, 10 * u, 2 * u, 18 * u);
  g.fillEllipse(18 * u, 14 * u, 18 * u, 9 * u);
  g.fillCircle(27 * u, 11 * u, 5 * u);
  if (wingsUp) {
    g.fillTriangle(12 * u, 12 * u, 23 * u, 12 * u, 14 * u, 1 * u);
  } else {
    g.fillTriangle(12 * u, 15 * u, 23 * u, 15 * u, 14 * u, 23 * u);
  }
  g.fillStyle(COLORS.enemyEye);
  g.fillCircle(28.5 * u, 10 * u, 1.3 * u);
}

/** A colourful bird that flies in the sky. It is only decoration. */
export function createSkyBird(scene: Phaser.Scene, color: number): Phaser.GameObjects.Image {
  const { width, height, gridWidth } = SKY_BIRDS;
  SKY_BIRD_FRAMES.forEach((key, i) => {
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    drawBird(g, width / gridWidth, i === 0);
    g.generateTexture(key, width, height);
    g.destroy();
  });
  return scene.add.image(0, 0, SKY_BIRD_FRAMES[0]).setTint(color);
}
