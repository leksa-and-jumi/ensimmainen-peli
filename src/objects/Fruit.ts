import Phaser from 'phaser';
import { COLORS, FRUIT_SIZE } from '../config';
import { darker, lighter } from './shade';

export type FruitKind = 'banana' | 'apple';

/** Draws a banana on a 32 x 32 grid scaled to FRUIT_SIZE: outlined, with a light stripe, stem and tips. */
function drawBanana(g: Phaser.GameObjects.Graphics, u: number): void {
  const arc = (width: number, color: number, radius = 12): void => {
    g.lineStyle(width * u, color);
    g.beginPath();
    g.arc(16 * u, 8 * u, radius * u, Phaser.Math.DegToRad(35), Phaser.Math.DegToRad(145));
    g.strokePath();
  };
  arc(14, darker(COLORS.banana, 35));
  arc(12, COLORS.banana);
  arc(3, lighter(COLORS.banana, 25), 9.5);
  g.fillStyle(COLORS.bananaTip);
  g.fillCircle(25.8 * u, 14.9 * u, 3 * u);
  g.fillCircle(6.2 * u, 14.9 * u, 2.5 * u);
  // A little stem sticking up from one end.
  g.lineStyle(3 * u, COLORS.bananaTip);
  g.lineBetween(26 * u, 14 * u, 29 * u, 9 * u);
}

/** Draws an apple on a 32 x 32 grid scaled to FRUIT_SIZE: outlined, shaded, with a shine, stem and leaf. */
function drawApple(g: Phaser.GameObjects.Graphics, u: number): void {
  g.fillStyle(darker(COLORS.apple, 35));
  g.fillCircle(12 * u, 19 * u, 11 * u);
  g.fillCircle(20 * u, 19 * u, 11 * u);
  g.fillStyle(COLORS.apple);
  g.fillCircle(12 * u, 19 * u, 10 * u);
  g.fillCircle(20 * u, 19 * u, 10 * u);
  g.fillStyle(darker(COLORS.apple, 15));
  g.fillEllipse(20 * u, 23 * u, 13 * u, 9 * u);
  g.fillStyle(COLORS.appleShine);
  g.fillEllipse(10 * u, 15 * u, 5 * u, 7 * u);
  g.fillStyle(COLORS.monkeyEyeWhite);
  g.fillCircle(9.5 * u, 13.5 * u, 1.2 * u);
  g.lineStyle(2.5 * u, COLORS.appleStem);
  g.beginPath();
  g.arc(20 * u, 10 * u, 5 * u, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(250));
  g.strokePath();
  g.fillStyle(darker(COLORS.appleLeaf, 25));
  g.fillEllipse(23 * u, 5 * u, 10 * u, 6 * u);
  g.fillStyle(COLORS.appleLeaf);
  g.fillEllipse(23 * u, 5 * u, 8.5 * u, 4.5 * u);
  g.lineStyle(0.8 * u, darker(COLORS.appleLeaf, 25));
  g.lineBetween(19 * u, 5 * u, 27 * u, 5 * u);
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
