import Phaser from 'phaser';
import { COLORS, DEPTH, GAME_HEIGHT, GAME_WIDTH, MONKEY_COLORS, SHOP } from '../config';
import { checkBuy, isOwned, type ShopItem, type Wallet } from '../logic/shop';
import { clothesTexture } from './Clothes';

/** What the shop asks the game to do. */
export interface ShopActions {
  /** Buy the item, put bought clothes on or off, or choose a bought colour. */
  choose: (item: ShopItem) => void;
  close: () => void;
}

const TEXT_STYLE = {
  color: COLORS.text,
  stroke: COLORS.textShadow,
  strokeThickness: 4,
} as const;

/** The button text for one item: what clicking it would do now. */
function buttonLabel(item: ShopItem, wallet: Wallet): { text: string; enabled: boolean } {
  if (isOwned(item, wallet)) {
    if (item.kind === 'color') {
      const chosen = wallet.color === item.id;
      return { text: chosen ? 'Valittu' : 'Valitse', enabled: !chosen };
    }
    return { text: wallet.worn.includes(item.id) ? 'Ota pois' : 'Laita päälle', enabled: true };
  }
  switch (checkBuy(item, wallet)) {
    case 'ok':
      return { text: 'Osta', enabled: true };
    case 'livesFull':
      return { text: 'Täynnä', enabled: false };
    case 'notEnoughPoints':
      return { text: 'Kerää lisää', enabled: false };
    case 'alreadyOwned':
      return { text: 'Ostettu', enabled: false };
  }
}

/** A round colour sample for the shop. The rainbow gets a slice of each colour. */
function colorSwatch(scene: Phaser.Scene, id: string): string {
  const key = `swatch-${id}`;
  if (scene.textures.exists(key)) return key;
  const fur = MONKEY_COLORS[id as keyof typeof MONKEY_COLORS];
  const colors = Object.values(fur);
  const r = SHOP.iconSize / 2;
  const g = scene.add.graphics();
  colors.forEach((color, i) => {
    const start = (i / colors.length) * Math.PI * 2;
    const end = ((i + 1) / colors.length) * Math.PI * 2;
    g.fillStyle(color);
    g.slice(r, r, r - 1, start, end, false);
    g.fillPath();
  });
  g.lineStyle(2, COLORS.shopBorder);
  g.strokeCircle(r, r, r - 1);
  g.generateTexture(key, r * 2, r * 2);
  g.destroy();
  return key;
}

function iconFor(scene: Phaser.Scene, item: ShopItem, heartTexture: string): string {
  if (item.kind === 'life') return heartTexture;
  if (item.kind === 'color') return colorSwatch(scene, item.id);
  return clothesTexture(scene, item.id);
}

/**
 * The shop window: clothes and lives on the left, monkey colours on the right.
 * The game is paused while it is open.
 */
export class ShopPanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly pointsText: Phaser.GameObjects.Text;
  private readonly rows: { item: ShopItem; button: Phaser.GameObjects.Text }[] = [];

  constructor(scene: Phaser.Scene, heartTexture: string, actions: ShopActions) {
    const { panelWidth: w, headerHeight, footerHeight, rowHeight, iconSize } = SHOP;
    const items: ShopItem[] = SHOP.items.map((item) => ({ ...item }));
    const columns = [
      { title: 'Vaatteet ja elämät', items: items.filter((item) => item.kind !== 'color') },
      { title: 'Apinan väri', items: items.filter((item) => item.kind === 'color') },
    ];
    const rowCount = Math.max(...columns.map((column) => column.items.length));
    const h = headerHeight + rowCount * rowHeight + footerHeight;
    const top = -h / 2;
    const columnWidth = w / 2;

    const parts: Phaser.GameObjects.GameObject[] = [
      scene.add
        .rectangle(0, 0, w, h, COLORS.shopPanel, SHOP.panelAlpha)
        .setStrokeStyle(4, COLORS.shopBorder),
      scene.add.text(0, top + 28, 'Kauppa', { ...TEXT_STYLE, fontSize: '32px' }).setOrigin(0.5),
    ];
    this.pointsText = scene.add
      .text(0, top + 62, '', { ...TEXT_STYLE, fontSize: '20px' })
      .setOrigin(0.5);
    parts.push(this.pointsText);

    columns.forEach((column, c) => {
      const left = -w / 2 + c * columnWidth + 20;
      const right = left + columnWidth - 40;
      parts.push(
        scene.add
          .text(left + columnWidth / 2 - 20, top + 95, column.title, {
            ...TEXT_STYLE,
            fontSize: '18px',
            color: COLORS.shopButton,
          })
          .setOrigin(0.5),
      );
      column.items.forEach((item, i) => {
        const y = top + headerHeight + rowHeight / 2 + i * rowHeight;
        const icon = scene.add.image(left + iconSize / 2, y, iconFor(scene, item, heartTexture));
        icon.setScale(Math.min(iconSize / icon.width, iconSize / icon.height));
        const price = item.price === 0 ? 'ilmainen' : `${item.price} p`;
        const name = scene.add
          .text(left + iconSize + 10, y, `${item.name}  ${price}`, {
            ...TEXT_STYLE,
            fontSize: '18px',
          })
          .setOrigin(0, 0.5);
        const button = scene.add
          .text(right, y, '', { ...TEXT_STYLE, fontSize: '18px' })
          .setOrigin(1, 0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => actions.choose(item));
        parts.push(icon, name, button);
        this.rows.push({ item, button });
      });
    });

    parts.push(
      scene.add
        .text(0, h / 2 - 28, '[K] Takaisin peliin', {
          ...TEXT_STYLE,
          fontSize: '20px',
          color: COLORS.shopButton,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => actions.close()),
    );

    this.container = scene.add
      .container(GAME_WIDTH / 2, GAME_HEIGHT / 2, parts)
      .setDepth(DEPTH.shop)
      .setVisible(false);
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

  /** Updates the points and the buttons after buying or choosing something. */
  refresh(wallet: Wallet): void {
    this.pointsText.setText(`Sinulla on ${wallet.score} pistettä`);
    for (const { item, button } of this.rows) {
      const { text, enabled } = buttonLabel(item, wallet);
      button.setText(text).setColor(enabled ? COLORS.shopButton : COLORS.shopDisabled);
    }
  }
}
