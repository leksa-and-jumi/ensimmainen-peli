import Phaser from 'phaser';
import { COLORS, DEPTH, GAME_WIDTH, GROUND_Y, LEAVES } from '../config';
import {
  calmLeafDue,
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
  windDrift: LEAVES.windDrift,
};

const ROOF_SPOTS = LEAVES.canopySpots.map((f) => ({ x: f * GAME_WIDTH, y: LEAVES.canopyY }));

type Point = { x: number; y: number };

interface LeafSprite {
  image: Phaser.GameObjects.Image;
  /** The falling leaf, or null when this leaf is waiting to be used. */
  leaf: FallingLeaf | null;
}

/**
 * Leaves falling from the big trees. A gust blows several off at once; in
 * calm weather one falls now and then. The wind carries them sideways.
 */
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
      leaf: null,
    }));
  }

  /**
   * Moves the leaves. `wind` is 0–1, `gust` is true when a gust just started,
   * and `treeTops` are where the leaves of the big trees are right now.
   */
  update(deltaMs: number, wind: number, gust: boolean, treeTops: readonly Point[]): void {
    if (gust) {
      for (let i = 0; i < LEAVES.burstCount; i++) this.release(treeTops);
    } else if (calmLeafDue(deltaMs, LEAVES.calmPerSecond)) {
      this.release([...treeTops, ...ROOF_SPOTS]);
    }

    for (const sprite of this.sprites) {
      if (!sprite.leaf) continue;
      sprite.leaf = stepLeaf(sprite.leaf, deltaMs, RULES, wind);
      const x = leafX(sprite.leaf, RULES);
      const gone = sprite.leaf.y > GROUND_Y || x > GAME_WIDTH + LEAVES.width;
      if (gone) {
        sprite.leaf = null;
        sprite.image.setVisible(false);
        continue;
      }
      sprite.image.setVisible(true).setPosition(x, sprite.leaf.y);
      sprite.image.setRotation(leafTilt(sprite.leaf, RULES));
    }
  }

  /** Lets one waiting leaf fall from one of the spots, if any leaf is free. */
  private release(spots: readonly Point[]): void {
    const free = this.sprites.find((sprite) => sprite.leaf === null);
    if (free) free.leaf = spawnLeaf(spots, RULES);
  }
}
