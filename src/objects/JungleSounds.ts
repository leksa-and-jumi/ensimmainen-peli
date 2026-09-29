import Phaser from 'phaser';
import { SOUND } from '../config';
import { beepNotes } from '../logic/beeps';
import { birdCall, nextCallDelayMs, pickCallKind, type Chirp } from '../logic/birdCalls';

/**
 * Plays one note with a soft start and end, placed left or right by `pan`.
 * A sine wave sounds like a bird whistle, a square wave like a game beep.
 */
function playChirp(
  sound: Phaser.Sound.WebAudioSoundManager,
  chirp: Chirp,
  startAt: number,
  pan: number,
  volume: number = SOUND.volume,
  wave: OscillatorType = 'sine',
): void {
  const ctx = sound.context;
  const start = startAt + chirp.startMs / 1000;
  const end = start + chirp.durationMs / 1000;

  const osc = ctx.createOscillator();
  osc.type = wave;
  osc.frequency.setValueAtTime(chirp.fromHz, start);
  osc.frequency.exponentialRampToValueAtTime(chirp.toHz, end);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + SOUND.fadeMs / 1000);
  gain.gain.setValueAtTime(volume, end - SOUND.fadeMs / 1000);
  gain.gain.linearRampToValueAtTime(0, end);

  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;

  osc.connect(gain).connect(panner).connect(sound.destination);
  osc.start(start);
  osc.stop(end);
}

/**
 * Jungle sounds: birds tweet and hoot now and then, from different directions.
 * The sounds are made by the computer, so there are no sound files.
 * No new calls start while `isMuted()` is true.
 */
export function startJungleSounds(scene: Phaser.Scene, isMuted: () => boolean): void {
  const sound = scene.sound;
  if (!(sound instanceof Phaser.Sound.WebAudioSoundManager)) return;

  const callBird = (): void => {
    // Browsers keep sound paused until the player clicks or presses a key.
    if (sound.context.state === 'running' && !isMuted()) {
      const notes = birdCall(pickCallKind(SOUND.birds), SOUND.birds);
      const pan = Phaser.Math.FloatBetween(-SOUND.maxPan, SOUND.maxPan);
      for (const chirp of notes) playChirp(sound, chirp, sound.context.currentTime, pan);
    }
    scene.time.delayedCall(nextCallDelayMs(SOUND.callMinDelayMs, SOUND.callMaxDelayMs), callBird);
  };
  callBird();
}

/** Piip, piip, piiiip: played when the game is over. */
export function playGameOverBeeps(scene: Phaser.Scene): void {
  const sound = scene.sound;
  if (!(sound instanceof Phaser.Sound.WebAudioSoundManager)) return;
  if (sound.context.state !== 'running') return;
  const { volume, ...rules } = SOUND.gameOver;
  const now = sound.context.currentTime;
  for (const note of beepNotes(rules)) playChirp(sound, note, now, 0, volume, 'square');
}
