import Phaser from 'phaser';
import { COLORS, DAY_NIGHT, DEPTH, GAME_HEIGHT, GAME_WIDTH, JUNGLE } from '../config';

/** The sun and clouds, the night darkness, and the moon and stars. */
export interface SkyLights {
  sun: Phaser.GameObjects.Arc;
  clouds: Phaser.GameObjects.Graphics;
  shade: Phaser.GameObjects.Rectangle;
  night: Phaser.GameObjects.Graphics;
}

/** Draws the moon and stars. Used both for the picture and for the hole in the darkness. */
function drawMoonAndStars(g: Phaser.GameObjects.Graphics): void {
  const { moon, stars, starRadius } = DAY_NIGHT;
  g.fillStyle(COLORS.star);
  for (const star of stars) g.fillCircle(star.x * GAME_WIDTH, star.y, starRadius);
  g.fillStyle(COLORS.moon);
  g.fillCircle(moon.x * GAME_WIDTH, moon.y, moon.radius);
}

/**
 * Creates the day and night lights. The sun, clouds, moon and stars are far
 * away in the sky, so everything else (hills, trees, vines…) is in front of them.
 */
export function createSkyLights(scene: Phaser.Scene): SkyLights {
  const sun = scene.add
    .circle(JUNGLE.sun.x * GAME_WIDTH, JUNGLE.sun.y, JUNGLE.sun.radius, COLORS.sun)
    .setDepth(DEPTH.skyLights);

  const clouds = scene.add.graphics().setDepth(DEPTH.skyLights);
  clouds.fillStyle(COLORS.cloud);
  for (const cloud of JUNGLE.clouds) {
    const x = cloud.x * GAME_WIDTH;
    const r = JUNGLE.cloudPuffRadius * cloud.size;
    clouds.fillCircle(x - r, cloud.y, r * 0.8);
    clouds.fillCircle(x, cloud.y - r * 0.4, r);
    clouds.fillCircle(x + r, cloud.y, r * 0.8);
    clouds.fillRect(x - r, cloud.y, r * 2, r * 0.8);
  }

  const night = scene.add.graphics().setDepth(DEPTH.skyLights).setAlpha(0);
  drawMoonAndStars(night);

  // The night darkens everything except the texts on top. It has holes where
  // the moon and stars are, so they still shine brightly from far away.
  const holes = scene.make.graphics({}, false);
  drawMoonAndStars(holes);
  const mask = holes.createGeometryMask().setInvertAlpha(true);
  const shade = scene.add
    .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.night, 0)
    .setOrigin(0)
    .setDepth(DEPTH.nightShade)
    .setMask(mask);

  return { sun, clouds, shade, night };
}

/** Shows how dark it is: 0 = day, 1 = night. */
export function setDarkness(lights: SkyLights, amount: number): void {
  // The sun and clouds are gone at night.
  lights.sun.setAlpha(1 - amount);
  lights.clouds.setAlpha(1 - amount);
  lights.shade.setFillStyle(COLORS.night, amount * DAY_NIGHT.maxShade);
  lights.night.setAlpha(amount);
}
