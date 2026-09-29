/** Shared game constants. Tweak values here instead of inside scenes. */
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const COLORS = {
  background: 0x2e7d32,
  jungleShade: 0x1b5e20,
  sky: 0x81d4fa,
  cloud: 0xffffff,
  sun: 0xffeb3b,
  night: 0x0d1b3e,
  moon: 0xfff9c4,
  heart: 0xe53935,
  heartLost: 0x9e9e9e,
  star: 0xffffff,
  beak: 0xff9800,
  leaf: 0x43a047,
  leafLight: 0x66bb6a,
  trunk: 0x6d4c41,
  vine: 0x558b2f,
  monkeyFur: 0x8d5524,
  monkeyFace: 0xf1c27d,
  monkeyEye: 0x000000,
  monkeyEyeWhite: 0xffffff,
  monkeyCheek: 0xf48fb1,
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
  farHills: 0x80b9a4,
  farHillsLight: 0x9ccbb6,
  fallingLeaf: 0x7cb342,
  fallingLeafVein: 0x558b2f,
  hat: 0xd7b56d,
  hatBand: 0x5d4037,
  glassesFrame: 0x000000,
  glassesLens: 0x263238,
  glassesShine: 0xffffff,
  crown: 0xffc107,
  crownGemRed: 0xe53935,
  crownGemBlue: 0x1e88e5,
  bowtie: 0xe91e63,
  bowtieKnot: 0xad1457,
  scarf: 0x1e88e5,
  scarfStripe: 0xffffff,
  shoe: 0xe53935,
  shoeSole: 0xffffff,
  shopPanel: 0x1b5e20,
  shopBorder: 0xffd54f,
  shopButton: '#ffd54f',
  shopDisabled: '#9e9e9e',
} as const;

export const PLAYER_WIDTH = 56;
export const PLAYER_SPEED = 300; // pixels per second

/**
 * How the monkey is drawn: every part gets a dark edge `outline` grid units
 * wide, made `shade` percent darker than the fur, like in a cartoon.
 */
export const MONKEY_LOOK = {
  outline: 1.6,
  shade: 30,
} as const;

/** How fast the monkey's arms and legs move, in milliseconds per picture. */
export const MONKEY_ANIMATION = {
  stepMs: 140,
  kickMs: 300,
} as const;

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
  /** How far behind the swing the middle of the vine lags, in seconds. Bigger = floppier. */
  bendLagSeconds: 0.25,
  /** Rubber band: how much the vine stretches with the monkey on it, in pixels. */
  hangStretch: 30,
  springStiffness: 120,
  springDamping: 6,
  /** Extra downward bounce when the monkey grabs the vine, in pixels per second. */
  grabBounceSpeed: 250,
  curvePoints: 16,
  /** Where the small leaves grow along the vine (0 = top, 1 = tip). */
  leafSpots: [0.3, 0.5, 0.7],
} as const;

/**
 * Lions and snakes come now and then and walk across the ground.
 * After leaving they stay away for a random time between awayMinMs and awayMaxMs.
 * Sizes in pixels, speeds in pixels per second.
 * `gridWidth` is the width of the grid the drawing uses.
 * While walking they switch between `frames` pictures, one every `frameMs`.
 */
export const ENEMIES = {
  lion: {
    width: 96,
    height: 67,
    gridWidth: 80,
    speed: 120,
    awayMinMs: 3000,
    awayMaxMs: 8000,
    frames: 2,
    frameMs: 200,
  },
  snake: {
    width: 86,
    height: 34,
    gridWidth: 72,
    speed: 70,
    awayMinMs: 2000,
    awayMaxMs: 6000,
    frames: 4,
    frameMs: 130,
  },
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
  /** Piip, piip, piiiip when the game is over. A square wave sounds like a game beep. */
  gameOver: {
    volume: 0.08,
    count: 3,
    firstHz: 880,
    stepRatio: 0.75,
    beepMs: 160,
    gapMs: 260,
    lastBeepMs: 450,
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
    { color: 0xe53935, y: 100, speed: 90, direction: 1, startX: 0.1 },
    { color: 0x1e88e5, y: 135, speed: 60, direction: -1, startX: 0.6 },
    { color: 0xfdd835, y: 195, speed: 110, direction: 1, startX: 0.4 },
  ],
} as const;

/**
 * Day and night. One whole day (day, dusk, night, dawn) takes cycleMs.
 * Dusk and dawn each take fadeFraction of it. At night the screen is covered
 * with the night colour at maxShade strength. Moon and star x are fractions of GAME_WIDTH.
 */
export const DAY_NIGHT = {
  cycleMs: 100000, // day and night about 40 s each
  fadeFraction: 0.1,
  maxShade: 0.6,
  moon: { x: 0.12, y: 110, radius: 26 },
  starRadius: 2,
  /** Keep stars above the hills: the night has holes where they are. */
  stars: [
    { x: 0.3, y: 60 },
    { x: 0.38, y: 135 },
    { x: 0.47, y: 45 },
    { x: 0.56, y: 120 },
    { x: 0.64, y: 70 },
    { x: 0.73, y: 130 },
    { x: 0.8, y: 55 },
    { x: 0.92, y: 125 },
    { x: 0.22, y: 140 },
    { x: 0.05, y: 140 },
  ],
} as const;

/**
 * Drawing order (bigger = more on top). The background is in layers from far
 * to near; the monkey, vines, fruit, animals and sky birds are at 0.
 */
export const DEPTH = {
  sky: -40,
  /** Sun, clouds, moon and stars: far away, behind everything else. */
  skyLights: -35,
  farLayer: -30,
  midLayer: -20,
  nearLayer: -10,
  /** The leafy roof and the ground stay still in front of the layers. */
  frame: -5,
  fallingLeaves: -4,
  nightShade: 10,
  hud: 20,
  shop: 25,
  gameOver: 30,
} as const;

/**
 * Three background layers slide sideways a little when the monkey moves.
 * Near layers slide more than far ones (factor = how much of the monkey's
 * distance from the middle). `margin` is how much wider than the screen the
 * layers are drawn, so their edges never show.
 */
export const PARALLAX = {
  farFactor: 0.02,
  midFactor: 0.05,
  nearFactor: 0.1,
  margin: 60,
  /** Misty hills far away: circles whose tops peek above the tree line. */
  hills: [
    { x: 0.05, y: 330, radius: 170 },
    { x: 0.35, y: 320, radius: 150 },
    { x: 0.6, y: 340, radius: 190 },
    { x: 0.92, y: 325, radius: 160 },
  ],
} as const;

/**
 * Leaves falling from the big trees and the leafy roof. In a gust
 * `burstCount` leaves come off the trees at once; in calm weather a single
 * leaf falls about `calmPerSecond` times a second. The wind carries them sideways.
 */
export const LEAVES = {
  count: 16,
  width: 14,
  height: 8,
  fallSpeed: 45,
  swayPixels: 18,
  swayPeriodMs: 2200,
  spread: 60,
  windDrift: 70,
  burstCount: 5,
  calmPerSecond: 0.3,
  /** Leaves also fall from the leafy roof at this height, at these x fractions. */
  canopyY: 24,
  canopySpots: [0.15, 0.4, 0.65, 0.9],
} as const;

/**
 * The wind: 0 = calm, 1 = strongest. It is `base` plus slow waves of
 * different lengths, so it keeps changing; when the waves peak together the
 * wind goes past `gustLimit` and there is a gust. The near trees lean up to
 * `leanPixels` with the wind (blowing to the right) and flutter a little.
 */
export const WIND = {
  base: 0.3,
  waves: [
    { amplitude: 0.25, periodMs: 9000, phase: 0 },
    { amplitude: 0.15, periodMs: 4100, phase: 1.3 },
    { amplitude: 0.08, periodMs: 1700, phase: 0.4 },
  ],
  gustLimit: 0.62,
  leanPixels: 16,
  flutterPixels: 3,
  flutterMs: 650,
  /** Trunk drawn as a bent line with this many points. */
  trunkPoints: 8,
} as const;

/**
 * The monkey's lives, shown as hearts under the score.
 * After a hit the monkey blinks and can't be hit again for protectMs.
 */
export const LIVES = {
  start: 4,
  protectMs: 2000,
  blinkMs: 120,
  heartSize: 26,
  heartGap: 6,
  heartsX: 16,
  heartsY: 50,
} as const;

/**
 * The shop. Things are bought with game points, never with real money.
 * Clothes stay bought (also in the next game); a life fills an empty heart.
 */
export const SHOP = {
  items: [
    { id: 'hat', name: 'Hattu', price: 5, kind: 'clothes' },
    { id: 'bowtie', name: 'Rusetti', price: 6, kind: 'clothes' },
    { id: 'scarf', name: 'Huivi', price: 7, kind: 'clothes' },
    { id: 'glasses', name: 'Aurinkolasit', price: 8, kind: 'clothes' },
    { id: 'crown', name: 'Kruunu', price: 15, kind: 'clothes' },
    { id: 'shoes', name: 'Kengät', price: 6, kind: 'clothes' },
    { id: 'life', name: 'Elämä', price: 10, kind: 'life' },
    { id: 'brown', name: 'Ruskea', price: 0, kind: 'color' },
    { id: 'pink', name: 'Pinkki', price: 10, kind: 'color' },
    { id: 'blue', name: 'Sininen', price: 10, kind: 'color' },
    { id: 'black', name: 'Musta', price: 12, kind: 'color' },
    { id: 'rainbow', name: 'Sateenkaari', price: 25, kind: 'color' },
  ],
  /** Clothes and lives on the left, monkey colours on the right. */
  panelWidth: 760,
  /** Room for the title, points and column titles above the items, and the close button below. */
  headerHeight: 110,
  footerHeight: 55,
  panelAlpha: 0.95,
  rowHeight: 50,
  iconSize: 32,
  /** Where bought clothes are remembered in this browser. */
  saveKey: 'ensimmainen-peli:vaatteet',
} as const;

/** The same fur colour on every part of the monkey. */
const solidFur = (color: number) =>
  ({ tail: color, legs: color, body: color, ears: color, arms: color, head: color }) as const;

/** Monkey colours from the shop. Each one gives a colour to every part of the fur. */
export const MONKEY_COLORS = {
  brown: solidFur(COLORS.monkeyFur),
  pink: solidFur(0xf06292),
  blue: solidFur(0x42a5f5),
  black: solidFur(0x303030),
  rainbow: {
    tail: 0xe53935,
    legs: 0xfb8c00,
    body: 0xfdd835,
    arms: 0x43a047,
    ears: 0x1e88e5,
    head: 0x8e24aa,
  },
} as const;

export type MonkeyColor = keyof typeof MONKEY_COLORS;
export const DEFAULT_MONKEY_COLOR: MonkeyColor = 'brown';
