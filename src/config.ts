/** Shared game constants. Tweak values here instead of inside scenes. */
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const COLORS = {
  background: 0x2e7d32,
  jungleShade: 0x1b5e20,
  sky: 0x81d4fa,
  cloud: 0xffffff,
  sun: 0xffeb3b,
  beak: 0xff9800,
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
  /** The sky is above this line, the jungle below it. */
  skyBottomY: 260,
  /** Bushy edge where the jungle meets the sky. */
  treeLineSpacing: 60,
  treeLineRadius: 45,
  /** Leafy roof at the very top, where the vines hang from. */
  canopySpacing: 50,
  canopyRadius: 36,
  sun: { x: 0.88, y: 100, radius: 36 },
  clouds: [
    { x: 0.2, y: 110, size: 1 },
    { x: 0.5, y: 80, size: 0.8 },
    { x: 0.7, y: 160, size: 1.2 },
  ],
  cloudPuffRadius: 22,
  shadeBlobs: [
    { x: 0.15, y: 0.75, radius: 120 },
    { x: 0.55, y: 0.9, radius: 160 },
    { x: 0.85, y: 0.6, radius: 110 },
    { x: 0.4, y: 0.55, radius: 90 },
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

/** Jungle sounds made by the computer. Frequencies in Hz, times in milliseconds. */
export const SOUND = {
  volume: 0.12,
  fadeMs: 10,
  maxPan: 0.8, // -1 = left speaker, 1 = right speaker
  callMinDelayMs: 700,
  callMaxDelayMs: 2500,
  birds: {
    hootChance: 0.3,
    tweet: { minNotes: 2, maxNotes: 5, minHz: 2200, maxHz: 3600, gapMs: 110, noteMs: 70 },
    hoot: { minHz: 380, maxHz: 520, gapMs: 350, noteMs: 260 },
  },
} as const;

/**
 * Colourful birds flying across the sky, only for decoration.
 * y in pixels from the top, speed in pixels per second, startX as a fraction of GAME_WIDTH.
 */
export const SKY_BIRDS = {
  width: 54,
  height: 36,
  gridWidth: 36,
  flapMs: 160,
  bobPixels: 6,
  bobPeriodMs: 1200,
  birds: [
    { color: 0xe53935, y: 70, speed: 90, direction: 1, startX: 0.1 },
    { color: 0x1e88e5, y: 135, speed: 60, direction: -1, startX: 0.6 },
    { color: 0xfdd835, y: 195, speed: 110, direction: 1, startX: 0.4 },
  ],
} as const;
