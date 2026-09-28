import Phaser from 'phaser';
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  JUNGLE,
  PLAYER_SPEED,
  PHYSICS,
  GROUND_Y,
  FRUIT_TOP_Y,
  FRUIT_SIZE,
  POINTS_PER_FRUIT,
  VINE,
} from '../config';
import { randomPosition } from '../logic/bounds';
import { stepBody, velocityBetween, type Area } from '../logic/physics';
import { addPoints, formatScore } from '../logic/score';
import { approach, findGrabbableVine, swingAngle, vineTip, type VineShape } from '../logic/vine';
import { drawJungle } from '../objects/JungleBackground';
import { createFruit } from '../objects/Fruit';
import { createMonkey } from '../objects/Monkey';
import { createVine } from '../objects/Vine';

interface SwingingVine {
  shape: VineShape;
  container: Phaser.GameObjects.Container;
  amplitude: number;
  phase: number;
  tip: { x: number; y: number };
}

const HINT = '← → liiku.  ↑ tai välilyönti: hyppää!  Hyppää liaaniin roikkumaan.';

/**
 * Jungle scene: the monkey walks and jumps with gravity and collects fruit.
 * It grabs a vine by touching its tip and jumps off with up or space,
 * keeping the speed of the swing.
 */
export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private fruits: Phaser.GameObjects.Image[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private vines: SwingingVine[] = [];
  /** The vine the monkey hangs on, or null. */
  private hangingOn: SwingingVine | null = null;
  /** Vine the monkey just let go of; it can't be grabbed again right away. */
  private releasedFrom: SwingingVine | null = null;
  private vx = 0;
  private vy = 0;
  private onGround = false;
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
    this.player = createMonkey(this, GAME_WIDTH / 2, GROUND_Y / 2);
    this.fruits = [createFruit(this, 'banana'), createFruit(this, 'apple')];
    for (const fruit of this.fruits) this.moveFruit(fruit);

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
      this.move(delta);
      this.tryGrabVine();
    } else {
      this.hang(this.hangingOn, delta);
    }

    const playerBounds = this.player.getBounds();
    for (const fruit of this.fruits) {
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, fruit.getBounds())) {
        this.score = addPoints(this.score, POINTS_PER_FRUIT);
        this.scoreText.setText(formatScore(this.score));
        this.moveFruit(fruit);
      }
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

  private jumpPressed(): boolean {
    return (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space)
    );
  }

  private hang(vine: SwingingVine, delta: number): void {
    // The monkey's origin is at its hands, so it holds on to the tip.
    const velocity = velocityBetween(this.player, vine.tip, delta / 1000);
    this.player.setPosition(vine.tip.x, vine.tip.y);
    this.player.rotation = vine.container.rotation;

    if (this.jumpPressed()) {
      // Fly off with the speed of the swing, plus a little jump.
      this.vx = velocity.vx;
      this.vy = velocity.vy - PHYSICS.vineJumpSpeed;
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

  private move(delta: number): void {
    const wantsJump = this.jumpPressed();
    let direction = 0;
    if (this.cursors.left.isDown) direction -= 1;
    if (this.cursors.right.isDown) direction += 1;

    if (this.onGround) {
      this.vx = direction * PLAYER_SPEED;
      if (wantsJump) this.vy = -PHYSICS.jumpSpeed;
    } else if (direction !== 0) {
      // Steer in the air, but keep the speed from a vine swing.
      this.vx = direction * Math.max(PLAYER_SPEED, Math.abs(this.vx));
    }

    const next = stepBody(
      { x: this.player.x, y: this.player.y, vx: this.vx, vy: this.vy, onGround: this.onGround },
      delta / 1000,
      PHYSICS.gravity,
      this.playerArea(),
    );
    this.player.setPosition(next.x, next.y);
    this.vy = next.vy;
    this.onGround = next.onGround;
    if (this.onGround && direction === 0) this.vx = 0;
  }

  /** Where the monkey's hands may be so that its whole body stays on screen. */
  private playerArea(): Area {
    const { width, height, displayOriginX, displayOriginY } = this.player;
    return {
      minX: displayOriginX,
      maxX: GAME_WIDTH - (width - displayOriginX),
      minY: displayOriginY,
      maxY: GROUND_Y - (height - displayOriginY),
    };
  }

  private moveFruit(fruit: Phaser.GameObjects.Image): void {
    const { x, y } = randomPosition(GAME_WIDTH, GROUND_Y - FRUIT_TOP_Y, FRUIT_SIZE);
    fruit.setPosition(x, y + FRUIT_TOP_Y);
  }
}
