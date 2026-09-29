import Phaser from 'phaser';
import { ANIMAL_LOOK, COLORS, ENEMIES } from '../config';

export type EnemyKind = keyof typeof ENEMIES;

/** How far each lion leg leans in each picture (grid units, + = forwards). */
const LION_LEG_LEAN = [
  [4, -4, 4, -4],
  [-4, 4, -4, 4],
] as const;
/** Where the tail tip is in each picture. */
const LION_TAIL_TIP_Y = [16, 22] as const;

/** A darker version of a colour, for outlines and shadows. */
function darker(color: number, amount: number = ANIMAL_LOOK.shade): number {
  return Phaser.Display.Color.ValueToColor(color).darken(amount).color;
}

/**
 * Draws a lion facing right on an 80 x 56 grid. The legs step with `frame`.
 * A cartoon with outlines, a shaggy two-tone mane, paws and a real face.
 */
function drawLion(g: Phaser.GameObjects.Graphics, u: number, frame: number): void {
  const lean = LION_LEG_LEAN[frame % LION_LEG_LEAN.length] ?? LION_LEG_LEAN[0];
  const tailY = LION_TAIL_TIP_Y[frame % LION_TAIL_TIP_Y.length] ?? LION_TAIL_TIP_Y[0];
  const edge = ANIMAL_LOOK.outline;
  const blob = (x: number, y: number, w: number, h: number, fill: number): void => {
    g.fillStyle(darker(fill));
    g.fillEllipse(x * u, y * u, (w + edge) * u, (h + edge) * u);
    g.fillStyle(fill);
    g.fillEllipse(x * u, y * u, w * u, h * u);
  };
  const leg = (x: number, i: number, fill: number): void => {
    const footX = x + (lean[i] ?? 0);
    g.lineStyle((7 + edge) * u, darker(fill));
    g.lineBetween(x * u, 36 * u, footX * u, 52 * u);
    g.lineStyle(7 * u, fill);
    g.lineBetween(x * u, 36 * u, footX * u, 52 * u);
    blob(footX + 1, 53, 9, 4.5, COLORS.lionBelly);
  };

  // Legs on the far side are a bit darker, so the lion looks round.
  leg(31.5, 1, darker(COLORS.lionBody, 12));
  leg(61.5, 3, darker(COLORS.lionBody, 12));

  // Tail with a dark tuft.
  g.lineStyle((3 + edge) * u, darker(COLORS.lionBody));
  g.lineBetween(15 * u, 30 * u, 5 * u, (tailY + 3) * u);
  g.lineStyle(3 * u, COLORS.lionBody);
  g.lineBetween(15 * u, 30 * u, 5 * u, (tailY + 3) * u);
  blob(4, tailY, 7, 8, COLORS.lionMane);

  // Body with a lighter belly.
  blob(38, 34, 50, 25, COLORS.lionBody);
  g.fillStyle(COLORS.lionBelly);
  g.fillEllipse(40 * u, 40 * u, 36 * u, 9 * u);

  leg(21.5, 0, COLORS.lionBody);
  leg(51.5, 2, COLORS.lionBody);

  // Shaggy mane: dark tufts around a lighter mane.
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    blob(61 + 14 * Math.cos(angle), 24 + 14 * Math.sin(angle), 11, 11, COLORS.lionMane);
  }
  blob(61, 24, 28, 28, COLORS.lionManeLight);

  // Ears, face and snout.
  blob(54, 13, 7, 7, COLORS.lionBody);
  blob(69, 13, 7, 7, COLORS.lionBody);
  g.fillStyle(COLORS.lionMane);
  g.fillCircle(54 * u, 13 * u, 1.8 * u);
  g.fillCircle(69 * u, 13 * u, 1.8 * u);
  blob(62, 24, 21, 21, COLORS.lionBody);
  g.fillStyle(COLORS.lionBelly);
  g.fillEllipse(64 * u, 29.5 * u, 13 * u, 9 * u);

  // Amber eyes with dark pupils and a shine.
  for (const x of [58.5, 66.5]) {
    g.fillStyle(COLORS.lionEye);
    g.fillEllipse(x * u, 21.5 * u, 4.5 * u, 4 * u);
    g.fillStyle(COLORS.enemyEye);
    g.fillCircle((x + 0.5) * u, 21.5 * u, 1.3 * u);
    g.fillStyle(COLORS.monkeyEyeWhite);
    g.fillCircle((x + 1) * u, 21 * u, 0.5 * u);
  }

  // Nose, mouth and whisker dots.
  g.fillStyle(COLORS.lionNose);
  g.fillTriangle(62 * u, 26 * u, 67 * u, 26 * u, 64.5 * u, 29 * u);
  g.lineStyle(1.2 * u, COLORS.lionNose);
  g.lineBetween(64.5 * u, 29 * u, 64.5 * u, 31 * u);
  g.beginPath();
  g.arc(62.5 * u, 31 * u, 2 * u, 0, Math.PI);
  g.strokePath();
  g.beginPath();
  g.arc(66.5 * u, 31 * u, 2 * u, 0, Math.PI);
  g.strokePath();
  g.fillStyle(COLORS.lionNose);
  for (const [x, y] of [
    [60, 29],
    [59.5, 31],
    [69, 29],
    [69.5, 31],
  ] as const) {
    g.fillCircle(x * u, y * u, 0.5 * u);
  }
}

/**
 * Draws a snake facing right on a 72 x 28 grid. A wave runs along the body
 * with `frame`; the tail wiggles the most and the head stays still. The body
 * gets thinner towards the tail and has an outline, a light belly stripe and
 * diamond marks.
 */
function drawSnake(g: Phaser.GameObjects.Graphics, u: number, frame: number): void {
  const phase = (2 * Math.PI * frame) / ENEMIES.snake.frames;
  const edge = ANIMAL_LOOK.outline;
  const points: [number, number][] = [];
  for (let x = 3; x <= 58; x += 1) {
    const wiggle = 6 * (1 - (x - 3) / 60);
    points.push([x, 17 + wiggle * Math.sin(x / 8 - phase)]);
  }
  const widthAt = (i: number) => 3 + (7 * i) / points.length;

  // The body is a row of overlapping circles, so it is smooth and gets
  // thinner towards the tail: first the dark edge, then the body, then a
  // lighter belly along the bottom.
  const tube = (color: number, grow: number, shrink: number, drop: number): void => {
    g.fillStyle(color);
    points.forEach(([x, y], i) => {
      const r = (widthAt(i) * shrink + grow) / 2;
      g.fillCircle(x * u, (y + drop * widthAt(i)) * u, r * u);
    });
  };
  tube(darker(COLORS.snakeBody), edge, 1, 0);
  tube(COLORS.snakeBody, 0, 1, 0);
  tube(COLORS.snakeBelly, 0, 0.35, 0.25);

  // Diamond marks along the back.
  g.fillStyle(COLORS.snakeSpots);
  points.forEach(([x, y], i) => {
    if (i % 8 !== 4) return;
    const r = widthAt(i) * 0.3;
    g.fillTriangle(x * u, (y - 2 * r) * u, (x + r) * u, (y - r) * u, (x - r) * u, (y - r) * u);
    g.fillTriangle(x * u, y * u, (x + r) * u, (y - r) * u, (x - r) * u, (y - r) * u);
  });

  // Head with an eye, a nostril and a forked tongue.
  g.fillStyle(darker(COLORS.snakeBody));
  g.fillEllipse(62 * u, 16 * u, (16 + edge) * u, (12 + edge) * u);
  g.fillStyle(COLORS.snakeBody);
  g.fillEllipse(62 * u, 16 * u, 16 * u, 12 * u);
  g.fillStyle(COLORS.snakeBelly);
  g.fillEllipse(63 * u, 19.5 * u, 11 * u, 4 * u);
  g.fillStyle(COLORS.monkeyEyeWhite);
  g.fillCircle(65 * u, 13 * u, 2.4 * u);
  g.fillStyle(COLORS.enemyEye);
  g.fillEllipse(65.4 * u, 13 * u, 1.2 * u, 3.4 * u);
  g.fillCircle(69 * u, 15 * u, 0.5 * u);
  g.lineStyle(1.2 * u, COLORS.snakeTongue);
  g.lineBetween(69.5 * u, 18 * u, 71 * u, 20 * u);
  g.lineBetween(71 * u, 20 * u, 72 * u, 19.2 * u);
  g.lineBetween(71 * u, 20 * u, 71.8 * u, 21.5 * u);
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
