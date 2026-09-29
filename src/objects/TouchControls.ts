import Phaser from 'phaser';
import { COLORS, DEPTH, GAME_HEIGHT, GAME_WIDTH, TOUCH } from '../config';

type Arrow = 'left' | 'right' | 'up';

/** Draws a round button with an arrow on it. */
function drawButton(g: Phaser.GameObjects.Graphics, arrow: Arrow): void {
  const r = TOUCH.buttonRadius;
  g.fillStyle(COLORS.touchButton, 1);
  g.fillCircle(0, 0, r);
  g.lineStyle(3, COLORS.touchArrow, 1);
  g.strokeCircle(0, 0, r);
  g.fillStyle(COLORS.touchArrow, 1);
  const a = r * 0.45;
  if (arrow === 'left') g.fillTriangle(-a, 0, a * 0.6, -a, a * 0.6, a);
  if (arrow === 'right') g.fillTriangle(a, 0, -a * 0.6, -a, -a * 0.6, a);
  if (arrow === 'up') g.fillTriangle(0, -a, -a, a * 0.6, a, a * 0.6);
}

/**
 * Buttons on the screen for phones and tablets: walk left, walk right and
 * jump. They are only shown on touch screens.
 */
export class TouchControls {
  /** Is the left or right button held down right now? */
  left = false;
  right = false;

  constructor(scene: Phaser.Scene, onJump: () => void) {
    // Allow walking and jumping at the same time (two fingers).
    scene.input.addPointer(2);
    const r = TOUCH.buttonRadius;
    const y = GAME_HEIGHT - TOUCH.margin - r;

    const button = (x: number, arrow: Arrow, onDown: () => void, onUp: () => void): void => {
      const g = scene.add
        .graphics({ x, y })
        .setDepth(DEPTH.hud)
        .setAlpha(TOUCH.alpha)
        .setInteractive(new Phaser.Geom.Circle(0, 0, r), Phaser.Geom.Circle.Contains);
      drawButton(g, arrow);
      g.on('pointerdown', () => {
        g.setAlpha(TOUCH.pressedAlpha);
        onDown();
      });
      const release = (): void => {
        g.setAlpha(TOUCH.alpha);
        onUp();
      };
      g.on('pointerup', release);
      g.on('pointerout', release);
    };

    const leftX = TOUCH.margin + r;
    button(
      leftX,
      'left',
      () => (this.left = true),
      () => (this.left = false),
    );
    button(
      leftX + 2 * r + TOUCH.gap,
      'right',
      () => (this.right = true),
      () => (this.right = false),
    );
    button(GAME_WIDTH - TOUCH.margin - r, 'up', onJump, () => undefined);
  }
}

/** True on phones and tablets, where the game needs buttons on the screen. */
export function isTouchScreen(scene: Phaser.Scene): boolean {
  return scene.sys.game.device.input.touch;
}
