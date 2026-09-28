import Phaser from 'phaser';
import { COLORS, DEPTH, GAME_HEIGHT, GAME_WIDTH, GROUND_Y, JUNGLE, LEAVES } from '../config';
import {
  leafTilt,
  leafX,
  spawnLeaf,
  stepLeaf,
  type FallingLeaf,
  type LeafRules,
} from '../logic/fallingLeaf';

const TEXTURE_KEY = 'falling-leaf';

const RULES: LeafRules = {
  fallSpeed: LEAVES.fallSpeed,
  swayPixels: LEAVES.swayPixels,
  swayPeriodMs: LEAVES.swayPeriodMs,
  spread: LEAVES.spread,
  maxWaitMs: LEAVES.maxWaitMs,
};

/** Leaves fall from the tops of the big trees and from the leafy roof. */
function spawnPoints(nearLayerX: number): { x: number; y: number }[] {
  const treeTops = JUNGLE.trees.map((tree) => ({
    x: tree.x * GAME_WIDTH + nearLayerX,
    y: GAME_HEIGHT - tree.height,
  }));
  const roof = LEAVES.canopySpots.map((f) => ({ x: f * GAME_WIDTH, y: LEAVES.canopyY }));
  return [...treeTops, ...roof];
}

interface LeafSprite {
  image: Phaser.GameObjects.Image;
  leaf: FallingLeaf;
}

/** A few leaves that keep falling from the trees, one after another. */
export class FallingLeaves {
  private readonly sprites: LeafSprite[];

  constructor(scene: Phaser.Scene) {
    if (!scene.textures.exists(TEXTURE_KEY)) {
      const { width: w, height: h } = LEAVES;
      const g = scene.add.graphics();
      g.fillStyle(COLORS.fallingLeaf);
      g.fillEllipse(w / 2, h / 2, w, h);
      g.lineStyle(1, COLORS.fallingLeafVein);
      g.lineBetween(1, h / 2, w - 1, h / 2);
      g.generateTexture(TEXTURE_KEY, w, h);
      g.destroy();
    }
    this.sprites = Array.from({ length: LEAVES.count }, () => ({
      image: scene.add.image(0, 0, TEXTURE_KEY).setDepth(DEPTH.fallingLeaves).setVisible(false),
      leaf: spawnLeaf(spawnPoints(0), RULES),
    }));
  }

  /** Moves the leaves. `nearLayerX` is how far the near trees have slid. */
  update(deltaMs: number, nearLayerX: number): void {
    for (const sprite of this.sprites) {
      sprite.leaf = stepLeaf(sprite.leaf, deltaMs, RULES);
      if (sprite.leaf.y > GROUND_Y) {
        sprite.leaf = spawnLeaf(spawnPoints(nearLayerX), RULES);
      }
      const falling = sprite.leaf.waitMs === 0;
      sprite.image
        .setVisible(falling)
        .setPosition(leafX(sprite.leaf, RULES), sprite.leaf.y)
        .setRotation(leafTilt(sprite.leaf, RULES));
    }
  }
}
