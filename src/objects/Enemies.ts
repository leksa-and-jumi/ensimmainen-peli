import Phaser from 'phaser';
import { COLORS, ENEMIES } from '../config';

export type EnemyKind = keyof typeof ENEMIES;

/** How far each lion leg leans in each picture (grid units, + = forwards). */
const LION_LEG_LEAN = [
  [4, -4, 4, -4],
  [-4, 4, -4, 4],
] as const;
/** Where the tail tip is in each picture. */
const LION_TAIL_TIP_Y = [16, 22] as const;

/** Draws a lion facing right on an 80 x 56 grid. The legs step with `frame`. */
function drawLion(g: Phaser.GameObjects.Graphics, u: number, frame: number): void {
  const lean = LION_LEG_LEAN[frame % LION_LEG_LEAN.length] ?? LION_LEG_LEAN[0];
  const tailY = LION_TAIL_TIP_Y[frame % LION_TAIL_TIP_Y.length] ?? LION_TAIL_TIP_Y[0];

  // Tail with a tuft
  g.lineStyle(4 * u, COLORS.lionBody);
  g.lineBetween(14 * u, 30 * u, 4 * u, (tailY + 2) * u);
  g.fillStyle(COLORS.lionMane);
  g.fillCircle(4 * u, tailY * u, 4 * u);

  // Legs and body
  g.lineStyle(7 * u, COLORS.lionBody);
  [21.5, 31.5, 51.5, 61.5].forEach((x, i) => {
    g.lineBetween(x * u, 38 * u, (x + (lean[i] ?? 0)) * u, 53 * u);
  });
  g.fillStyle(COLORS.lionBody);
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

/**
 * Draws a snake facing right on a 72 x 28 grid. A wave runs along the body
 * with `frame`; the tail wiggles the most and the head stays still.
 */
function drawSnake(g: Phaser.GameObjects.Graphics, u: number, frame: number): void {
  const phase = (2 * Math.PI * frame) / ENEMIES.snake.frames;
  const body: Phaser.Math.Vector2[] = [];
  for (let x = 5; x <= 58; x += 2) {
    const wiggle = 6 * (1 - (x - 5) / 60);
    body.push(new Phaser.Math.Vector2(x * u, (17 + wiggle * Math.sin(x / 8 - phase)) * u));
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

const DRAW: Record<EnemyKind, (g: Phaser.GameObjects.Graphics, u: number, frame: number) => void> =
  {
    lion: drawLion,
    snake: drawSnake,
  };

const textureKey = (kind: EnemyKind, frame: number): string => `${kind}-${frame}`;

/** An enemy the monkey must not touch. Drawn facing right. */
export function createEnemy(scene: Phaser.Scene, kind: EnemyKind): Phaser.GameObjects.Image {
  const { width, height, gridWidth, frames } = ENEMIES[kind];
  for (let frame = 0; frame < frames; frame++) {
    const key = textureKey(kind, frame);
    if (scene.textures.exists(key)) continue;
    const g = scene.add.graphics();
    DRAW[kind](g, width / gridWidth, frame);
    g.generateTexture(key, width, height);
    g.destroy();
  }
  return scene.add.image(0, 0, textureKey(kind, 0));
}

/** Shows the given picture of the enemy's walking animation. */
export function setEnemyFrame(
  enemy: Phaser.GameObjects.Image,
  kind: EnemyKind,
  frame: number,
): void {
  const key = textureKey(kind, frame);
  if (enemy.texture.key !== key) enemy.setTexture(key);
}
