import Phaser from 'phaser';
import { COLORS, MONKEY_COLORS, PLAYER_WIDTH, type MonkeyColor } from '../config';
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

/** Draws one picture of the monkey in the given colour into a texture. */
function createMonkeyTexture(scene: Phaser.Scene, color: MonkeyColor, pose: MonkeyPose): void {
  const key = textureKey(color, pose);
  if (scene.textures.exists(key)) return;

  const fur = MONKEY_COLORS[color];
  const limbs = POSES[pose];
  const u = PLAYER_WIDTH / GRID_WIDTH;
  const g = scene.add.graphics();
  const limb = (points: Point[], furColor: number): void => {
    g.lineStyle(7 * u, furColor);
    g.strokePoints(
      points.map(([x, y]) => new Phaser.Math.Vector2(x * u, y * u)),
      false,
    );
  };

  // Curly tail
  g.lineStyle(5 * u, fur.tail);
  g.beginPath();
  g.moveTo(40 * u, 70 * u);
  g.lineTo(50.4 * u, 72.9 * u);
  g.arc(52 * u, 64 * u, 9 * u, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(330));
  g.strokePath();

  // Legs and feet
  limb(limbs.leftLeg, fur.legs);
  limb(limbs.rightLeg, fur.legs);
  g.fillStyle(COLORS.monkeyFace);
  const feet = footCenters(limbs);
  for (const [fx, fy] of [feet.left, feet.right]) g.fillEllipse(fx * u, fy * u, 10 * u, 5 * u);

  // Body and belly
  g.fillStyle(fur.body);
  g.fillEllipse(32 * u, 60 * u, 28 * u, 36 * u);
  g.fillStyle(COLORS.monkeyFace);
  g.fillEllipse(32 * u, 63 * u, 16 * u, 22 * u);

  // Ears
  g.fillStyle(fur.ears);
  g.fillCircle(15 * u, 27 * u, 7 * u);
  g.fillCircle(49 * u, 27 * u, 7 * u);
  g.fillStyle(COLORS.monkeyFace);
  g.fillCircle(15 * u, 27 * u, 3.5 * u);
  g.fillCircle(49 * u, 27 * u, 3.5 * u);

  // Arms and hands
  limb(limbs.leftArm, fur.arms);
  limb(limbs.rightArm, fur.arms);
  g.fillStyle(COLORS.monkeyFace);
  for (const arm of [limbs.leftArm, limbs.rightArm]) {
    const [hx, hy] = end(arm);
    g.fillCircle(hx * u, hy * u, 4.5 * u);
  }

  // Head
  g.fillStyle(fur.head);
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
