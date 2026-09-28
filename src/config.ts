/** Shared game constants. Tweak values here instead of inside scenes. */
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const COLORS = {
  background: 0x2e7d32,
  jungleShade: 0x1b5e20,
  leaf: 0x43a047,
  leafLight: 0x66bb6a,
  trunk: 0x6d4c41,
  vine: 0x558b2f,
  monkeyFur: 0x8d5524,
  monkeyFace: 0xf1c27d,
  monkeyEye: 0x000000,
  banana: 0xffe135,
  bananaTip: 0x5d4037,
  apple: 0xe53935,
  appleShine: 0xff8a80,
  appleStem: 0x5d4037,
  appleLeaf: 0x7cb342,
  text: '#ffffff',
  textShadow: '#1b5e20',
  ground: 0x4e342e,
  lionBody: 0xe0a040,
  lionMane: 0x8d4a1d,
  snakeBody: 0xc0ca33,
  snakeSpots: 0x33691e,
  snakeTongue: 0xe53935,
  enemyEye: 0x000000,
  gameOverOverlay: 0x000000,
  groundGrass: 0x33691e,
} as const;

export const PLAYER_WIDTH = 56;
export const PLAYER_SPEED = 300; // pixels per second

/** Gravity and jumping. Speeds are pixels per second. */
export const PHYSICS = {
  gravity: 1500,
  jumpSpeed: 800,
  /** Extra upward push when jumping off a vine. */
  vineJumpSpeed: 650,
} as const;

/** The ground is a strip at the bottom of the screen. */
export const GROUND_HEIGHT = 50;
export const GROUND_Y = GAME_HEIGHT - GROUND_HEIGHT;
export const GRASS_HEIGHT = 8;

export const FRUIT_SIZE = 40;
export const POINTS_PER_FRUIT = 1;
/** Fruit never appears higher than this, so the monkey can reach it. */
export const FRUIT_TOP_Y = 110;

/** Jungle decoration layout. x positions are fractions of GAME_WIDTH. */
export const JUNGLE = {
  shadeBlobs: [
    { x: 0.15, y: 0.75, radius: 120 },
    { x: 0.55, y: 0.9, radius: 160 },
    { x: 0.85, y: 0.6, radius: 110 },
    { x: 0.4, y: 0.35, radius: 90 },
  ],
  trees: [
    { x: 0.05, height: 260 },
    { x: 0.3, height: 180 },
    { x: 0.72, height: 220 },
    { x: 0.96, height: 300 },
  ],
  trunkWidth: 26,
  leafRadius: 46,
  vines: [
    { x: 0.18, length: 290 },
    { x: 0.46, length: 270 },
    { x: 0.62, length: 320 },
    { x: 0.86, length: 300 },
  ],
  vineWidth: 5,
} as const;

/** Vine swinging and grabbing. Angles are in degrees. */
export const VINE = {
  swingDegrees: 6,
  hangSwingDegrees: 30,
  periodMs: 2400,
  swingChangeDegreesPerSecond: 20,
  grabRadius: 30,
  phaseStep: 1.3, // radians between neighbouring vines
} as const;

/**
 * Lions and snakes come now and then and walk across the ground.
 * After leaving they stay away for a random time between awayMinMs and awayMaxMs.
 * Sizes in pixels, speeds in pixels per second.
 * `gridWidth` is the width of the grid the drawing uses.
 */
export const ENEMIES = {
  lion: { width: 96, height: 67, gridWidth: 80, speed: 120, awayMinMs: 3000, awayMaxMs: 8000 },
  snake: { width: 86, height: 34, gridWidth: 72, speed: 70, awayMinMs: 2000, awayMaxMs: 6000 },
} as const;

/** Enemy hit boxes are this many pixels smaller on each side, to be fair. */
export const ENEMY_HITBOX_INSET = 10;

export const GAME_OVER_OVERLAY_ALPHA = 0.6;
