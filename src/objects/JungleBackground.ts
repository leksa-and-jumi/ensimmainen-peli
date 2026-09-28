import Phaser from 'phaser';
import {
  COLORS,
  DEPTH,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRASS_HEIGHT,
  GROUND_HEIGHT,
  GROUND_Y,
  JUNGLE,
  PARALLAX,
} from '../config';
import { parallaxOffset } from '../logic/parallax';

/** The three background layers that slide at different speeds. */
export interface JungleLayers {
  far: Phaser.GameObjects.Graphics;
  mid: Phaser.GameObjects.Graphics;
  near: Phaser.GameObjects.Graphics;
}

/** Layers are drawn wider than the screen, so sliding never shows an edge. */
const LEFT = -PARALLAX.margin;
const RIGHT = GAME_WIDTH + PARALLAX.margin;

/** Far away: misty hills. */
function drawFarLayer(g: Phaser.GameObjects.Graphics): void {
  PARALLAX.hills.forEach((hill, i) => {
    g.fillStyle(i % 2 === 0 ? COLORS.farHills : COLORS.farHillsLight);
    g.fillCircle(hill.x * GAME_WIDTH, hill.y, hill.radius);
  });
}

/** In the middle: the bushy tree line where the jungle begins, and its shadows. */
function drawMidLayer(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(COLORS.background);
  g.fillRect(LEFT, JUNGLE.skyBottomY, RIGHT - LEFT, GAME_HEIGHT - JUNGLE.skyBottomY);
  for (let x = LEFT; x <= RIGHT; x += JUNGLE.treeLineSpacing) {
    g.fillCircle(x, JUNGLE.skyBottomY, JUNGLE.treeLineRadius);
  }

  g.fillStyle(COLORS.jungleShade);
  for (const blob of JUNGLE.shadeBlobs) {
    g.fillCircle(blob.x * GAME_WIDTH, blob.y * GAME_HEIGHT, blob.radius);
  }
}

/** Near: the big trees. */
function drawNearLayer(g: Phaser.GameObjects.Graphics): void {
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
}

/** The leafy roof at the top, where the vines hang from, and the ground. They stay still. */
function drawFrame(g: Phaser.GameObjects.Graphics): void {
  let light = false;
  for (let x = 0; x <= GAME_WIDTH; x += JUNGLE.canopySpacing) {
    g.fillStyle(light ? COLORS.leafLight : COLORS.leaf);
    g.fillCircle(x, 0, JUNGLE.canopyRadius);
    light = !light;
  }

  g.fillStyle(COLORS.ground);
  g.fillRect(0, GROUND_Y, GAME_WIDTH, GROUND_HEIGHT);
  g.fillStyle(COLORS.groundGrass);
  g.fillRect(0, GROUND_Y, GAME_WIDTH, GRASS_HEIGHT);
}

/**
 * Draws the jungle: the sky, three sliding layers (far, middle, near),
 * and the still frame (leafy roof and ground).
 */
export function createJungle(scene: Phaser.Scene): JungleLayers {
  scene.add
    .graphics()
    .setDepth(DEPTH.sky)
    .fillStyle(COLORS.sky)
    .fillRect(0, 0, GAME_WIDTH, JUNGLE.skyBottomY);

  const layer = (depth: number, draw: (g: Phaser.GameObjects.Graphics) => void) => {
    const g = scene.add.graphics().setDepth(depth);
    draw(g);
    return g;
  };
  const layers = {
    far: layer(DEPTH.farLayer, drawFarLayer),
    mid: layer(DEPTH.midLayer, drawMidLayer),
    near: layer(DEPTH.nearLayer, drawNearLayer),
  };
  layer(DEPTH.frame, drawFrame);
  return layers;
}

/** Slides the layers depending on where the monkey is. */
export function slideLayers(layers: JungleLayers, focusX: number): void {
  const center = GAME_WIDTH / 2;
  layers.far.x = parallaxOffset(focusX, center, PARALLAX.farFactor);
  layers.mid.x = parallaxOffset(focusX, center, PARALLAX.midFactor);
  layers.near.x = parallaxOffset(focusX, center, PARALLAX.nearFactor);
}
