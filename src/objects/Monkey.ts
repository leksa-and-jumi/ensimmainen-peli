import Phaser from 'phaser';
import { COLORS, PLAYER_WIDTH } from '../config';

const TEXTURE_KEY = 'monkey';

/** The monkey is drawn on a 64 x 88 grid and scaled to PLAYER_WIDTH. */
const GRID_WIDTH = 64;
const GRID_HEIGHT = 88;
/** Where the hands meet above the head (grid units). */
const HANDS_Y = 5;

/** Draws the monkey once into a texture so it can be used as an image. */
function createMonkeyTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEY)) return;

  const u = PLAYER_WIDTH / GRID_WIDTH;
  const g = scene.add.graphics();
  const limb = (points: [number, number][], width: number): void => {
    g.lineStyle(width * u, COLORS.monkeyFur);
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
  limb(
    [
      [25, 72],
      [21, 84],
    ],
    7,
  );
  limb(
    [
      [39, 72],
      [43, 84],
    ],
    7,
  );
  g.fillStyle(COLORS.monkeyFace);
  g.fillEllipse(19 * u, 85 * u, 10 * u, 5 * u);
  g.fillEllipse(45 * u, 85 * u, 10 * u, 5 * u);

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

  // Arms reach up above the head so the monkey can hold on to a vine.
  limb(
    [
      [22, 50],
      [6, 40],
      [28, HANDS_Y],
    ],
    7,
  );
  limb(
    [
      [42, 50],
      [58, 40],
      [36, HANDS_Y],
    ],
    7,
  );

  // Hands
  g.fillStyle(COLORS.monkeyFace);
  g.fillCircle(28 * u, HANDS_Y * u, 4.5 * u);
  g.fillCircle(36 * u, HANDS_Y * u, 4.5 * u);

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

  g.generateTexture(TEXTURE_KEY, GRID_WIDTH * u, GRID_HEIGHT * u);
  g.destroy();
}

/**
 * The player: a monkey Julius picked as the jungle hero.
 * Its origin is at the hands, so it hangs from a vine tip naturally.
 */
export function createMonkey(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Image {
  createMonkeyTexture(scene);
  return scene.add.image(x, y, TEXTURE_KEY).setOrigin(0.5, HANDS_Y / GRID_HEIGHT);
}
