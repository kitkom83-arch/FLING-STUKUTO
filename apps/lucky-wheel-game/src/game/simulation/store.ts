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

export type LuckyWheelState = {
  isLoading: boolean;
  campaignId: string;
  remainingSpins: number;
  creditBalance: number;
  pointsBalance: number;
  ticketBalance: number;
  isSpinning: boolean;
  screen: GameScreen;
  modalResult: SpinResult | null;
  errorMessage: string | null;
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
  remainingSpins: 3,
  creditBalance: 120,
  pointsBalance: 340,
  ticketBalance: 5,
  isSpinning: false,
  screen: 'main',
  modalResult: null,
  errorMessage: null,
  rewards: initialRewards,
  history: []
};

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
    this.patch({
      campaignId: config.campaignId,
      remainingSpins: config.remainingSpins,
      creditBalance: config.balance.credit,
      pointsBalance: config.balance.points,
      ticketBalance: config.balance.tickets
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
