import { SHOP } from '../config';

export interface SavedClothes {
  owned: string[];
  worn: string[];
}

const EMPTY: SavedClothes = { owned: [], worn: [] };

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === 'string');

/**
 * Reads the bought clothes from this browser, so they are still there next
 * time. If the browser doesn't allow saving, the game just starts without them.
 */
export function loadClothes(): SavedClothes {
  try {
    const raw = window.localStorage.getItem(SHOP.saveKey);
    if (!raw) return EMPTY;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return EMPTY;
    const { owned, worn } = data as Record<string, unknown>;
    return isStringList(owned) && isStringList(worn) ? { owned, worn } : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Remembers the bought clothes in this browser. Does nothing if saving isn't allowed. */
export function saveClothes(clothes: SavedClothes): void {
  try {
    window.localStorage.setItem(SHOP.saveKey, JSON.stringify(clothes));
  } catch {
    // Saving is only a nice extra; the game works without it.
  }
}
