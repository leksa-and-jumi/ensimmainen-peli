import Phaser from 'phaser';
import { COLORS, FRUIT_SIZE } from '../config';

export type FruitKind = 'banana' | 'apple';

/** Draws a banana on a 32 x 32 grid scaled to FRUIT_SIZE. */
function drawBanana(g: Phaser.GameObjects.Graphics, u: number): void {
  g.lineStyle(12 * u, COLORS.banana);
  g.beginPath();
  g.arc(16 * u, 8 * u, 12 * u, Phaser.Math.DegToRad(35), Phaser.Math.DegToRad(145));
  g.strokePath();
  g.fillStyle(COLORS.bananaTip);
  g.fillCircle(25.8 * u, 14.9 * u, 3 * u);
  g.fillCircle(6.2 * u, 14.9 * u, 3 * u);
}

/** Draws an apple on a 32 x 32 grid scaled to FRUIT_SIZE. */
function drawApple(g: Phaser.GameObjects.Graphics, u: number): void {
  g.fillStyle(COLORS.apple);
  g.fillCircle(12 * u, 19 * u, 10 * u);
  g.fillCircle(20 * u, 19 * u, 10 * u);
  g.fillStyle(COLORS.appleShine);
  g.fillCircle(11 * u, 15 * u, 2.5 * u);
  g.lineStyle(2.5 * u, COLORS.appleStem);
  g.lineBetween(16 * u, 10 * u, 18 * u, 3 * u);
  g.fillStyle(COLORS.appleLeaf);
  g.fillEllipse(23 * u, 5 * u, 9 * u, 5 * u);
}

const DRAW: Record<FruitKind, (g: Phaser.GameObjects.Graphics, u: number) => void> = {
  banana: drawBanana,
  apple: drawApple,
};

/** A fruit the monkey collects. Each kind is drawn once into its own texture. */
export function createFruit(scene: Phaser.Scene, kind: FruitKind): Phaser.GameObjects.Image {
  if (!scene.textures.exists(kind)) {
    const g = scene.add.graphics();
    DRAW[kind](g, FRUIT_SIZE / 32);
    g.generateTexture(kind, FRUIT_SIZE, FRUIT_SIZE);
    g.destroy();
  }
  return scene.add.image(0, 0, kind);
}
