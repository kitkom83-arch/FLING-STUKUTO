import * as Phaser from 'phaser/dist/phaser.esm.js';
import { luckyWheelStore } from '../../game/simulation/store';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  create(): void {
    this.createCoinTexture();
    this.createSparkTexture();
    this.cameras.main.setBackgroundColor('#2b0305');
    this.createBackground();

    this.add.text(180, 238, 'Demo_Yo', {
      fontFamily: 'Georgia, serif',
      fontSize: '48px',
      color: '#fff0b2',
      fontStyle: 'bold',
      stroke: '#7d0f11',
      strokeThickness: 5,
      shadow: {
        offsetX: 0,
        offsetY: 4,
        color: '#180103',
        blur: 12,
        fill: true
      }
    }).setOrigin(0.5);

    this.add.text(180, 296, 'Lucky Wheel', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#fff2c4',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const barBack = this.add.rectangle(180, 370, 238, 14, 0x4f0909, 1).setStrokeStyle(2, 0xd6a34b);
    const barFill = this.add.rectangle(63, 370, 0, 8, 0xf7c94a, 1).setOrigin(0, 0.5);
    this.add.text(180, 410, 'Loading festival assets', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#f8d584'
    }).setOrigin(0.5);

    this.createLoadingDots();

    this.tweens.add({
      targets: barFill,
      width: barBack.width - 10,
      duration: 900,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        luckyWheelStore.finishLoading();
        this.scene.start('LuckyWheelScene');
      }
    });
  }

  private createBackground(): void {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x6d0b0d, 0x4d0608, 0x210204, 0x100102, 1);
    graphics.fillRect(0, 0, 360, 740);

    graphics.fillStyle(0xffc84d, 0.12);
    graphics.fillCircle(180, 295, 156);
    graphics.lineStyle(1, 0xffdf86, 0.22);
    graphics.strokeCircle(180, 295, 132);
    graphics.strokeCircle(180, 295, 176);

    graphics.lineStyle(1, 0xb53923, 0.22);
    for (let y = 100; y < 680; y += 44) {
      graphics.beginPath();
      graphics.moveTo(32, y);
      graphics.lineTo(328, y + 12);
      graphics.strokePath();
    }

    graphics.fillStyle(0x0c0001, 0.24);
    graphics.fillRoundedRect(42, 190, 276, 266, 18);
    graphics.lineStyle(2, 0xf0b949, 0.42);
    graphics.strokeRoundedRect(42, 190, 276, 266, 18);
    graphics.lineStyle(1, 0xffedb0, 0.16);
    graphics.strokeRoundedRect(52, 200, 256, 246, 14);
  }

  private createLoadingDots(): void {
    const dots = [154, 180, 206].map((x) => this.add.circle(x, 444, 4, 0xffd66b, 1));
    dots.forEach((dot, index) => {
      this.tweens.add({
        targets: dot,
        alpha: 0.28,
        scale: 0.7,
        duration: 430,
        delay: index * 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private createCoinTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xf5bd35, 1);
    graphics.fillCircle(20, 20, 18);
    graphics.lineStyle(3, 0xffef9a, 1);
    graphics.strokeCircle(20, 20, 14);
    graphics.lineStyle(2, 0x9a4c0b, 1);
    graphics.strokeCircle(20, 20, 18);
    graphics.generateTexture('ui-coin', 40, 40);
    graphics.destroy();
  }

  private createSparkTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xfff4b7, 1);
    graphics.beginPath();
    graphics.moveTo(10, 0);
    graphics.lineTo(13, 7);
    graphics.lineTo(20, 10);
    graphics.lineTo(13, 13);
    graphics.lineTo(10, 20);
    graphics.lineTo(7, 13);
    graphics.lineTo(0, 10);
    graphics.lineTo(7, 7);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('ui-spark', 20, 20);
    graphics.destroy();
  }
}
