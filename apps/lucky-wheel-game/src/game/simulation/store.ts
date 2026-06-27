import type { RewardType } from '../content/rewards';
import { REWARD_SEGMENTS } from '../content/rewards';
import type { SpinResult, WheelConfig, WheelHistoryRecord, WheelRewardRecord } from '../services/wheelApi';

export type RewardStatus = 'pending' | 'claimed' | 'expired';
export type GameScreen = 'main' | 'rewards' | 'rules' | 'history';

export type RewardRecord = {
  id: string;
  label: string;
  amount: number;
  type: SpinResult['rewardType'];
  status: RewardStatus;
  createdAt: string;
};

export type HistoryRecord = {
  id: string;
  label: string;
  amount: number;
  type: SpinResult['rewardType'];
  prizeIndex: number;
  createdAt: string;
};

export type WheelDisplaySegment = {
  id: string;
  label: string;
  shortLabel: string;
  type: RewardType;
  color: number;
  accent: number;
};

export type LuckyWheelState = {
  isLoading: boolean;
  campaignId: string;
  campaignName: string;
  rulesText: string;
  remainingSpins: number;
  creditBalance: number;
  pointsBalance: number;
  ticketBalance: number;
  isSpinning: boolean;
  screen: GameScreen;
  modalResult: SpinResult | null;
  errorMessage: string | null;
  wheelSegments: WheelDisplaySegment[];
  rewards: RewardRecord[];
  history: HistoryRecord[];
};

type Listener = (state: LuckyWheelState) => void;

const initialRewards: RewardRecord[] = [
  {
    id: 'demo-pending-box',
    label: 'Gold Mystery Box',
    amount: 1,
    type: 'item',
    status: 'pending',
    createdAt: 'Demo'
  },
  {
    id: 'demo-claimed-points',
    label: 'Points 20',
    amount: 20,
    type: 'points',
    status: 'claimed',
    createdAt: 'Demo'
  },
  {
    id: 'demo-expired-ticket',
    label: 'Ticket 1',
    amount: 1,
    type: 'ticket',
    status: 'expired',
    createdAt: 'Demo'
  }
];

const initialState: LuckyWheelState = {
  isLoading: true,
  campaignId: 'wheel_main',
  campaignName: 'Lucky Wheel',
  rulesText: '',
  remainingSpins: 3,
  creditBalance: 120,
  pointsBalance: 340,
  ticketBalance: 5,
  isSpinning: false,
  screen: 'main',
  modalResult: null,
  errorMessage: null,
  wheelSegments: REWARD_SEGMENTS,
  rewards: initialRewards,
  history: []
};

const SEGMENT_COLORS = [
  { color: 0xb71217, accent: 0xffec9d },
  { color: 0x5c070b, accent: 0xf6bd49 },
  { color: 0xd04520, accent: 0xffd66b },
  { color: 0x8e1016, accent: 0xfff0b3 },
  { color: 0xc98719, accent: 0xfff4bf },
  { color: 0x3f0508, accent: 0xb8742d },
  { color: 0xa91822, accent: 0xffc84d },
  { color: 0x701013, accent: 0xffdf86 }
];

type CompleteSpinOptions = {
  updateLocalRecords?: boolean;
  applyResultBalances?: boolean;
};

class LuckyWheelStore {
  private state = initialState;
  private listeners = new Set<Listener>();

  getState(): LuckyWheelState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  setScreen(screen: GameScreen): void {
    this.patch({ screen });
  }

  finishLoading(): void {
    this.patch({ isLoading: false });
  }

  applyWheelConfig(config: WheelConfig): void {
    const wheelSegments = config.rewards.length > 0 ? config.rewards.map(mapConfigRewardToSegment) : this.state.wheelSegments;
    this.patch({
      campaignId: config.campaignId,
      campaignName: config.name,
      rulesText: config.rulesText,
      remainingSpins: config.remainingSpins,
      creditBalance: config.balance.credit,
      pointsBalance: config.balance.points,
      ticketBalance: config.balance.tickets,
      wheelSegments
    });
  }

  replaceRewards(rewards: WheelRewardRecord[]): void {
    this.patch({ rewards });
  }

  replaceHistory(history: WheelHistoryRecord[]): void {
    this.patch({ history });
  }

  beginSpin(): boolean {
    if (this.state.isSpinning || this.state.remainingSpins <= 0) {
      return false;
    }

    this.patch({
      isSpinning: true,
      remainingSpins: this.state.remainingSpins - 1,
      modalResult: null,
      errorMessage: null,
      screen: 'main'
    });
    return true;
  }

  completeSpin(result: SpinResult, options: CompleteSpinOptions = {}): void {
    const now = new Date();
    const createdAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const recordId = `${result.rewardId}-${now.getTime()}`;
    const shouldUpdateLocalRecords = options.updateLocalRecords ?? true;
    const shouldApplyResultBalances = options.applyResultBalances ?? true;
    const nextRewards = shouldUpdateLocalRecords && this.shouldCreateReward(result)
      ? [
          {
            id: recordId,
            label: result.rewardLabel,
            amount: result.amount,
            type: result.rewardType,
            status: 'pending' as const,
            createdAt
          },
          ...this.state.rewards
        ]
      : this.state.rewards;
    const nextHistory = shouldUpdateLocalRecords
      ? [
          {
            id: recordId,
            label: result.rewardLabel,
            amount: result.amount,
            type: result.rewardType,
            prizeIndex: result.prizeIndex,
            createdAt
          },
          ...this.state.history
        ].slice(0, 20)
      : this.state.history;

    this.patch({
      isSpinning: false,
      modalResult: result,
      errorMessage: null,
      creditBalance: shouldApplyResultBalances ? this.state.creditBalance + (result.rewardType === 'credit' ? result.amount : 0) : this.state.creditBalance,
      pointsBalance: shouldApplyResultBalances ? this.state.pointsBalance + (result.rewardType === 'points' ? result.amount : 0) : this.state.pointsBalance,
      ticketBalance: shouldApplyResultBalances ? this.state.ticketBalance + (result.rewardType === 'ticket' ? result.amount : 0) : this.state.ticketBalance,
      rewards: nextRewards,
      history: nextHistory
    });
  }

  cancelSpin(message: string): void {
    this.patch({
      isSpinning: false,
      remainingSpins: this.state.remainingSpins + 1,
      modalResult: null,
      errorMessage: message
    });
  }

  showSafeMessage(message: string): void {
    this.patch({ errorMessage: message });
  }

  closeMessage(): void {
    this.patch({ errorMessage: null });
  }

  closeResult(): void {
    this.patch({ modalResult: null });
  }

  private shouldCreateReward(result: SpinResult): boolean {
    return result.rewardType !== 'none' && result.rewardType !== 'retry';
  }

  private patch(partial: Partial<LuckyWheelState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const luckyWheelStore = new LuckyWheelStore();

function mapConfigRewardToSegment(reward: WheelConfig['rewards'][number], index: number): WheelDisplaySegment {
  const colors = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
  const label = reward.displayValue || reward.label;
  return {
    id: reward.id,
    label,
    shortLabel: compactSegmentLabel(label, reward.rewardType),
    type: reward.rewardType,
    color: colors.color,
    accent: colors.accent
  };
}

function compactSegmentLabel(label: string, type: RewardType): string {
  const normalized = label.trim();
  if (!normalized) return type.toUpperCase();
  if (normalized.length <= 10) return normalized.toUpperCase();

  const amount = normalized.match(/\d+[\d,.]*/)?.[0];
  if (type === 'credit' && amount) return `CREDIT ${amount}`;
  if (type === 'points' && amount) return `PTS ${amount}`;
  if (type === 'ticket' && amount) return `TICKET ${amount}`;
  if (type === 'none') return 'NO REWARD';
  if (type === 'retry') return 'TRY AGAIN';
  if (type === 'jackpot') return 'JACKPOT';

  const words = normalized.split(/\s+/).filter(Boolean);
  return words.slice(0, 2).join(' ').toUpperCase();
}
