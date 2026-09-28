import Phaser from 'phaser';
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYER_SIZE,
  PLAYER_SPEED,
  POINTS_PER_STAR,
  STAR_SIZE,
} from '../config';
import { clamp, randomPosition } from '../logic/bounds';
import { addPoints, formatScore } from '../logic/score';
import { drawJungle } from '../objects/JungleBackground';
import { createMonkey } from '../objects/Monkey';

/**
 * Jungle scene: move the monkey with the arrow keys and collect stars.
 */
export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private star!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;

  constructor() {
    super('MainScene');
  }

  create(): void {
    drawJungle(this);
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
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 24, 'Liiku nuolinäppäimillä ja kerää tähtiä!', {
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

  update(_time: number, delta: number): void {
    const step = (PLAYER_SPEED * delta) / 1000;
    const half = PLAYER_SIZE / 2;

    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown) dx -= step;
    if (this.cursors.right.isDown) dx += step;
    if (this.cursors.up.isDown) dy -= step;
    if (this.cursors.down.isDown) dy += step;

    this.player.x = clamp(this.player.x + dx, half, GAME_WIDTH - half);
    this.player.y = clamp(this.player.y + dy, half, GAME_HEIGHT - half);

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

  private moveStar(): void {
    const { x, y } = randomPosition(GAME_WIDTH, GAME_HEIGHT, STAR_SIZE);
    this.star.setPosition(x, y);
  }
}
