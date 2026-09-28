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
  star: 0xffd54f,
  text: '#ffffff',
  textShadow: '#1b5e20',
} as const;

export const PLAYER_WIDTH = 56;
export const PLAYER_SPEED = 300; // pixels per second

export const STAR_SIZE = 20;
export const POINTS_PER_STAR = 1;

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
    { x: 0.18, length: 140 },
    { x: 0.46, length: 90 },
    { x: 0.62, length: 170 },
    { x: 0.86, length: 120 },
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
