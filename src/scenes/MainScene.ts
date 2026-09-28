import Phaser from 'phaser';
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  JUNGLE,
  PLAYER_SPEED,
  POINTS_PER_STAR,
  STAR_SIZE,
  VINE,
} from '../config';
import { clamp, randomPosition } from '../logic/bounds';
import { addPoints, formatScore } from '../logic/score';
import { approach, findGrabbableVine, swingAngle, vineTip, type VineShape } from '../logic/vine';
import { drawJungle } from '../objects/JungleBackground';
import { createMonkey } from '../objects/Monkey';
import { createVine } from '../objects/Vine';

interface SwingingVine {
  shape: VineShape;
  container: Phaser.GameObjects.Container;
  amplitude: number;
  phase: number;
  tip: { x: number; y: number };
}

const HINT = 'Nuolet: liiku. Liaanin pää: roiku! Välilyönti: hyppää irti.';

/**
 * Jungle scene: move the monkey with the arrow keys and collect stars.
 * The monkey grabs a vine by touching its tip and lets go with space.
 */
export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private star!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private vines: SwingingVine[] = [];
  /** The vine the monkey hangs on, or null. */
  private hangingOn: SwingingVine | null = null;
  /** Vine the monkey just let go of; it can't be grabbed again right away. */
  private releasedFrom: SwingingVine | null = null;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;

  constructor() {
    super('MainScene');
  }

  create(): void {
    drawJungle(this);
    this.vines = JUNGLE.vines.map((v, i) => {
      const shape = { anchorX: v.x * GAME_WIDTH, length: v.length };
      return {
        shape,
        container: createVine(this, shape),
        amplitude: Phaser.Math.DegToRad(VINE.swingDegrees),
        phase: i * VINE.phaseStep,
        tip: vineTip(shape, 0),
      };
    });
    this.player = createMonkey(this, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.star = this.add.rectangle(0, 0, STAR_SIZE, STAR_SIZE, COLORS.star);
    this.moveStar();

    this.scoreText = this.add.text(16, 16, formatScore(this.score), {
      fontSize: '24px',
      color: COLORS.text,
      stroke: COLORS.textShadow,
      strokeThickness: 4,
    });
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 24, HINT, {
        fontSize: '18px',
        color: COLORS.text,
        stroke: COLORS.textShadow,
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is not available');
    }
    this.cursors = keyboard.createCursorKeys();
  }

  update(time: number, delta: number): void {
    this.swingVines(time, delta);

    if (this.hangingOn === null) {
      this.walk(delta);
      this.tryGrabVine();
    } else {
      this.hang(this.hangingOn);
    }

    const touching = Phaser.Geom.Intersects.RectangleToRectangle(
      this.player.getBounds(),
      this.star.getBounds(),
    );
    if (touching) {
      this.score = addPoints(this.score, POINTS_PER_STAR);
      this.scoreText.setText(formatScore(this.score));
      this.moveStar();
    }
  }

  private swingVines(time: number, delta: number): void {
    const maxChange = Phaser.Math.DegToRad(VINE.swingChangeDegreesPerSecond) * (delta / 1000);
    for (const vine of this.vines) {
      const targetDegrees = vine === this.hangingOn ? VINE.hangSwingDegrees : VINE.swingDegrees;
      vine.amplitude = approach(vine.amplitude, Phaser.Math.DegToRad(targetDegrees), maxChange);
      const angle = swingAngle(time, vine.amplitude, VINE.periodMs, vine.phase);
      vine.container.rotation = angle;
      vine.tip = vineTip(vine.shape, angle);
    }
  }

  private hang(vine: SwingingVine): void {
    const angle = vine.container.rotation;
    // The monkey's origin is at its hands, so it holds on to the tip.
    this.player.setPosition(vine.tip.x, vine.tip.y);
    this.player.rotation = angle;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.hangingOn = null;
      this.releasedFrom = vine;
      this.player.rotation = 0;
    }
  }

  private tryGrabVine(): void {
    const tips = this.vines.map((vine) => vine.tip);
    const ignore = this.releasedFrom ? this.vines.indexOf(this.releasedFrom) : null;
    const index = findGrabbableVine(this.player, tips, VINE.grabRadius, ignore);
    if (index !== null) {
      this.hangingOn = this.vines[index] ?? null;
      return;
    }
    if (this.releasedFrom) {
      const { x, y } = this.releasedFrom.tip;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
      if (distance > VINE.grabRadius) this.releasedFrom = null;
    }
  }

  private walk(delta: number): void {
    const step = (PLAYER_SPEED * delta) / 1000;
    const { width, height, displayOriginX, displayOriginY } = this.player;

    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown) dx -= step;
    if (this.cursors.right.isDown) dx += step;
    if (this.cursors.up.isDown) dy -= step;
    if (this.cursors.down.isDown) dy += step;

    this.player.x = clamp(
      this.player.x + dx,
      displayOriginX,
      GAME_WIDTH - (width - displayOriginX),
    );
    this.player.y = clamp(
      this.player.y + dy,
      displayOriginY,
      GAME_HEIGHT - (height - displayOriginY),
    );
  }

  private moveStar(): void {
    const { x, y } = randomPosition(GAME_WIDTH, GAME_HEIGHT, STAR_SIZE);
    this.star.setPosition(x, y);
  }
}
