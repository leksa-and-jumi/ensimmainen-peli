/**
 * Clothes are kept and can be put on and off; a life is used right away;
 * a colour is kept and the monkey wears one colour at a time.
 */
export type ShopItemKind = 'clothes' | 'life' | 'color';

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  kind: ShopItemKind;
}

/** Everything the shop needs to know about the player. Prices are in game points. */
export interface Wallet {
  score: number;
  lives: number;
  maxLives: number;
  owned: readonly string[];
  worn: readonly string[];
  /** The monkey's colour right now. */
  color: string;
}

export type BuyCheck = 'ok' | 'notEnoughPoints' | 'alreadyOwned' | 'livesFull';

/** Free things (like the monkey's own brown colour) are always owned. */
export function isOwned(item: ShopItem, wallet: Wallet): boolean {
  return item.kind !== 'life' && (item.price === 0 || wallet.owned.includes(item.id));
}

/** Can the player buy this item right now, and if not, why not? */
export function checkBuy(item: ShopItem, wallet: Wallet): BuyCheck {
  if (isOwned(item, wallet)) return 'alreadyOwned';
  if (item.kind === 'life' && wallet.lives >= wallet.maxLives) return 'livesFull';
  if (wallet.score < item.price) return 'notEnoughPoints';
  return 'ok';
}

/**
 * Buys the item with points. New clothes go on and a new colour is used right
 * away. If the item can't be bought, the wallet stays the same.
 */
export function buy(item: ShopItem, wallet: Wallet): Wallet {
  if (checkBuy(item, wallet) !== 'ok') return wallet;
  const score = wallet.score - item.price;
  switch (item.kind) {
    case 'life':
      return { ...wallet, score, lives: wallet.lives + 1 };
    case 'clothes':
      return {
        ...wallet,
        score,
        owned: [...wallet.owned, item.id],
        worn: [...wallet.worn, item.id],
      };
    case 'color':
      return { ...wallet, score, owned: [...wallet.owned, item.id], color: item.id };
  }
}

/** Puts owned clothes on, or takes them off. */
export function toggleWorn(wallet: Wallet, id: string): Wallet {
  if (!wallet.owned.includes(id)) return wallet;
  const worn = wallet.worn.includes(id)
    ? wallet.worn.filter((w) => w !== id)
    : [...wallet.worn, id];
  return { ...wallet, worn };
}

/** Changes the monkey to an owned colour. */
export function chooseColor(item: ShopItem, wallet: Wallet): Wallet {
  if (item.kind !== 'color' || !isOwned(item, wallet)) return wallet;
  return { ...wallet, color: item.id };
}
