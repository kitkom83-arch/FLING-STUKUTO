import * as Phaser from 'phaser/dist/phaser.esm.js';
import './styles.css';
import { getMyRewards, getWheelApiErrorMessage, getWheelApiMode, getWheelConfig, getWheelHistory } from './game/services/wheelApi';
import { luckyWheelStore } from './game/simulation/store';
import { LoadingScene } from './phaser/scenes/LoadingScene';
import { LuckyWheelScene } from './phaser/scenes/LuckyWheelScene';
import { mountGameUi } from './ui/mountGameUi';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#370607',
  width: 360,
  height: 740,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    antialias: true,
    pixelArt: false
  },
  scene: [LoadingScene, LuckyWheelScene]
};

mountGameUi(document.querySelector<HTMLDivElement>('#ui-overlay')!);
void hydrateWheelData();

new Phaser.Game(config);

async function hydrateWheelData(): Promise<void> {
  try {
    const config = await getWheelConfig();
    luckyWheelStore.applyWheelConfig(config);

    if (getWheelApiMode() === 'api') {
      const [history, rewards] = await Promise.all([getWheelHistory(), getMyRewards()]);
      luckyWheelStore.replaceHistory(history);
      luckyWheelStore.replaceRewards(rewards);
    }
  } catch (error) {
    luckyWheelStore.showSafeMessage(getWheelApiErrorMessage(error));
  }
}
