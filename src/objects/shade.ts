import Phaser from 'phaser';

/** A darker version of a colour, for outlines and shadows (`amount` in percent). */
export function darker(color: number, amount = 30): number {
  return Phaser.Display.Color.ValueToColor(color).darken(amount).color;
}

/** A lighter version of a colour, for bellies and shiny spots (`amount` in percent). */
export function lighter(color: number, amount = 30): number {
  return Phaser.Display.Color.ValueToColor(color).lighten(amount).color;
}
