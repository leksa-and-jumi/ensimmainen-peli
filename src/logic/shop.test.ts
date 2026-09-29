import { describe, expect, it } from 'vitest';
import { buy, checkBuy, toggleWorn, type ShopItem, type Wallet } from './shop';

const hat: ShopItem = { id: 'hat', name: 'Hattu', price: 5, kind: 'clothes' };
const life: ShopItem = { id: 'life', name: 'Elämä', price: 10, kind: 'life' };

const wallet = (overrides: Partial<Wallet> = {}): Wallet => ({
  score: 20,
  lives: 3,
  maxLives: 4,
  owned: [],
  worn: [],
  ...overrides,
});

describe('checkBuy', () => {
  it('allows buying with enough points', () => {
    expect(checkBuy(hat, wallet())).toBe('ok');
    expect(checkBuy(life, wallet())).toBe('ok');
  });

  it('needs enough points', () => {
    expect(checkBuy(hat, wallet({ score: 4 }))).toBe('notEnoughPoints');
  });

  it('does not sell the same clothes twice', () => {
    expect(checkBuy(hat, wallet({ owned: ['hat'] }))).toBe('alreadyOwned');
  });

  it('does not sell lives when all hearts are full', () => {
    expect(checkBuy(life, wallet({ lives: 4 }))).toBe('livesFull');
  });
});

describe('buy', () => {
  it('pays with points and puts new clothes on', () => {
    const after = buy(hat, wallet());
    expect(after.score).toBe(15);
    expect(after.owned).toEqual(['hat']);
    expect(after.worn).toEqual(['hat']);
  });

  it('gives back a life', () => {
    const after = buy(life, wallet());
    expect(after.score).toBe(10);
    expect(after.lives).toBe(4);
  });

  it('changes nothing when the item cannot be bought', () => {
    const poor = wallet({ score: 1 });
    expect(buy(hat, poor)).toBe(poor);
  });
});

describe('toggleWorn', () => {
  it('takes clothes off and puts them back on', () => {
    const dressed = wallet({ owned: ['hat'], worn: ['hat'] });
    const undressed = toggleWorn(dressed, 'hat');
    expect(undressed.worn).toEqual([]);
    expect(toggleWorn(undressed, 'hat').worn).toEqual(['hat']);
  });

  it('cannot wear clothes that were not bought', () => {
    const w = wallet();
    expect(toggleWorn(w, 'hat')).toBe(w);
  });
});
