import Phaser from 'phaser';
import { COLORS, DEPTH, GAME_HEIGHT, GAME_WIDTH, SHOP } from '../config';
import { checkBuy, type ShopItem, type Wallet } from '../logic/shop';
import { clothesTexture } from './Clothes';

/** What the shop asks the game to do. */
export interface ShopActions {
  /** Buy the item, or put bought clothes on or off. */
  choose: (item: ShopItem) => void;
  close: () => void;
}

const TEXT_STYLE = {
  color: COLORS.text,
  stroke: COLORS.textShadow,
  strokeThickness: 4,
} as const;

/** The button text for one item: what pressing it would do now. */
function buttonLabel(
  item: ShopItem,
  wallet: Wallet,
  key: number,
): { text: string; enabled: boolean } {
  if (item.kind === 'clothes' && wallet.owned.includes(item.id)) {
    const on = wallet.worn.includes(item.id);
    return { text: `[${key}] ${on ? 'Ota pois' : 'Laita päälle'}`, enabled: true };
  }
  switch (checkBuy(item, wallet)) {
    case 'ok':
      return { text: `[${key}] Osta`, enabled: true };
    case 'livesFull':
      return { text: 'Sydämet täynnä', enabled: false };
    case 'notEnoughPoints':
      return { text: 'Liian vähän pisteitä', enabled: false };
    case 'alreadyOwned':
      return { text: 'Ostettu', enabled: false };
  }
}

/** The shop window: items, their prices and buttons. The game is paused while it is open. */
export class ShopPanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly pointsText: Phaser.GameObjects.Text;
  private readonly buttons: Phaser.GameObjects.Text[];
  private readonly items: ShopItem[];

  constructor(scene: Phaser.Scene, heartTexture: string, actions: ShopActions) {
    const { panelWidth: w, headerHeight, footerHeight, rowHeight, iconSize } = SHOP;
    const h = headerHeight + SHOP.items.length * rowHeight + footerHeight;
    const left = -w / 2 + 24;
    const top = -h / 2;
    this.items = SHOP.items.map((item) => ({ ...item }));

    const bg = scene.add
      .rectangle(0, 0, w, h, COLORS.shopPanel, SHOP.panelAlpha)
      .setStrokeStyle(4, COLORS.shopBorder);
    const title = scene.add
      .text(0, top + 30, 'Kauppa', { ...TEXT_STYLE, fontSize: '32px' })
      .setOrigin(0.5);
    this.pointsText = scene.add
      .text(0, top + 66, '', { ...TEXT_STYLE, fontSize: '20px' })
      .setOrigin(0.5);

    const rows: Phaser.GameObjects.GameObject[] = [];
    this.buttons = this.items.map((item, i) => {
      const y = top + headerHeight + rowHeight / 2 + i * rowHeight;
      const texture = item.kind === 'life' ? heartTexture : clothesTexture(scene, item.id);
      const icon = scene.add.image(left + iconSize / 2, y, texture);
      icon.setScale(Math.min(iconSize / icon.width, iconSize / icon.height));
      const name = scene.add
        .text(left + iconSize + 16, y, `${item.name}  ${item.price} p`, {
          ...TEXT_STYLE,
          fontSize: '20px',
        })
        .setOrigin(0, 0.5);
      const button = scene.add
        .text(w / 2 - 24, y, '', { ...TEXT_STYLE, fontSize: '20px' })
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => actions.choose(item));
      rows.push(icon, name, button);
      return button;
    });

    const close = scene.add
      .text(0, h / 2 - 28, '[K] Takaisin peliin', {
        ...TEXT_STYLE,
        fontSize: '20px',
        color: COLORS.shopButton,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => actions.close());

    this.container = scene.add
      .container(GAME_WIDTH / 2, GAME_HEIGHT / 2, [bg, title, this.pointsText, ...rows, close])
      .setDepth(DEPTH.shop)
      .setVisible(false);
  }

  /** The item for number key 1, 2, 3… */
  itemAt(index: number): ShopItem | undefined {
    return this.items[index];
  }

  get isOpen(): boolean {
    return this.container.visible;
  }

  show(wallet: Wallet): void {
    this.refresh(wallet);
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  /** Updates the points and the buttons after buying something. */
  refresh(wallet: Wallet): void {
    this.pointsText.setText(`Sinulla on ${wallet.score} pistettä`);
    this.items.forEach((item, i) => {
      const button = this.buttons[i];
      if (!button) return;
      const { text, enabled } = buttonLabel(item, wallet, i + 1);
      button.setText(text).setColor(enabled ? COLORS.shopButton : COLORS.shopDisabled);
    });
  }
}
