import { REWARD_SEGMENTS } from '../content/rewards';
import type { RewardType } from '../content/rewards';
import { requestMockSpinResult } from './mockBackend';
import type { SpinResult } from './mockBackend';

export type { SpinResult };

export type WheelApiMode = 'mock' | 'api';

export type WheelBalance = {
  credit: number;
  points: number;
  tickets: number;
};

export type WheelConfig = {
  campaignId: string;
  name: string;
  remainingSpins: number;
  balance: WheelBalance;
  rewards: Array<{
    id: string;
    label: string;
    rewardType: RewardType;
    displayValue: string;
    sortOrder: number;
  }>;
  rulesText: string;
};

export type WheelRewardRecord = {
  id: string;
  label: string;
  amount: number;
  type: RewardType;
  status: 'pending' | 'claimed' | 'expired';
  createdAt: string;
};

export type WheelHistoryRecord = {
  id: string;
  label: string;
  amount: number;
  type: RewardType;
  prizeIndex: number;
  createdAt: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

type ApiWheelConfig = {
  campaignId?: string;
  name?: string;
  remainingSpinsToday?: number | null;
  memberBalance?: Partial<Record<keyof WheelBalance, unknown>>;
  rewards?: ApiRewardSegment[];
  rulesText?: string;
};

type ApiRewardSegment = {
  id?: string;
  label?: string;
  type?: string;
  displayValue?: string;
  sortOrder?: number;
};

type ApiSpinResponse = {
  rewardId?: string;
  prizeIndex?: number;
  reward?: {
    label?: string;
    type?: string;
    amount?: number | string;
    displayValue?: string;
  };
};

type ApiHistoryRecord = {
  spinId?: string;
  rewardLabel?: string;
  rewardType?: string;
  rewardValue?: number | string;
  displayValue?: string;
  status?: string;
  prizeIndex?: number;
  createdAt?: string;
};

type ApiRewardRecord = {
  id?: string;
  label?: string;
  rewardType?: string;
  rewardValue?: number | string;
  status?: string;
  createdAt?: string;
};

const DEFAULT_CAMPAIGN_ID = 'wheel_main';
const SAFE_GENERIC_MESSAGE = 'Lucky Wheel is unavailable right now. Please try again.';
const API_BASE_URL = (import.meta.env.VITE_WHEEL_API_BASE_URL || '/api').replace(/\/+$/, '');
const AUTH_TOKEN_STORAGE_KEY = import.meta.env.VITE_WHEEL_AUTH_TOKEN_STORAGE_KEY || 'pg77_member_token';
const SITE_CODE = String(import.meta.env.VITE_WHEEL_SITE_CODE || '').trim();
const DEMO_MEMBER_HEADER = 'x-demo-member-id';
const DEMO_MEMBER_ENABLED = import.meta.env.VITE_WHEEL_DEMO_MEMBER_ENABLED === 'true';
const DEMO_MEMBER_ID = nonEmptyString(import.meta.env.VITE_WHEEL_DEMO_MEMBER_ID, 'demo_member');

export class WheelApiError extends Error {
  readonly userMessage: string;

  constructor(userMessage = SAFE_GENERIC_MESSAGE) {
    super(userMessage);
    this.name = 'WheelApiError';
    this.userMessage = userMessage;
  }
}

export function getWheelApiMode(): WheelApiMode {
  return import.meta.env.VITE_WHEEL_API_MODE === 'api' ? 'api' : 'mock';
}

export function getWheelApiErrorMessage(error: unknown): string {
  if (error instanceof WheelApiError) {
    return error.userMessage;
  }
  return SAFE_GENERIC_MESSAGE;
}

export async function getWheelConfig(): Promise<WheelConfig> {
  if (getWheelApiMode() === 'mock') {
    return getMockWheelConfig();
  }

  return mapApiConfig(await apiRequest<ApiWheelConfig>('/member/wheel/config'));
}

export async function spinWheel(campaignId = DEFAULT_CAMPAIGN_ID): Promise<SpinResult> {
  if (getWheelApiMode() === 'mock') {
    return requestMockSpinResult();
  }

  const response = await apiRequest<ApiSpinResponse>('/member/wheel/spin', {
    method: 'POST',
    body: { campaignId }
  });
  return mapApiSpinResult(response);
}

export async function getWheelHistory(): Promise<WheelHistoryRecord[]> {
  if (getWheelApiMode() === 'mock') {
    return [];
  }

  const records = await apiRequest<ApiHistoryRecord[]>('/member/wheel/history?limit=20');
  return Array.isArray(records) ? records.map(mapApiHistoryRecord).filter(isRecord) : [];
}

export async function getMyRewards(): Promise<WheelRewardRecord[]> {
  if (getWheelApiMode() === 'mock') {
    return getMockRewards();
  }

  const records = await apiRequest<ApiRewardRecord[]>('/member/wheel/my-rewards?limit=20');
  return Array.isArray(records) ? records.map(mapApiRewardRecord).filter(isRecord) : [];
}

async function apiRequest<T>(path: string, init: ApiRequestOptions = {}): Promise<T> {
  const { body, headers, ...requestInit } = init;
  const requestBody = body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body);
  const authHeaders = getApiAuthHeaders();
  const siteHeaders = getSiteHeaders();
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestInit,
      headers: {
        Accept: 'application/json',
        ...siteHeaders,
        ...authHeaders,
        ...(requestBody ? { 'Content-Type': 'application/json' } : {}),
        ...headers
      },
      body: requestBody
    });
  } catch {
    throw new WheelApiError();
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new WheelApiError();
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new WheelApiError();
  }

  if (!response.ok || envelope.success !== true || envelope.data === undefined) {
    throw new WheelApiError(safeMessageForStatus(response.status));
  }

  return envelope.data;
}

function getSiteHeaders(): Record<string, string> {
  return SITE_CODE ? { 'X-Site-Code': SITE_CODE } : {};
}

function getApiAuthHeaders(): Record<string, string> {
  if (DEMO_MEMBER_ENABLED) {
    return { [DEMO_MEMBER_HEADER]: DEMO_MEMBER_ID };
  }

  const token = getMemberToken();
  if (!token) {
    throw new WheelApiError('Member session unavailable. Please sign in again.');
  }
  return { Authorization: `Bearer ${token}` };
}

function getMemberToken(): string | null {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

function safeMessageForStatus(status: number): string {
  if (status === 401 || status === 403) {
    return 'Member session unavailable. Please sign in again.';
  }
  if (status === 400 || status === 404 || status === 409) {
    return 'This spin is not available right now. Please try again later.';
  }
  return SAFE_GENERIC_MESSAGE;
}

function mapApiConfig(config: ApiWheelConfig): WheelConfig {
  const balance = config.memberBalance || {};
  return {
    campaignId: nonEmptyString(config.campaignId, DEFAULT_CAMPAIGN_ID),
    name: nonEmptyString(config.name, 'Lucky Wheel'),
    remainingSpins: nonNegativeNumber(config.remainingSpinsToday, 0),
    balance: {
      credit: nonNegativeNumber(balance.credit, 0),
      points: nonNegativeNumber(balance.points, 0),
      tickets: nonNegativeNumber(balance.tickets, 0)
    },
    rewards: Array.isArray(config.rewards)
      ? config.rewards.map((reward, index) => ({
          id: nonEmptyString(reward.id, `reward-${index}`),
          label: nonEmptyString(reward.label, `Reward ${index + 1}`),
          rewardType: normalizeRewardType(reward.type, reward.label),
          displayValue: nonEmptyString(reward.displayValue, nonEmptyString(reward.label, 'Reward')),
          sortOrder: Number.isInteger(reward.sortOrder) ? Number(reward.sortOrder) : index + 1
        }))
      : [],
    rulesText: nonEmptyString(config.rulesText, '')
  };
}

function mapApiSpinResult(response: ApiSpinResponse): SpinResult {
  const prizeIndex = Number(response.prizeIndex);
  if (!Number.isInteger(prizeIndex) || prizeIndex < 0) {
    throw new WheelApiError();
  }

  const reward = response.reward || {};
  const fallbackRewardLabel = REWARD_SEGMENTS[prizeIndex]?.label || `Reward ${prizeIndex + 1}`;
  return {
    prizeIndex,
    rewardId: nonEmptyString(response.rewardId, `reward-${prizeIndex}`),
    rewardLabel: nonEmptyString(reward.label, fallbackRewardLabel),
    rewardType: normalizeRewardType(reward.type, reward.label),
    amount: nonNegativeNumber(reward.amount, 0)
  };
}

function mapApiHistoryRecord(record: ApiHistoryRecord): WheelHistoryRecord | null {
  const prizeIndex = Number(record.prizeIndex);
  if (!Number.isInteger(prizeIndex)) {
    return null;
  }

  return {
    id: nonEmptyString(record.spinId, `${nonEmptyString(record.rewardLabel, 'spin')}-${record.createdAt || Date.now()}`),
    label: nonEmptyString(record.rewardLabel, 'Reward'),
    amount: nonNegativeNumber(record.rewardValue, 0),
    type: normalizeRewardType(record.rewardType, record.rewardLabel),
    prizeIndex,
    createdAt: formatApiDate(record.createdAt)
  };
}

function mapApiRewardRecord(record: ApiRewardRecord): WheelRewardRecord | null {
  const status = normalizeRewardStatus(record.status);
  if (!status) {
    return null;
  }

  return {
    id: nonEmptyString(record.id, `${nonEmptyString(record.label, 'reward')}-${record.createdAt || Date.now()}`),
    label: nonEmptyString(record.label, 'Reward'),
    amount: nonNegativeNumber(record.rewardValue, 0),
    type: normalizeRewardType(record.rewardType, record.label),
    status,
    createdAt: formatApiDate(record.createdAt)
  };
}

function getMockWheelConfig(): WheelConfig {
  return {
    campaignId: DEFAULT_CAMPAIGN_ID,
    name: 'Lucky Wheel',
    remainingSpins: 3,
    balance: {
      credit: 120,
      points: 340,
      tickets: 5
    },
    rewards: REWARD_SEGMENTS.map((reward, index) => ({
      id: reward.id,
      label: reward.label,
      rewardType: reward.type,
      displayValue: reward.label,
      sortOrder: index + 1
    })),
    rulesText: ''
  };
}

function getMockRewards(): WheelRewardRecord[] {
  return [
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
}

function normalizeRewardType(value: unknown, label?: unknown): RewardType {
  const raw = String(value || '').trim().toLowerCase();
  const normalizedLabel = String(label || '').trim().toLowerCase();
  if (normalizedLabel.includes('jackpot')) return 'jackpot';
  if (normalizedLabel.includes('try again')) return 'retry';
  if (raw === 'point') return 'points';
  if (raw === 'no_reward') return 'none';
  if (raw === 'credit' || raw === 'points' || raw === 'ticket' || raw === 'item' || raw === 'jackpot' || raw === 'retry') {
    return raw;
  }
  return 'none';
}

function normalizeRewardStatus(value: unknown): WheelRewardRecord['status'] | null {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'pending' || status === 'claimed' || status === 'expired') {
    return status;
  }
  return null;
}

function nonEmptyString(value: unknown, fallback: string): string {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function nonNegativeNumber(value: unknown, fallback: number): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}

function formatApiDate(value: unknown): string {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) {
    return 'Recent';
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isRecord<T>(record: T | null): record is T {
  return record !== null;
}
