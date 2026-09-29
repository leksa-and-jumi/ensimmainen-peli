import Phaser from 'phaser';
import { darker } from './shade';
import { COLORS, MONKEY_COLORS, MONKEY_LOOK, PLAYER_WIDTH, type MonkeyColor } from '../config';
import type { MonkeyPose } from '../logic/pose';

/** The monkey is drawn on a 64 x 88 grid and scaled to PLAYER_WIDTH. */
const GRID_WIDTH = 64;
const GRID_HEIGHT = 88;
/** Where the hands meet above the head when hanging (grid units). */
const HANDS_Y = 5;

type Point = [number, number];

/** Where the arms and legs go in one picture. Each limb starts at the body. */
interface Limbs {
  leftArm: Point[];
  rightArm: Point[];
  leftLeg: Point[];
  rightLeg: Point[];
}

const ARMS_UP = {
  leftArm: [
    [22, 50],
    [6, 40],
    [28, HANDS_Y],
  ],
  rightArm: [
    [42, 50],
    [58, 40],
    [36, HANDS_Y],
  ],
} satisfies Partial<Limbs>;

const ARMS_DOWN = {
  leftArm: [
    [22, 48],
    [12, 58],
    [10, 70],
  ],
  rightArm: [
    [42, 48],
    [52, 58],
    [54, 70],
  ],
} satisfies Partial<Limbs>;

const LEGS_STRAIGHT = {
  leftLeg: [
    [25, 72],
    [21, 84],
  ],
  rightLeg: [
    [39, 72],
    [43, 84],
  ],
} satisfies Partial<Limbs>;

const POSES: Record<MonkeyPose, Limbs> = {
  stand: { ...ARMS_DOWN, ...LEGS_STRAIGHT },
  // Walking: one leg lifts while the opposite arm swings up.
  walkA: {
    leftArm: ARMS_DOWN.leftArm,
    rightArm: [
      [42, 48],
      [54, 50],
      [58, 40],
    ],
    leftLeg: [
      [25, 72],
      [18, 76],
      [20, 80],
    ],
    rightLeg: LEGS_STRAIGHT.rightLeg,
  },
  walkB: {
    leftArm: [
      [22, 48],
      [10, 50],
      [6, 40],
    ],
    rightArm: ARMS_DOWN.rightArm,
    leftLeg: LEGS_STRAIGHT.leftLeg,
    rightLeg: [
      [39, 72],
      [46, 76],
      [44, 80],
    ],
  },
  // Jumping: arms wide up, knees bent.
  jump: {
    leftArm: [
      [22, 48],
      [8, 36],
      [5, 20],
    ],
    rightArm: [
      [42, 48],
      [56, 36],
      [59, 20],
    ],
    leftLeg: [
      [25, 72],
      [15, 77],
      [21, 82],
    ],
    rightLeg: [
      [39, 72],
      [49, 77],
      [43, 82],
    ],
  },
  // Hanging: hands hold the vine above the head, legs kick.
  hangA: {
    ...ARMS_UP,
    leftLeg: [
      [25, 72],
      [15, 82],
    ],
    rightLeg: [
      [39, 72],
      [41, 85],
    ],
  },
  hangB: {
    ...ARMS_UP,
    leftLeg: [
      [25, 72],
      [23, 85],
    ],
    rightLeg: [
      [39, 72],
      [49, 82],
    ],
  },
};

const textureKey = (color: MonkeyColor, pose: MonkeyPose): string => `monkey-${color}-${pose}`;

/** Where the two feet are drawn (grid units): just past the ends of the legs. */
function footCenters(limbs: Limbs): { left: Point; right: Point } {
  const [lx, ly] = end(limbs.leftLeg);
  const [rx, ry] = end(limbs.rightLeg);
  return { left: [lx - 2, ly + 1], right: [rx + 2, ry + 1] };
}

/**
 * Where the feet are in a picture, measured from the hands (the monkey's
 * origin), in grid units. Shoes use this to stay on the feet.
 */
export function feetFromHands(pose: MonkeyPose): { left: Point; right: Point } {
  const { left, right } = footCenters(POSES[pose]);
  const center = GRID_WIDTH / 2;
  return {
    left: [left[0] - center, left[1] - HANDS_Y],
    right: [right[0] - center, right[1] - HANDS_Y],
  };
}

/** The last point of a limb: where the hand or foot goes. */
function end(points: Point[]): Point {
  const last = points[points.length - 1];
  if (!last) throw new Error('A limb needs at least one point');
  return last;
}

/** The tail curls up behind the body and gets thinner towards the tip (grid units). */
const TAIL: Point[] = [
  [40, 70],
  [46, 74],
  [52, 74],
  [57, 70],
  [59, 64],
  [57, 59],
  [53, 58],
  [51, 61],
];

/**
 * Draws one picture of the monkey in the given colour into a texture.
 * It is a cartoon, but with outlines, a shaped face, real-looking eyes and a
 * tapering tail, so it looks a bit more like a real monkey.
 */
function createMonkeyTexture(scene: Phaser.Scene, color: MonkeyColor, pose: MonkeyPose): void {
  const key = textureKey(color, pose);
  if (scene.textures.exists(key)) return;

  const fur = MONKEY_COLORS[color];
  const limbs = POSES[pose];
  const u = PLAYER_WIDTH / GRID_WIDTH;
  const { outline, shade } = MONKEY_LOOK;
  const g = scene.add.graphics();
  const vectors = (points: Point[]) =>
    points.map(([x, y]) => new Phaser.Math.Vector2(x * u, y * u));

  /** A limb: a dark edge first, then the fur on top. */
  const limb = (points: Point[], furColor: number, width = 7): void => {
    g.lineStyle((width + outline) * u, darker(furColor, shade));
    g.strokePoints(vectors(points), false);
    g.lineStyle(width * u, furColor);
    g.strokePoints(vectors(points), false);
  };
  /** A filled round shape with a dark edge. */
  const blob = (x: number, y: number, w: number, h: number, fill: number): void => {
    g.fillStyle(darker(fill, shade));
    g.fillEllipse(x * u, y * u, (w + outline) * u, (h + outline) * u);
    g.fillStyle(fill);
    g.fillEllipse(x * u, y * u, w * u, h * u);
  };

  // Tail: thick at the body, thin at the tip.
  TAIL.slice(1).forEach(([x, y], i) => {
    const prev = TAIL[i] ?? TAIL[0];
    if (!prev) return;
    const width = 5 - (3 * i) / TAIL.length;
    limb([prev, [x, y]], fur.tail, width);
  });

  // Legs and long, hand-like feet.
  limb(limbs.leftLeg, fur.legs);
  limb(limbs.rightLeg, fur.legs);
  const feet = footCenters(limbs);
  for (const [fx, fy] of [feet.left, feet.right]) blob(fx, fy, 11, 5, COLORS.monkeyFace);

  // Body: rounder at the bottom, with a lighter belly and chest.
  blob(32, 61, 28, 34, fur.body);
  blob(32, 51, 23, 18, fur.body);
  g.fillStyle(COLORS.monkeyFace);
  g.fillEllipse(32 * u, 63 * u, 15 * u, 21 * u);

  // Ears with a lighter inside.
  blob(15, 28, 13, 14, fur.ears);
  blob(49, 28, 13, 14, fur.ears);
  g.fillStyle(COLORS.monkeyFace);
  g.fillEllipse(15.5 * u, 28.5 * u, 7 * u, 8 * u);
  g.fillEllipse(48.5 * u, 28.5 * u, 7 * u, 8 * u);

  // Arms, with hands that have a little thumb.
  limb(limbs.leftArm, fur.arms);
  limb(limbs.rightArm, fur.arms);
  for (const arm of [limbs.leftArm, limbs.rightArm]) {
    const [hx, hy] = end(arm);
    blob(hx, hy, 9, 9, COLORS.monkeyFace);
    g.fillStyle(COLORS.monkeyFace);
    g.fillCircle((hx + (hx < 32 ? 3 : -3)) * u, (hy - 2) * u, 2 * u);
  }

  // Head with a fluffy tuft on top.
  blob(32, 30, 34, 33, fur.head);
  g.fillStyle(fur.head);
  g.fillTriangle(27 * u, 16 * u, 32 * u, 10 * u, 35 * u, 16 * u);
  g.fillTriangle(31 * u, 16 * u, 38 * u, 11 * u, 39 * u, 18 * u);

  // Face: a heart shape around the eyes and a round snout.
  g.fillStyle(COLORS.monkeyFace);
  g.fillCircle(26.5 * u, 27 * u, 7 * u);
  g.fillCircle(37.5 * u, 27 * u, 7 * u);
  g.fillEllipse(32 * u, 36.5 * u, 22 * u, 15 * u);
  g.fillStyle(COLORS.monkeyCheek, 0.5);
  g.fillCircle(22.5 * u, 34 * u, 2.5 * u);
  g.fillCircle(41.5 * u, 34 * u, 2.5 * u);

  // Brows, eyes with a shine, nose and smile.
  g.lineStyle(1.5 * u, darker(fur.head, shade));
  for (const x of [26.5, 37.5]) {
    g.beginPath();
    g.arc(x * u, 26 * u, 5 * u, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340));
    g.strokePath();
  }
  for (const x of [26.5, 37.5]) {
    g.fillStyle(COLORS.monkeyEyeWhite);
    g.fillEllipse(x * u, 27.5 * u, 5.5 * u, 6 * u);
    g.fillStyle(COLORS.monkeyEye);
    g.fillCircle((x + 0.4) * u, 28 * u, 2.2 * u);
    g.fillStyle(COLORS.monkeyEyeWhite);
    g.fillCircle((x + 1.1) * u, 27.2 * u, 0.8 * u);
  }
  g.fillStyle(COLORS.monkeyEye);
  g.fillCircle(30.8 * u, 33.5 * u, 0.9 * u);
  g.fillCircle(33.2 * u, 33.5 * u, 0.9 * u);
  g.lineStyle(1.6 * u, COLORS.monkeyEye);
  g.beginPath();
  g.arc(32 * u, 36 * u, 5 * u, Phaser.Math.DegToRad(25), Phaser.Math.DegToRad(155));
  g.strokePath();

  g.generateTexture(key, GRID_WIDTH * u, GRID_HEIGHT * u);
  g.destroy();
}

/** Makes all the pictures of the monkey in one colour (only the first time). */
function createMonkeyTextures(scene: Phaser.Scene, color: MonkeyColor): void {
  for (const pose of Object.keys(POSES) as MonkeyPose[]) createMonkeyTexture(scene, color, pose);
}

/** Shows the given picture of the monkey, in the given colour. */
export function setMonkeyPose(
  monkey: Phaser.GameObjects.Image,
  pose: MonkeyPose,
  color: MonkeyColor,
): void {
  const key = textureKey(color, pose);
  if (monkey.texture.key === key) return;
  createMonkeyTextures(monkey.scene, color);
  monkey.setTexture(key);
}

/**
 * The player: a monkey Julius picked as the jungle hero.
 * Its origin is where the hands hold a vine, so it hangs from a vine tip naturally.
 * All pictures are the same size, so the origin stays in the same place.
 */
export function createMonkey(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: MonkeyColor,
): Phaser.GameObjects.Image {
  createMonkeyTextures(scene, color);
  return scene.add.image(x, y, textureKey(color, 'stand')).setOrigin(0.5, HANDS_Y / GRID_HEIGHT);
}
