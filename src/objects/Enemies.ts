import Phaser from 'phaser';
import { COLORS, ENEMIES } from '../config';

export type EnemyKind = keyof typeof ENEMIES;

/** Draws a lion facing right on an 80 x 56 grid. */
function drawLion(g: Phaser.GameObjects.Graphics, u: number): void {
  // Tail with a tuft
  g.lineStyle(4 * u, COLORS.lionBody);
  g.lineBetween(14 * u, 30 * u, 4 * u, 18 * u);
  g.fillStyle(COLORS.lionMane);
  g.fillCircle(4 * u, 16 * u, 4 * u);

  // Legs and body
  g.fillStyle(COLORS.lionBody);
  for (const x of [18, 28, 48, 58]) g.fillRect(x * u, 38 * u, 7 * u, 17 * u);
  g.fillEllipse(38 * u, 34 * u, 50 * u, 26 * u);

  // Mane, ears and face
  g.fillStyle(COLORS.lionMane);
  g.fillCircle(61 * u, 24 * u, 17 * u);
  g.fillStyle(COLORS.lionBody);
  g.fillCircle(54 * u, 12 * u, 4 * u);
  g.fillCircle(70 * u, 12 * u, 4 * u);
  g.fillCircle(63 * u, 25 * u, 11 * u);

  g.fillStyle(COLORS.enemyEye);
  g.fillCircle(59 * u, 22 * u, 2 * u);
  g.fillCircle(67 * u, 22 * u, 2 * u);
  g.fillStyle(COLORS.lionMane);
  g.fillCircle(63 * u, 28 * u, 2.5 * u);
}

/** Draws a snake facing right on a 72 x 28 grid. */
function drawSnake(g: Phaser.GameObjects.Graphics, u: number): void {
  const body: Phaser.Math.Vector2[] = [];
  for (let x = 5; x <= 58; x += 2) {
    body.push(new Phaser.Math.Vector2(x * u, (18 + 5 * Math.sin(x / 8)) * u));
  }
  g.lineStyle(9 * u, COLORS.snakeBody);
  g.strokePoints(body, false);

  g.fillStyle(COLORS.snakeSpots);
  for (const point of body.filter((_, i) => i % 5 === 2)) {
    g.fillCircle(point.x, point.y, 2 * u);
  }

  // Head, eye and tongue
  g.fillStyle(COLORS.snakeBody);
  g.fillEllipse(62 * u, 16 * u, 16 * u, 12 * u);
  g.fillStyle(COLORS.enemyEye);
  g.fillCircle(65 * u, 13 * u, 2 * u);
  g.lineStyle(1.5 * u, COLORS.snakeTongue);
  g.lineBetween(69 * u, 18 * u, 72 * u, 21 * u);
}

const DRAW: Record<EnemyKind, (g: Phaser.GameObjects.Graphics, u: number) => void> = {
  lion: drawLion,
  snake: drawSnake,
};

/** An enemy the monkey must not touch. Drawn facing right. */
export function createEnemy(scene: Phaser.Scene, kind: EnemyKind): Phaser.GameObjects.Image {
  const { width, height, gridWidth } = ENEMIES[kind];
  if (!scene.textures.exists(kind)) {
    const g = scene.add.graphics();
    DRAW[kind](g, width / gridWidth);
    g.generateTexture(kind, width, height);
    g.destroy();
  }
  return scene.add.image(0, 0, kind);
}
