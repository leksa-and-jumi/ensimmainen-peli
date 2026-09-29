import Phaser from 'phaser';
import { COLORS, PLAYER_WIDTH } from '../config';

/** Clothes are drawn on the same grid as the monkey (64 wide), so they fit its head. */
const U = PLAYER_WIDTH / 64;

interface ClothesDrawing {
  /** Texture size in grid units. */
  width: number;
  height: number;
  /** The texture's point that sits on the monkey (texture grid units)… */
  anchor: [number, number];
  /** …and how far that point is from the monkey's hands (monkey grid units). */
  offset: [number, number];
  draw: (g: Phaser.GameObjects.Graphics) => void;
}

/** In drawing order: later ones are drawn on top. */
const DRAWINGS: Record<string, ClothesDrawing> = {
  // A striped scarf around the neck, one end hanging down.
  scarf: {
    width: 30,
    height: 22,
    anchor: [15, 4],
    offset: [0, 41],
    draw: (g) => {
      g.fillStyle(COLORS.scarf);
      g.fillEllipse(15 * U, 4 * U, 28 * U, 8 * U);
      g.fillRect(17 * U, 4 * U, 6 * U, 16 * U);
      g.fillStyle(COLORS.scarfStripe);
      g.fillRect(17 * U, 11 * U, 6 * U, 2 * U);
      g.fillRect(17 * U, 16 * U, 6 * U, 2 * U);
    },
  },
  // A bow tie under the chin.
  bowtie: {
    width: 22,
    height: 12,
    anchor: [11, 6],
    offset: [0, 42],
    draw: (g) => {
      g.fillStyle(COLORS.bowtie);
      g.fillTriangle(1 * U, 1 * U, 1 * U, 11 * U, 11 * U, 6 * U);
      g.fillTriangle(21 * U, 1 * U, 21 * U, 11 * U, 11 * U, 6 * U);
      g.fillStyle(COLORS.bowtieKnot);
      g.fillCircle(11 * U, 6 * U, 2.5 * U);
    },
  },
  // Sunglasses over the eyes.
  glasses: {
    width: 26,
    height: 12,
    anchor: [13, 6],
    offset: [0, 21.5],
    draw: (g) => {
      g.lineStyle(1.5 * U, COLORS.glassesFrame);
      g.lineBetween(9 * U, 5 * U, 17 * U, 5 * U);
      for (const x of [6.5, 19.5]) {
        g.fillStyle(COLORS.glassesLens);
        g.fillCircle(x * U, 6 * U, 5 * U);
        g.strokeCircle(x * U, 6 * U, 5 * U);
        g.fillStyle(COLORS.glassesShine);
        g.fillCircle((x - 2) * U, 4 * U, 1.2 * U);
      }
    },
  },
  // An explorer's hat on top of the head.
  hat: {
    width: 44,
    height: 20,
    anchor: [22, 14],
    offset: [0, 10],
    draw: (g) => {
      g.fillStyle(COLORS.hat);
      g.fillEllipse(22 * U, 10 * U, 24 * U, 16 * U);
      g.fillEllipse(22 * U, 15 * U, 42 * U, 7 * U);
      g.fillStyle(COLORS.hatBand);
      g.fillRect(11 * U, 11 * U, 22 * U, 3 * U);
    },
  },
  // A golden crown with gems.
  crown: {
    width: 30,
    height: 18,
    anchor: [15, 16],
    offset: [0, 10],
    draw: (g) => {
      g.fillStyle(COLORS.crown);
      g.fillRect(3 * U, 10 * U, 24 * U, 7 * U);
      g.fillTriangle(3 * U, 11 * U, 9 * U, 11 * U, 4 * U, 1 * U);
      g.fillTriangle(11 * U, 11 * U, 19 * U, 11 * U, 15 * U, 0);
      g.fillTriangle(21 * U, 11 * U, 27 * U, 11 * U, 26 * U, 1 * U);
      g.fillStyle(COLORS.crownGemRed);
      g.fillCircle(15 * U, 13.5 * U, 2 * U);
      g.fillStyle(COLORS.crownGemBlue);
      g.fillCircle(8 * U, 13.5 * U, 1.5 * U);
      g.fillCircle(22 * U, 13.5 * U, 1.5 * U);
    },
  },
};

const textureKey = (id: string): string => `clothes-${id}`;

/** Makes the picture of one piece of clothing, e.g. for the shop. Returns its texture key. */
export function clothesTexture(scene: Phaser.Scene, id: string): string {
  const drawing = DRAWINGS[id];
  if (!drawing) throw new Error(`No drawing for clothes "${id}"`);
  const key = textureKey(id);
  if (!scene.textures.exists(key)) {
    const g = scene.add.graphics();
    drawing.draw(g);
    g.generateTexture(key, drawing.width * U, drawing.height * U);
    g.destroy();
  }
  return key;
}

/** The clothes the monkey wears. They follow it around, also when it hangs tilted. */
export class MonkeyClothes {
  private readonly pieces: {
    id: string;
    image: Phaser.GameObjects.Image;
    drawing: ClothesDrawing;
  }[];
  private worn: readonly string[] = [];

  constructor(scene: Phaser.Scene) {
    this.pieces = Object.entries(DRAWINGS).map(([id, drawing]) => ({
      id,
      drawing,
      image: scene.add
        .image(0, 0, clothesTexture(scene, id))
        .setOrigin(drawing.anchor[0] / drawing.width, drawing.anchor[1] / drawing.height)
        .setVisible(false),
    }));
  }

  setWorn(worn: readonly string[]): void {
    this.worn = worn;
  }

  /** Moves the clothes onto the monkey. */
  follow(monkey: Phaser.GameObjects.Image): void {
    const cos = Math.cos(monkey.rotation);
    const sin = Math.sin(monkey.rotation);
    for (const { id, image, drawing } of this.pieces) {
      const [ox, oy] = [drawing.offset[0] * U, drawing.offset[1] * U];
      image
        .setPosition(monkey.x + ox * cos - oy * sin, monkey.y + ox * sin + oy * cos)
        .setRotation(monkey.rotation)
        .setVisible(monkey.visible && this.worn.includes(id));
    }
  }
}
