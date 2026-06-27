import * as Phaser from 'phaser/dist/phaser.esm.js';
import { getMyRewards, getWheelApiErrorMessage, getWheelApiMode, getWheelConfig, getWheelHistory, spinWheel } from '../../game/services/wheelApi';
import type { LuckyWheelState, WheelDisplaySegment } from '../../game/simulation/store';
import { luckyWheelStore } from '../../game/simulation/store';

const WHEEL_RADIUS = 154;
const WHEEL_DIAMETER = WHEEL_RADIUS * 2 + 12;

export class LuckyWheelScene extends Phaser.Scene {
  private wheelContainer!: any;
  private spinButton!: any;
  private spinButtonBack!: any;
  private spinButtonText!: any;
  private spinPulseTween?: any;
  private unsubscribe?: () => void;
  private currentState: LuckyWheelState = luckyWheelStore.getState();
  private renderedSegmentsKey = '';

  constructor() {
    super('LuckyWheelScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#360506');
    this.createBackground();
    this.createWheel();
    this.createPointer();
    this.createSpinButton();
    this.createAmbientFx();

    this.unsubscribe = luckyWheelStore.subscribe((state) => {
      const nextSegmentsKey = segmentKey(state.wheelSegments);
      if (nextSegmentsKey !== this.renderedSegmentsKey && !state.isSpinning) {
        this.rebuildWheel(state.wheelSegments);
      }
      this.currentState = state;
      this.syncSpinButton();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsubscribe?.());
  }

  private createBackground(): void {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x74100f, 0x52080a, 0x2b0205, 0x130103, 1);
    graphics.fillRect(0, 0, 360, 740);

    graphics.fillStyle(0xffc94f, 0.08);
    graphics.fillCircle(180, 320, 220);
    graphics.fillStyle(0x8f1111, 0.18);
    graphics.fillCircle(180, 350, 178);
    graphics.fillStyle(0x0b0002, 0.18);
    graphics.fillRect(0, 0, 360, 740);

    graphics.lineStyle(1, 0xc74228, 0.22);
    for (let y = 88; y < 720; y += 40) {
      graphics.beginPath();
      graphics.moveTo(24, y);
      graphics.lineTo(336, y + 12);
      graphics.strokePath();
    }

    graphics.fillStyle(0x170103, 0.24);
    graphics.fillRoundedRect(18, 96, 324, 498, 22);
    graphics.fillGradientStyle(0x8b1413, 0x74100f, 0x3c0508, 0x250204, 0.72);
    graphics.fillRoundedRect(20, 98, 320, 492, 20);
    graphics.lineStyle(3, 0x5d0b0b, 0.54);
    graphics.strokeRoundedRect(22, 100, 316, 488, 18);
    graphics.lineStyle(2, 0xf0b949, 0.62);
    graphics.strokeRoundedRect(20, 98, 320, 492, 20);
    graphics.lineStyle(1, 0xffe09a, 0.18);
    graphics.strokeRoundedRect(30, 108, 300, 472, 15);

    graphics.fillStyle(0xffd777, 0.08);
    graphics.fillEllipse(180, 116, 216, 30);
    graphics.fillStyle(0x230204, 0.22);
    graphics.fillEllipse(180, 556, 262, 26);

    this.add.text(180, 128, 'LUCKY WHEEL', {
      fontFamily: 'Georgia, serif',
      fontSize: '30px',
      color: '#fff0b7',
      fontStyle: 'bold',
      stroke: '#5d0809',
      strokeThickness: 5,
      shadow: {
        offsetX: 0,
        offsetY: 3,
        color: '#1a0103',
        blur: 10,
        fill: true
      }
    }).setOrigin(0.5);

    this.add.text(180, 158, 'festival spin - demo rewards only', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#f7d184',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createWheelTexture(segments: WheelDisplaySegment[]): string {
    const textureKey = `lucky-wheel-face-${hashSegmentKey(segmentKey(segments))}`;
    if (this.textures.exists(textureKey)) {
      return textureKey;
    }

    const graphics = this.make.graphics({ x: 0, y: 0 });
    const center = WHEEL_DIAMETER / 2;
    const segmentDegrees = this.getSegmentDegrees(segments);

    segments.forEach((segment, index) => {
      const centerAngle = Phaser.Math.DegToRad(-90 + index * segmentDegrees);
      const startAngle = centerAngle - Phaser.Math.DegToRad(segmentDegrees / 2);
      const endAngle = centerAngle + Phaser.Math.DegToRad(segmentDegrees / 2);

      graphics.fillStyle(segment.color, 1);
      graphics.beginPath();
      graphics.moveTo(center, center);
      graphics.arc(center, center, WHEEL_RADIUS, startAngle, endAngle, false);
      graphics.closePath();
      graphics.fillPath();

      graphics.lineStyle(2, 0xf6c55b, 0.9);
      graphics.beginPath();
      graphics.moveTo(center, center);
      graphics.lineTo(center + Math.cos(startAngle) * WHEEL_RADIUS, center + Math.sin(startAngle) * WHEEL_RADIUS);
      graphics.strokePath();
    });

    graphics.lineStyle(10, 0x6f1110, 1);
    graphics.strokeCircle(center, center, WHEEL_RADIUS + 5);
    graphics.lineStyle(7, 0xf6c44e, 1);
    graphics.strokeCircle(center, center, WHEEL_RADIUS + 1);
    graphics.lineStyle(2, 0xffefae, 0.95);
    graphics.strokeCircle(center, center, WHEEL_RADIUS - 5);
    graphics.lineStyle(3, 0x7f1715, 1);
    graphics.strokeCircle(center, center, WHEEL_RADIUS - 9);
    graphics.fillStyle(0xffe8a7, 1);
    for (let i = 0; i < 24; i += 1) {
      const angle = Phaser.Math.DegToRad(i * 15);
      graphics.fillCircle(center + Math.cos(angle) * (WHEEL_RADIUS + 1), center + Math.sin(angle) * (WHEEL_RADIUS + 1), 3);
    }

    graphics.generateTexture(textureKey, WHEEL_DIAMETER, WHEEL_DIAMETER);
    graphics.destroy();
    return textureKey;
  }

  private createWheel(): void {
    const halo = this.add.graphics();
    halo.fillStyle(0xffc84d, 0.13);
    halo.fillCircle(180, 346, 177);
    halo.lineStyle(2, 0xffdf86, 0.18);
    halo.strokeCircle(180, 346, 172);
    halo.lineStyle(1, 0xfff0b2, 0.2);
    for (let i = 0; i < 16; i += 1) {
      const angle = Phaser.Math.DegToRad(i * 22.5);
      halo.beginPath();
      halo.moveTo(180 + Math.cos(angle) * 168, 346 + Math.sin(angle) * 168);
      halo.lineTo(180 + Math.cos(angle) * 184, 346 + Math.sin(angle) * 184);
      halo.strokePath();
    }

    this.wheelContainer = this.add.container(180, 346);
    this.renderWheelSegments(this.currentState.wheelSegments);
  }

  private rebuildWheel(segments: WheelDisplaySegment[]): void {
    this.renderedSegmentsKey = segmentKey(segments);
    this.wheelContainer.removeAll(true);
    this.wheelContainer.setRotation(0);
    this.renderWheelSegments(segments);
  }

  private renderWheelSegments(segments: WheelDisplaySegment[]): void {
    const segmentDegrees = this.getSegmentDegrees(segments);
    const textureKey = this.createWheelTexture(segments);
    const wheel = this.add.image(0, 0, textureKey);
    wheel.setDisplaySize(WHEEL_DIAMETER, WHEEL_DIAMETER);
    wheel.setTint(0xfff4df);
    this.wheelContainer.add(wheel);

    segments.forEach((segment, index) => {
      const angle = Phaser.Math.DegToRad(-90 + index * segmentDegrees);
      const label = this.add.text(Math.cos(angle) * 94, Math.sin(angle) * 94, segment.shortLabel, {
        fontFamily: 'Arial, sans-serif',
        fontSize: segment.shortLabel.length > 10 ? '10px' : segment.type === 'jackpot' ? '14px' : '12px',
        color: '#fff8d7',
        fontStyle: 'bold',
        stroke: '#561010',
        strokeThickness: 3,
        align: 'center',
        fixedWidth: 74
      }).setOrigin(0.5);
      label.setRotation(angle + Math.PI / 2);
      this.wheelContainer.add(label);

      const marker = this.add.circle(Math.cos(angle) * 52, Math.sin(angle) * 52, 5, segment.accent, 1);
      marker.setStrokeStyle(1, 0x6a160e, 0.8);
      this.wheelContainer.add(marker);
    });
    this.renderedSegmentsKey = segmentKey(segments);
  }

  private createPointer(): void {
    const pointer = this.add.graphics();
    pointer.fillStyle(0xffc14d, 0.14);
    pointer.fillCircle(180, 196, 36);
    pointer.fillStyle(0xffe08a, 1);
    pointer.lineStyle(3, 0x7a1112, 1);
    pointer.beginPath();
    pointer.moveTo(180, 178);
    pointer.lineTo(158, 220);
    pointer.lineTo(202, 220);
    pointer.closePath();
    pointer.fillPath();
    pointer.strokePath();

    this.add.circle(180, 181, 15, 0x6e0b0d, 0.9).setStrokeStyle(2, 0xffc85f, 0.55);
    this.add.circle(180, 181, 11, 0xd01f1b, 1).setStrokeStyle(3, 0xffdfa1);
  }

  private createSpinButton(): void {
    this.spinButton = this.add.container(180, 346);
    this.spinButtonBack = this.add.circle(0, 0, 55, 0xf5be42, 1).setStrokeStyle(6, 0xfff0a4);
    const inner = this.add.circle(0, 0, 41, 0xb71616, 1).setStrokeStyle(2, 0x6b0c0e);
    this.spinButtonText = this.add.text(0, -1, 'SPIN', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#fff4c9',
      fontStyle: 'bold',
      stroke: '#60090b',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.spinButton.add([this.spinButtonBack, inner, this.spinButtonText]);
    this.spinButton.setSize(110, 110);
    this.spinButton.setInteractive({ useHandCursor: true });
    this.spinButton.on('pointerdown', () => void this.handleSpin());
    this.spinPulseTween = this.tweens.add({
      targets: this.spinButton,
      scale: 1.035,
      duration: 1250,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createAmbientFx(): void {
    const particles = this.add.particles(180, 340, 'ui-spark', {
      lifespan: 1800,
      speed: { min: 12, max: 34 },
      angle: { min: 240, max: 300 },
      quantity: 1,
      frequency: 260,
      scale: { start: 0.65, end: 0 },
      alpha: { start: 0.8, end: 0 },
      blendMode: Phaser.BlendModes.ADD
    });
    particles.setDepth(-1);
  }

  private async handleSpin(): Promise<void> {
    if (!luckyWheelStore.beginSpin()) {
      return;
    }

    const isApiMode = getWheelApiMode() === 'api';

    try {
      const result = await spinWheel(this.currentState.campaignId);
      if (result.prizeIndex >= this.currentState.wheelSegments.length) {
        throw new Error('Prize index outside displayed wheel range.');
      }
      const refreshPromise = isApiMode ? this.refreshApiData().catch((error: unknown) => error) : null;
      await this.spinToPrize(result.prizeIndex);

      luckyWheelStore.completeSpin(result, {
        updateLocalRecords: !isApiMode,
        applyResultBalances: !isApiMode
      });

      const refreshError = await refreshPromise;
      if (refreshError) {
        luckyWheelStore.showSafeMessage(getWheelApiErrorMessage(refreshError));
      }
    } catch (error) {
      luckyWheelStore.cancelSpin(getWheelApiErrorMessage(error));
    }
  }

  private async refreshApiData(): Promise<void> {
    const [config, history, rewards] = await Promise.all([getWheelConfig(), getWheelHistory(), getMyRewards()]);
    luckyWheelStore.applyWheelConfig(config);
    luckyWheelStore.replaceHistory(history);
    luckyWheelStore.replaceRewards(rewards);
  }

  private spinToPrize(prizeIndex: number): Promise<void> {
    return new Promise((resolve) => {
      const currentDegrees = Phaser.Math.RadToDeg(this.wheelContainer.rotation);
      const normalizedCurrent = Phaser.Math.Angle.WrapDegrees(currentDegrees);
      const segmentDegrees = this.getSegmentDegrees(this.currentState.wheelSegments);
      const targetModulo = Phaser.Math.Angle.WrapDegrees(-prizeIndex * segmentDegrees);
      const clockwiseDelta = (targetModulo - normalizedCurrent + 360) % 360;
      const fullRotations = 4 + (prizeIndex % 3);
      const targetRotation = currentDegrees + fullRotations * 360 + clockwiseDelta;

      this.tweens.add({
        targets: this.wheelContainer,
        rotation: Phaser.Math.DegToRad(targetRotation),
        duration: 3300,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.wheelContainer.rotation = Phaser.Math.DegToRad(targetModulo);
          this.flashWinSegment(prizeIndex);
          resolve();
        }
      });
    });
  }

  private flashWinSegment(prizeIndex: number): void {
    const segmentDegrees = this.getSegmentDegrees(this.currentState.wheelSegments);
    const angle = Phaser.Math.DegToRad(-90 + prizeIndex * segmentDegrees + Phaser.Math.RadToDeg(this.wheelContainer.rotation));
    const burst = this.add.particles(180 + Math.cos(angle) * 84, 346 + Math.sin(angle) * 84, 'ui-coin', {
      lifespan: 700,
      speed: { min: 60, max: 150 },
      quantity: 12,
      scale: { start: 0.42, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false
    });
    burst.explode(18);
    this.time.delayedCall(850, () => burst.destroy());
  }

  private syncSpinButton(): void {
    const disabled = this.currentState.isSpinning || this.currentState.remainingSpins <= 0;
    this.spinButton.disableInteractive();
    if (!disabled) {
      this.spinButton.setInteractive({ useHandCursor: true });
    }

    this.spinButtonBack.setFillStyle(disabled ? 0x8d6c42 : 0xf5be42, disabled ? 0.75 : 1);
    this.spinButtonText.setText(this.currentState.isSpinning ? 'WAIT' : this.currentState.remainingSpins <= 0 ? 'DONE' : 'SPIN');
    this.spinButton.setAlpha(disabled ? 0.78 : 1);
    if (disabled) {
      this.spinPulseTween?.pause();
      this.spinButton.setScale(1);
    } else if (this.spinPulseTween?.isPaused()) {
      this.spinPulseTween.resume();
    }
  }

  private getSegmentDegrees(segments: WheelDisplaySegment[]): number {
    return 360 / Math.max(1, segments.length);
  }
}

function segmentKey(segments: WheelDisplaySegment[]): string {
  return segments.map((segment, index) => `${index}-${segment.id}-${segment.shortLabel}`).join('|') || 'empty';
}

function hashSegmentKey(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}
