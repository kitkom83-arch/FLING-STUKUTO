import { REWARD_SEGMENTS } from '../content/rewards';
import type { RewardType } from '../content/rewards';

export type SpinResult = {
  prizeIndex: number;
  rewardId: string;
  rewardLabel: string;
  rewardType: RewardType;
  amount: number;
};

const MOCK_BACKEND_RESULTS: SpinResult[] = REWARD_SEGMENTS.map((reward, prizeIndex) => ({
  prizeIndex,
  rewardId: reward.id,
  rewardLabel: reward.label,
  rewardType: reward.type,
  amount: reward.amount
}));

let resultCursor = 0;

// Integration boundary: replace this function with the PG77-real-core backend call.
// The frontend consumes the returned prizeIndex and never chooses the reward itself.
export async function requestMockSpinResult(): Promise<SpinResult> {
  const result = MOCK_BACKEND_RESULTS[resultCursor % MOCK_BACKEND_RESULTS.length];
  resultCursor += 1;

  await new Promise((resolve) => window.setTimeout(resolve, 260));
  return result;
}
