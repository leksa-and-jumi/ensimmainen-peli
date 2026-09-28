import Phaser from 'phaser';
import { COLORS, PLAYER_SIZE } from '../config';

const TEXTURE_KEY = 'monkey';

/** Draws the monkey once into a texture so it can be used as an image. */
function createMonkeyTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEY)) return;

  const s = PLAYER_SIZE;
  const g = scene.add.graphics();

  // Ears
  g.fillStyle(COLORS.monkeyFur);
  g.fillCircle(s * 0.14, s * 0.42, s * 0.14);
  g.fillCircle(s * 0.86, s * 0.42, s * 0.14);
  g.fillStyle(COLORS.monkeyFace);
  g.fillCircle(s * 0.14, s * 0.42, s * 0.07);
  g.fillCircle(s * 0.86, s * 0.42, s * 0.07);

  // Head
  g.fillStyle(COLORS.monkeyFur);
  g.fillCircle(s * 0.5, s * 0.5, s * 0.36);

  // Face
  g.fillStyle(COLORS.monkeyFace);
  g.fillEllipse(s * 0.5, s * 0.6, s * 0.5, s * 0.4);
  g.fillCircle(s * 0.38, s * 0.4, s * 0.12);
  g.fillCircle(s * 0.62, s * 0.4, s * 0.12);

  // Eyes and smile
  g.fillStyle(COLORS.monkeyEye);
  g.fillCircle(s * 0.39, s * 0.41, s * 0.05);
  g.fillCircle(s * 0.61, s * 0.41, s * 0.05);
  g.lineStyle(s * 0.04, COLORS.monkeyEye);
  g.beginPath();
  g.arc(s * 0.5, s * 0.6, s * 0.13, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160));
  g.strokePath();

  g.generateTexture(TEXTURE_KEY, s, s);
  g.destroy();
}

/** The player: a monkey Julius picked as the jungle hero. */
export function createMonkey(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Image {
  createMonkeyTexture(scene);
  return scene.add.image(x, y, TEXTURE_KEY);
}
