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
  WIND,
} from '../config';
import { parallaxOffset } from '../logic/parallax';

/** The three background layers that slide at different speeds. */
export interface JungleLayers {
  far: Phaser.GameObjects.Graphics;
  mid: Phaser.GameObjects.Graphics;
  /** The big trees, one drawing each, so each can sway in the wind. */
  near: Phaser.GameObjects.Container;
  trees: Phaser.GameObjects.Graphics[];
}

/** Layers are drawn wider than the screen, so sliding never shows an edge. */
const LEFT = -PARALLAX.margin;
const RIGHT = GAME_WIDTH + PARALLAX.margin;

/** Far away: misty hills, each with a lighter top where the sun shines. */
function drawFarLayer(g: Phaser.GameObjects.Graphics): void {
  PARALLAX.hills.forEach((hill, i) => {
    const x = hill.x * GAME_WIDTH;
    g.fillStyle(i % 2 === 0 ? COLORS.farHills : COLORS.farHillsLight);
    g.fillCircle(x, hill.y, hill.radius);
    g.fillStyle(COLORS.farHillsTop, 0.35);
    g.fillCircle(x - hill.radius * 0.2, hill.y - hill.radius * 0.15, hill.radius * 0.8);
  });
}

/** In the middle: the bushy tree line where the jungle begins (two rows), and its shadows. */
function drawMidLayer(g: Phaser.GameObjects.Graphics): void {
  const { skyBottomY: y, treeLineSpacing: step, treeLineRadius: r } = JUNGLE;
  g.fillStyle(COLORS.jungleShade);
  for (let x = LEFT - step / 2; x <= RIGHT; x += step) g.fillCircle(x, y - r * 0.35, r * 0.9);
  g.fillStyle(COLORS.background);
  g.fillRect(LEFT, y, RIGHT - LEFT, GAME_HEIGHT - y);
  for (let x = LEFT; x <= RIGHT; x += step) g.fillCircle(x, y, r);
  g.fillStyle(COLORS.leafLight, 0.25);
  for (let x = LEFT; x <= RIGHT; x += step) g.fillCircle(x - r * 0.3, y - r * 0.35, r * 0.45);

  g.fillStyle(COLORS.jungleShade);
  for (const blob of JUNGLE.shadeBlobs) {
    g.fillCircle(blob.x * GAME_WIDTH, blob.y * GAME_HEIGHT, blob.radius);
  }
}

/**
 * Draws one big tree. `lean` is how far the wind pushes its top to the right:
 * the trunk bends and the leaves follow. A cartoon with outlines, a tapering
 * trunk with bark lines and a light side, and a leafy crown in three shades.
 */
function drawTree(
  g: Phaser.GameObjects.Graphics,
  tree: (typeof JUNGLE.trees)[number],
  lean: number,
): void {
  const x = tree.x * GAME_WIDTH;
  const top = GAME_HEIGHT - tree.height;
  const r = JUNGLE.leafRadius;
  const { puffs, spread, puffSize, outline } = JUNGLE.crown;
  const w = JUNGLE.trunkWidth;

  // The trunk stands straight at the bottom and bends more towards the top.
  const along = (f: number) => ({
    x: x + lean * f * f,
    y: GAME_HEIGHT - f * tree.height,
  });
  const trunk = (width: (f: number) => number, color: number, shift = 0): void => {
    g.fillStyle(color);
    for (let i = 0; i <= WIND.trunkPoints * 4; i++) {
      const f = i / (WIND.trunkPoints * 4);
      const p = along(f);
      g.fillCircle(p.x + shift, p.y, width(f) / 2);
    }
  };

  g.clear();
  // Roots spread out at the bottom.
  g.fillStyle(COLORS.trunkDark);
  g.fillEllipse(x, GAME_HEIGHT - 4, w * 2.4 + outline, w * 0.9 + outline);
  g.fillStyle(COLORS.trunk);
  g.fillEllipse(x, GAME_HEIGHT - 4, w * 2.4, w * 0.9);
  // Trunk: dark edge, wood, and a lighter left side.
  trunk((f) => w * (1.15 - 0.4 * f) + outline, COLORS.trunkDark);
  trunk((f) => w * (1.15 - 0.4 * f), COLORS.trunk);
  trunk((f) => w * (0.35 - 0.12 * f), COLORS.trunkLight, -w * 0.22);
  // A few bark lines.
  g.lineStyle(2, COLORS.trunkDark);
  for (const f of [0.2, 0.42, 0.63]) {
    const p = along(f);
    g.beginPath();
    g.arc(p.x + w * 0.1, p.y, w * 0.3, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(300));
    g.strokePath();
  }

  // Crown: puffs of leaves around a middle. Dark edge first, then three shades.
  const cx = x + lean * 1.1;
  const puffCenters = Array.from({ length: puffs }, (_, i) => {
    const angle = (i / puffs) * Math.PI * 2;
    return { x: cx + Math.cos(angle) * r * spread, y: top + Math.sin(angle) * r * spread * 0.7 };
  });
  const puffR = r * puffSize;
  g.fillStyle(COLORS.leafOutline);
  for (const p of puffCenters) g.fillCircle(p.x, p.y, puffR + outline);
  g.fillCircle(cx, top, r * 0.8 + outline);
  g.fillStyle(COLORS.leafDark);
  for (const p of puffCenters) g.fillCircle(p.x, p.y, puffR);
  g.fillCircle(cx, top, r * 0.8);
  g.fillStyle(COLORS.leaf);
  for (const p of puffCenters) g.fillCircle(p.x - puffR * 0.15, p.y - puffR * 0.2, puffR * 0.75);
  g.fillStyle(COLORS.leafLight);
  for (const p of puffCenters.filter((p) => p.y < top)) {
    g.fillCircle(p.x - puffR * 0.3, p.y - puffR * 0.35, puffR * 0.4);
  }
}

/**
 * The leafy roof at the top, where the vines hang from, and the ground with
 * grass blades and pebbles. They stay still.
 */
function drawFrame(g: Phaser.GameObjects.Graphics): void {
  const { canopySpacing: step, canopyRadius: r } = JUNGLE;
  g.fillStyle(COLORS.leafOutline);
  for (let x = -step / 2; x <= GAME_WIDTH + step; x += step) g.fillCircle(x, 6, r + 3);
  g.fillStyle(COLORS.leafDark);
  for (let x = -step / 2; x <= GAME_WIDTH + step; x += step) g.fillCircle(x, 6, r);
  let light = false;
  for (let x = 0; x <= GAME_WIDTH; x += step) {
    g.fillStyle(light ? COLORS.leafLight : COLORS.leaf);
    g.fillCircle(x, 0, r * 0.85);
    light = !light;
  }

  g.fillStyle(COLORS.ground);
  g.fillRect(0, GROUND_Y, GAME_WIDTH, GROUND_HEIGHT);
  g.fillStyle(COLORS.groundDark);
  for (let x = 7; x < GAME_WIDTH; x += 23) {
    g.fillEllipse(x, GROUND_Y + 18 + ((x * 7) % 22), 6, 3);
  }
  g.fillStyle(COLORS.groundGrass);
  g.fillRect(0, GROUND_Y, GAME_WIDTH, GRASS_HEIGHT);
  g.fillStyle(COLORS.grassBlade);
  for (let x = 0; x < GAME_WIDTH; x += 6) {
    const h = 5 + ((x * 13) % 7);
    g.fillTriangle(x, GROUND_Y + 2, x + 5, GROUND_Y + 2, x + 2 + ((x * 3) % 3), GROUND_Y - h);
  }
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
  const trees = JUNGLE.trees.map((tree) => {
    const g = scene.add.graphics();
    drawTree(g, tree, 0);
    return g;
  });
  const layers = {
    far: layer(DEPTH.farLayer, drawFarLayer),
    mid: layer(DEPTH.midLayer, drawMidLayer),
    near: scene.add.container(0, 0, trees).setDepth(DEPTH.nearLayer),
    trees,
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

/** Redraws the big trees leaning in the wind (one lean in pixels per tree). */
export function swayTrees(layers: JungleLayers, leans: readonly number[]): void {
  JUNGLE.trees.forEach((tree, i) => {
    const g = layers.trees[i];
    if (g) drawTree(g, tree, leans[i] ?? 0);
  });
}
