import Phaser from 'phaser';
import { darker, lighter } from './shade';
import { COLORS, SKY_BIRDS } from '../config';

/** 0 = wings up, 1 = wings down. */
export type WingFrame = 0 | 1;

const textureKey = (color: number, frame: WingFrame): string => `skyBird-${color}-${frame}`;

/**
 * Draws a bird facing right on a 36 x 24 grid: outlined, with a lighter belly,
 * a darker wing with feathers, a split tail, an eye with a shine and a beak.
 */
function drawBird(
  g: Phaser.GameObjects.Graphics,
  u: number,
  color: number,
  frame: WingFrame,
): void {
  const edge = darker(color, 35);
  const wing = darker(color, 15);
  // Tail feathers
  g.fillStyle(edge);
  g.fillTriangle(10 * u, 13 * u, 1 * u, 8 * u, 3 * u, 14 * u);
  g.fillTriangle(10 * u, 15 * u, 1 * u, 20 * u, 3 * u, 14 * u);
  // Body and head with an outline, and a light belly.
  g.fillStyle(edge);
  g.fillEllipse(18 * u, 14 * u, 19.5 * u, 10.5 * u);
  g.fillCircle(27 * u, 11 * u, 5.8 * u);
  g.fillStyle(color);
  g.fillEllipse(18 * u, 14 * u, 18 * u, 9 * u);
  g.fillCircle(27 * u, 11 * u, 5 * u);
  g.fillStyle(lighter(color, 30));
  g.fillEllipse(20 * u, 16 * u, 12 * u, 4.5 * u);
  // Wing with feather lines.
  const [tipY, rootY] = frame === 0 ? [1, 12] : [23, 15];
  g.fillStyle(edge);
  g.fillTriangle(11 * u, rootY * u, 24 * u, rootY * u, 14 * u, tipY * u);
  g.fillStyle(wing);
  g.fillTriangle(
    12.5 * u,
    rootY * u,
    22.5 * u,
    rootY * u,
    14.5 * u,
    (tipY + (rootY - tipY) * 0.12) * u,
  );
  g.lineStyle(0.8 * u, edge);
  for (const f of [0.35, 0.6]) {
    g.lineBetween((14 + 6 * f) * u, rootY * u, 14.5 * u, (tipY + (rootY - tipY) * f) * u);
  }
  // Beak and eye.
  g.fillStyle(darker(COLORS.beak, 25));
  g.fillTriangle(30.5 * u, 8 * u, 30.5 * u, 14 * u, 36 * u, 11 * u);
  g.fillStyle(COLORS.beak);
  g.fillTriangle(31 * u, 9 * u, 31 * u, 13 * u, 35 * u, 11 * u);
  g.fillStyle(COLORS.monkeyEyeWhite);
  g.fillCircle(28.3 * u, 10 * u, 1.9 * u);
  g.fillStyle(COLORS.enemyEye);
  g.fillCircle(28.7 * u, 10.2 * u, 1.1 * u);
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
