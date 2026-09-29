import Phaser from 'phaser';
import { COLORS, PLAYER_WIDTH } from '../config';
import type { MonkeyPose } from '../logic/pose';
import { feetFromHands } from './Monkey';
import { darker, lighter } from './shade';

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
  /** Shoes go on both feet and move with them, so they don't use `offset`. */
  onFeet?: boolean;
  draw: (g: Phaser.GameObjects.Graphics) => void;
}

/**
 * In drawing order: later ones are drawn on top. Each piece has a dark edge
 * and a bit of shading, to match the cartoon monkey.
 */
const DRAWINGS: Record<string, ClothesDrawing> = {
  // A striped scarf around the neck, one end hanging down with a fringe.
  scarf: {
    width: 30,
    height: 24,
    anchor: [15, 4],
    offset: [0, 41],
    draw: (g) => {
      const edge = darker(COLORS.scarf, 35);
      g.fillStyle(edge);
      g.fillEllipse(15 * U, 4 * U, 29.5 * U, 9.5 * U);
      g.fillRect(16.3 * U, 4 * U, 7.4 * U, 16.7 * U);
      g.fillStyle(COLORS.scarf);
      g.fillEllipse(15 * U, 4 * U, 28 * U, 8 * U);
      g.fillRect(17 * U, 4 * U, 6 * U, 16 * U);
      g.fillStyle(COLORS.scarfStripe);
      g.fillRect(17 * U, 10 * U, 6 * U, 2 * U);
      g.fillRect(17 * U, 15 * U, 6 * U, 2 * U);
      g.fillRect(3 * U, 3 * U, 3 * U, 2 * U);
      g.fillRect(24 * U, 3 * U, 3 * U, 2 * U);
      g.lineStyle(1 * U, COLORS.scarf);
      for (const x of [17.8, 19.4, 21, 22.6]) g.lineBetween(x * U, 20 * U, x * U, 23 * U);
    },
  },
  // A bow tie under the chin, with folds and a knot.
  bowtie: {
    width: 22,
    height: 12,
    anchor: [11, 6],
    offset: [0, 42],
    draw: (g) => {
      const edge = darker(COLORS.bowtie, 35);
      g.fillStyle(edge);
      g.fillTriangle(0, 0, 0, 12 * U, 11 * U, 6 * U);
      g.fillTriangle(22 * U, 0, 22 * U, 12 * U, 11 * U, 6 * U);
      g.fillStyle(COLORS.bowtie);
      g.fillTriangle(1 * U, 1.2 * U, 1 * U, 10.8 * U, 10 * U, 6 * U);
      g.fillTriangle(21 * U, 1.2 * U, 21 * U, 10.8 * U, 12 * U, 6 * U);
      g.lineStyle(0.8 * U, edge);
      g.lineBetween(3 * U, 4 * U, 8 * U, 6 * U);
      g.lineBetween(19 * U, 4 * U, 14 * U, 6 * U);
      g.fillStyle(edge);
      g.fillCircle(11 * U, 6 * U, 3 * U);
      g.fillStyle(COLORS.bowtieKnot);
      g.fillCircle(11 * U, 6 * U, 2.3 * U);
    },
  },
  // Sunglasses over the eyes, with a shine on each lens.
  glasses: {
    width: 26,
    height: 12,
    anchor: [13, 6],
    offset: [0, 22.5],
    draw: (g) => {
      g.lineStyle(2 * U, COLORS.glassesFrame);
      g.lineBetween(9 * U, 5 * U, 17 * U, 5 * U);
      for (const x of [6.5, 19.5]) {
        g.fillStyle(COLORS.glassesFrame);
        g.fillCircle(x * U, 6 * U, 5.8 * U);
        g.fillStyle(COLORS.glassesLens);
        g.fillCircle(x * U, 6 * U, 4.8 * U);
        g.fillStyle(COLORS.glassesShine, 0.8);
        g.fillEllipse((x - 1.8) * U, 4.2 * U, 2.6 * U, 1.6 * U);
        g.fillCircle((x + 2) * U, 8 * U, 0.7 * U);
      }
    },
  },
  // An explorer's hat on top of the head, with a band and a shadow under the brim.
  hat: {
    width: 44,
    height: 20,
    anchor: [22, 14],
    offset: [0, 10],
    draw: (g) => {
      const edge = darker(COLORS.hat, 35);
      g.fillStyle(edge);
      g.fillEllipse(22 * U, 10 * U, 25.5 * U, 17.5 * U);
      g.fillEllipse(22 * U, 15 * U, 43.5 * U, 8.5 * U);
      g.fillStyle(COLORS.hat);
      g.fillEllipse(22 * U, 10 * U, 24 * U, 16 * U);
      g.fillEllipse(22 * U, 15 * U, 42 * U, 7 * U);
      g.fillStyle(darker(COLORS.hat, 15));
      g.fillEllipse(22 * U, 16.5 * U, 36 * U, 3 * U);
      g.fillStyle(lighter(COLORS.hat, 20));
      g.fillEllipse(17 * U, 6 * U, 7 * U, 5 * U);
      g.fillStyle(COLORS.hatBand);
      g.fillRect(11 * U, 11 * U, 22 * U, 3 * U);
    },
  },
  // A red sneaker with a white sole and laces, drawn pointing right (the left one is flipped).
  shoes: {
    width: 14,
    height: 9,
    anchor: [7, 4],
    offset: [0, 0],
    onFeet: true,
    draw: (g) => {
      g.fillStyle(darker(COLORS.shoe, 35));
      g.fillEllipse(7 * U, 4 * U, 14 * U, 8 * U);
      g.fillStyle(COLORS.shoe);
      g.fillEllipse(7 * U, 4 * U, 12.5 * U, 6.5 * U);
      g.fillStyle(darker(COLORS.shoeSole, 25));
      g.fillRect(0, 5.8 * U, 14 * U, 3 * U);
      g.fillStyle(COLORS.shoeSole);
      g.fillRect(0.5 * U, 6 * U, 13 * U, 2.3 * U);
      g.fillCircle(11 * U, 3 * U, 1.4 * U);
      for (const x of [5, 7, 9]) g.fillCircle(x * U, 2.2 * U, 0.6 * U);
    },
  },
  // A golden crown with gems and a shine.
  crown: {
    width: 30,
    height: 18,
    anchor: [15, 16],
    offset: [0, 10],
    draw: (g) => {
      const shape = (grow: number): void => {
        g.fillRect((3 - grow) * U, (10 - grow) * U, (24 + 2 * grow) * U, (7 + 2 * grow) * U);
        g.fillTriangle((3 - grow) * U, 11 * U, (9 + grow) * U, 11 * U, 4 * U, (1 - grow) * U);
        g.fillTriangle((11 - grow) * U, 11 * U, (19 + grow) * U, 11 * U, 15 * U, (0 - grow) * U);
        g.fillTriangle((21 - grow) * U, 11 * U, (27 + grow) * U, 11 * U, 26 * U, (1 - grow) * U);
      };
      g.fillStyle(darker(COLORS.crown, 35));
      shape(0.8);
      g.fillStyle(COLORS.crown);
      shape(0);
      g.fillStyle(lighter(COLORS.crown, 25));
      g.fillRect(4 * U, 11 * U, 22 * U, 1.5 * U);
      g.fillStyle(COLORS.crownGemRed);
      g.fillCircle(15 * U, 13.5 * U, 2 * U);
      g.fillStyle(COLORS.crownGemBlue);
      g.fillCircle(8 * U, 13.5 * U, 1.5 * U);
      g.fillCircle(22 * U, 13.5 * U, 1.5 * U);
      g.fillStyle(COLORS.glassesShine);
      g.fillCircle(14.3 * U, 12.8 * U, 0.6 * U);
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
type Side = 'left' | 'right';

interface Piece {
  id: string;
  image: Phaser.GameObjects.Image;
  drawing: ClothesDrawing;
  /** For shoes: which foot. */
  side?: Side;
}

/** The clothes the monkey wears. They follow it around, also when it hangs tilted. */
export class MonkeyClothes {
  private readonly pieces: Piece[];
  private worn: readonly string[] = [];

  constructor(scene: Phaser.Scene) {
    const image = (id: string, drawing: ClothesDrawing) =>
      scene.add
        .image(0, 0, clothesTexture(scene, id))
        .setOrigin(drawing.anchor[0] / drawing.width, drawing.anchor[1] / drawing.height)
        .setVisible(false);
    this.pieces = Object.entries(DRAWINGS).flatMap(([id, drawing]): Piece[] =>
      drawing.onFeet
        ? [
            { id, drawing, side: 'left', image: image(id, drawing).setFlipX(true) },
            { id, drawing, side: 'right', image: image(id, drawing) },
          ]
        : [{ id, drawing, image: image(id, drawing) }],
    );
  }

  setWorn(worn: readonly string[]): void {
    this.worn = worn;
  }

  /** Moves the clothes onto the monkey. `pose` tells where its feet are right now. */
  follow(monkey: Phaser.GameObjects.Image, pose: MonkeyPose): void {
    const cos = Math.cos(monkey.rotation);
    const sin = Math.sin(monkey.rotation);
    const feet = feetFromHands(pose);
    for (const { id, image, drawing, side } of this.pieces) {
      const [gx, gy] = side ? feet[side] : drawing.offset;
      const [ox, oy] = [gx * U, gy * U];
      image
        .setPosition(monkey.x + ox * cos - oy * sin, monkey.y + ox * sin + oy * cos)
        .setRotation(monkey.rotation)
        .setVisible(monkey.visible && this.worn.includes(id));
    }
  }
}
