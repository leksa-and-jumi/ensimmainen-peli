import Phaser from 'phaser';
import { COLORS, PLAYER_WIDTH } from '../config';
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

const textureKey = (pose: MonkeyPose): string => `monkey-${pose}`;

/** The last point of a limb: where the hand or foot goes. */
function end(points: Point[]): Point {
  const last = points[points.length - 1];
  if (!last) throw new Error('A limb needs at least one point');
  return last;
}

/** Draws one picture of the monkey into a texture. */
function createMonkeyTexture(scene: Phaser.Scene, pose: MonkeyPose): void {
  const key = textureKey(pose);
  if (scene.textures.exists(key)) return;

  const limbs = POSES[pose];
  const u = PLAYER_WIDTH / GRID_WIDTH;
  const g = scene.add.graphics();
  const limb = (points: Point[]): void => {
    g.lineStyle(7 * u, COLORS.monkeyFur);
    g.strokePoints(
      points.map(([x, y]) => new Phaser.Math.Vector2(x * u, y * u)),
      false,
    );
  };

  // Curly tail
  g.lineStyle(5 * u, COLORS.monkeyFur);
  g.beginPath();
  g.moveTo(40 * u, 70 * u);
  g.lineTo(50.4 * u, 72.9 * u);
  g.arc(52 * u, 64 * u, 9 * u, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(330));
  g.strokePath();

  // Legs and feet
  limb(limbs.leftLeg);
  limb(limbs.rightLeg);
  g.fillStyle(COLORS.monkeyFace);
  const [lx, ly] = end(limbs.leftLeg);
  const [rx, ry] = end(limbs.rightLeg);
  g.fillEllipse((lx - 2) * u, (ly + 1) * u, 10 * u, 5 * u);
  g.fillEllipse((rx + 2) * u, (ry + 1) * u, 10 * u, 5 * u);

  // Body and belly
  g.fillStyle(COLORS.monkeyFur);
  g.fillEllipse(32 * u, 60 * u, 28 * u, 36 * u);
  g.fillStyle(COLORS.monkeyFace);
  g.fillEllipse(32 * u, 63 * u, 16 * u, 22 * u);

  // Ears
  g.fillStyle(COLORS.monkeyFur);
  g.fillCircle(15 * u, 27 * u, 7 * u);
  g.fillCircle(49 * u, 27 * u, 7 * u);
  g.fillStyle(COLORS.monkeyFace);
  g.fillCircle(15 * u, 27 * u, 3.5 * u);
  g.fillCircle(49 * u, 27 * u, 3.5 * u);

  // Arms and hands
  limb(limbs.leftArm);
  limb(limbs.rightArm);
  g.fillStyle(COLORS.monkeyFace);
  for (const arm of [limbs.leftArm, limbs.rightArm]) {
    const [hx, hy] = end(arm);
    g.fillCircle(hx * u, hy * u, 4.5 * u);
  }

  // Head
  g.fillStyle(COLORS.monkeyFur);
  g.fillCircle(32 * u, 30 * u, 17 * u);

  // Face
  g.fillStyle(COLORS.monkeyFace);
  g.fillEllipse(32 * u, 35 * u, 24 * u, 19 * u);
  g.fillCircle(26 * u, 26 * u, 6 * u);
  g.fillCircle(38 * u, 26 * u, 6 * u);

  // Eyes and smile
  g.fillStyle(COLORS.monkeyEye);
  g.fillCircle(26.5 * u, 26.5 * u, 2.4 * u);
  g.fillCircle(37.5 * u, 26.5 * u, 2.4 * u);
  g.lineStyle(2 * u, COLORS.monkeyEye);
  g.beginPath();
  g.arc(32 * u, 35 * u, 6 * u, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160));
  g.strokePath();

  g.generateTexture(key, GRID_WIDTH * u, GRID_HEIGHT * u);
  g.destroy();
}

/** Shows the given picture of the monkey. */
export function setMonkeyPose(monkey: Phaser.GameObjects.Image, pose: MonkeyPose): void {
  const key = textureKey(pose);
  if (monkey.texture.key !== key) monkey.setTexture(key);
}

/**
 * The player: a monkey Julius picked as the jungle hero.
 * Its origin is where the hands hold a vine, so it hangs from a vine tip naturally.
 * All pictures are the same size, so the origin stays in the same place.
 */
export function createMonkey(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Image {
  for (const pose of Object.keys(POSES) as MonkeyPose[]) createMonkeyTexture(scene, pose);
  return scene.add.image(x, y, textureKey('stand')).setOrigin(0.5, HANDS_Y / GRID_HEIGHT);
}
