import Phaser from 'phaser';
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  JUNGLE,
  PLAYER_SPEED,
  ENEMIES,
  ENEMY_HITBOX_INSET,
  GAME_OVER_OVERLAY_ALPHA,
  PHYSICS,
  GROUND_Y,
  FRUIT_TOP_Y,
  FRUIT_SIZE,
  POINTS_PER_FRUIT,
  VINE,
} from '../config';
import { randomPosition } from '../logic/bounds';
import { awayTime, stepVisitor, type Visitor, type VisitorRules } from '../logic/visitor';
import { stepBody, velocityBetween, type Area } from '../logic/physics';
import { addPoints, formatScore } from '../logic/score';
import { approach, findGrabbableVine, swingAngle, vineTip, type VineShape } from '../logic/vine';
import { createEnemy, type EnemyKind } from '../objects/Enemies';
import { drawJungle } from '../objects/JungleBackground';
import { startJungleSounds } from '../objects/JungleSounds';
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

interface Enemy {
  kind: EnemyKind;
  image: Phaser.GameObjects.Image;
  rules: VisitorRules;
  visitor: Visitor;
}

const HINT = '← → liiku.  ↑ tai välilyönti: hyppää!  Varo leijonaa ja käärmettä!';
const MUTED_KEY = 'muted';
const ENEMY_KINDS: readonly EnemyKind[] = ['lion', 'snake'];

/**
 * Jungle scene: the monkey walks and jumps with gravity and collects fruit.
 * It grabs a vine by touching its tip and jumps off with up or space,
 * keeping the speed of the swing. Touching a lion or a snake ends the game.
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
  private enemies: Enemy[] = [];
  private gameOver = false;
  /** Set by a jump key press, used up by the next frame. */
  private jumpQueued = false;

  constructor() {
    super('MainScene');
  }

  /** Runs before every create(), also when the game restarts. */
  init(): void {
    this.hangingOn = null;
    this.releasedFrom = null;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.score = 0;
    this.gameOver = false;
    this.jumpQueued = false;
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
    this.enemies = ENEMY_KINDS.map((kind) => {
      const { width, height, speed, awayMinMs, awayMaxMs } = ENEMIES[kind];
      const image = createEnemy(this, kind).setVisible(false);
      image.y = GROUND_Y - height / 2;
      const rules = {
        speed,
        awayMinMs,
        awayMaxMs,
        leftX: -width / 2,
        rightX: GAME_WIDTH + width / 2,
      };
      // Everyone starts away, so the monkey gets a calm start.
      return { kind, image, rules, visitor: { phase: 'away', timeLeftMs: awayTime(rules) } };
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
    // Listen to key presses directly, so even a very quick tap is noticed.
    const queueJump = (event: KeyboardEvent): void => {
      if (!event.repeat) this.jumpQueued = true;
    };
    keyboard.on('keydown-UP', queueJump);
    keyboard.on('keydown-SPACE', queueJump);

    // Kept in the game registry, so the choice stays when the game restarts.
    const isMuted = (): boolean => this.registry.get(MUTED_KEY) === true;
    startJungleSounds(this, isMuted);
    const soundText = this.add
      .text(GAME_WIDTH - 16, 16, '', {
        fontSize: '20px',
        color: COLORS.text,
        stroke: COLORS.textShadow,
        strokeThickness: 4,
      })
      .setOrigin(1, 0);
    const showSound = (): void => {
      soundText.setText(isMuted() ? 'M: äänet päälle' : 'M: äänet pois');
    };
    showSound();
    keyboard.on('keydown-M', (event: KeyboardEvent) => {
      if (event.repeat) return;
      this.registry.set(MUTED_KEY, !isMuted());
      showSound();
    });
  }

  update(time: number, delta: number): void {
    if (this.gameOver) {
      if (this.jumpPressed()) this.scene.restart();
      return;
    }

    this.swingVines(time, delta);
    this.moveEnemies(delta);

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

    const visible = this.enemies.filter((enemy) => enemy.image.visible);
    if (visible.some((enemy) => this.touches(playerBounds, enemy))) {
      this.showGameOver();
    }
  }

  private moveEnemies(delta: number): void {
    for (const enemy of this.enemies) {
      enemy.visitor = stepVisitor(enemy.visitor, delta, enemy.rules);
      const walking = enemy.visitor.phase === 'walking';
      enemy.image.setVisible(walking);
      if (enemy.visitor.phase === 'walking') {
        enemy.image.x = enemy.visitor.x;
        // Drawings face right, so flip them when walking left.
        enemy.image.setFlipX(enemy.visitor.direction < 0);
      }
    }
  }

  private touches(playerBounds: Phaser.Geom.Rectangle, enemy: Enemy): boolean {
    const hitbox = enemy.image.getBounds();
    Phaser.Geom.Rectangle.Inflate(hitbox, -ENEMY_HITBOX_INSET, -ENEMY_HITBOX_INSET);
    return Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, hitbox);
  }

  private showGameOver(): void {
    this.gameOver = true;
    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.gameOverOverlay, GAME_OVER_OVERLAY_ALPHA)
      .setOrigin(0);
    const lines = [
      { text: 'Voi ei! Apina jäi kiinni!', size: '48px', y: GAME_HEIGHT / 2 - 60 },
      { text: formatScore(this.score), size: '32px', y: GAME_HEIGHT / 2 },
      { text: 'Paina välilyöntiä, niin pelaat uudestaan.', size: '22px', y: GAME_HEIGHT / 2 + 60 },
    ];
    for (const line of lines) {
      this.add
        .text(GAME_WIDTH / 2, line.y, line.text, {
          fontSize: line.size,
          color: COLORS.text,
          stroke: COLORS.textShadow,
          strokeThickness: 5,
        })
        .setOrigin(0.5);
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
    const pressed = this.jumpQueued;
    this.jumpQueued = false;
    return pressed;
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
