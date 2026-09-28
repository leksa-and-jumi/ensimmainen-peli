import Phaser from 'phaser';
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRASS_HEIGHT,
  GROUND_HEIGHT,
  GROUND_Y,
  JUNGLE,
} from '../config';

/** Draws the sky. The sun and clouds are in SkyLights, so they can go away at night. */
function drawSky(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(COLORS.sky);
  g.fillRect(0, 0, GAME_WIDTH, JUNGLE.skyBottomY);

  // Bushy tree line where the jungle begins.
  g.fillStyle(COLORS.background);
  for (let x = 0; x <= GAME_WIDTH; x += JUNGLE.treeLineSpacing) {
    g.fillCircle(x, JUNGLE.skyBottomY, JUNGLE.treeLineRadius);
  }
}

/** Draws the leafy roof at the top of the screen. */
function drawCanopy(g: Phaser.GameObjects.Graphics): void {
  let light = false;
  for (let x = 0; x <= GAME_WIDTH; x += JUNGLE.canopySpacing) {
    g.fillStyle(light ? COLORS.leafLight : COLORS.leaf);
    g.fillCircle(x, 0, JUNGLE.canopyRadius);
    light = !light;
  }
}

/** Draws the static scenery: sky, shade, trees, the leafy roof and the ground. */
export function drawJungle(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  drawSky(g);

  g.fillStyle(COLORS.jungleShade);
  for (const blob of JUNGLE.shadeBlobs) {
    g.fillCircle(blob.x * GAME_WIDTH, blob.y * GAME_HEIGHT, blob.radius);
  }

  for (const tree of JUNGLE.trees) {
    const x = tree.x * GAME_WIDTH;
    const top = GAME_HEIGHT - tree.height;
    const r = JUNGLE.leafRadius;

    g.fillStyle(COLORS.trunk);
    g.fillRect(x - JUNGLE.trunkWidth / 2, top, JUNGLE.trunkWidth, tree.height);

    g.fillStyle(COLORS.leaf);
    g.fillCircle(x - r * 0.8, top, r);
    g.fillCircle(x + r * 0.8, top, r);
    g.fillStyle(COLORS.leafLight);
    g.fillCircle(x, top - r * 0.5, r);
  }

  drawCanopy(g);

  g.fillStyle(COLORS.ground);
  g.fillRect(0, GROUND_Y, GAME_WIDTH, GROUND_HEIGHT);
  g.fillStyle(COLORS.groundGrass);
  g.fillRect(0, GROUND_Y, GAME_WIDTH, GRASS_HEIGHT);
}
