import Phaser from 'phaser';
import { COLORS, DAY_NIGHT, DEPTH, GAME_HEIGHT, GAME_WIDTH, JUNGLE } from '../config';

/** The sun, the night darkness, and the moon and stars. */
export interface SkyLights {
  sun: Phaser.GameObjects.Arc;
  shade: Phaser.GameObjects.Rectangle;
  night: Phaser.GameObjects.Container;
}

/**
 * Creates the day and night lights. Call it right after drawing the jungle,
 * so the sun is behind the vines, birds and the monkey.
 */
export function createSkyLights(scene: Phaser.Scene): SkyLights {
  const sun = scene.add.circle(
    JUNGLE.sun.x * GAME_WIDTH,
    JUNGLE.sun.y,
    JUNGLE.sun.radius,
    COLORS.sun,
  );

  // Darkens everything except the texts on top.
  const shade = scene.add
    .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.night, 0)
    .setOrigin(0)
    .setDepth(DEPTH.nightShade);

  // The moon and stars shine above the darkness.
  const { moon, stars, starRadius } = DAY_NIGHT;
  const g = scene.add.graphics();
  g.fillStyle(COLORS.star);
  for (const star of stars) g.fillCircle(star.x * GAME_WIDTH, star.y, starRadius);
  g.fillStyle(COLORS.moon);
  g.fillCircle(moon.x * GAME_WIDTH, moon.y, moon.radius);
  const night = scene.add.container(0, 0, [g]).setDepth(DEPTH.nightSky).setAlpha(0);

  return { sun, shade, night };
}

/** Shows how dark it is: 0 = day, 1 = night. */
export function setDarkness(lights: SkyLights, amount: number): void {
  lights.sun.setAlpha(1 - amount);
  lights.shade.setFillStyle(COLORS.night, amount * DAY_NIGHT.maxShade);
  lights.night.setAlpha(amount);
}
