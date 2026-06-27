export type RewardType = 'credit' | 'points' | 'ticket' | 'none' | 'item' | 'jackpot' | 'retry';

export type RewardSegment = {
  id: string;
  label: string;
  shortLabel: string;
  type: RewardType;
  amount: number;
  color: number;
  accent: number;
};

export const REWARD_SEGMENTS: RewardSegment[] = [
  {
    id: 'credit-10',
    label: 'Credit 10',
    shortLabel: 'CREDIT 10',
    type: 'credit',
    amount: 10,
    color: 0xc61d18,
    accent: 0xffd66b
  },
  {
    id: 'credit-50',
    label: 'Credit 50',
    shortLabel: 'CREDIT 50',
    type: 'credit',
    amount: 50,
    color: 0x8f1012,
    accent: 0xfff0a3
  },
  {
    id: 'points-20',
    label: 'Points 20',
    shortLabel: 'PTS 20',
    type: 'points',
    amount: 20,
    color: 0xd44b20,
    accent: 0xffd15a
  },
  {
    id: 'ticket-1',
    label: 'Ticket 1',
    shortLabel: 'TICKET 1',
    type: 'ticket',
    amount: 1,
    color: 0xa61422,
    accent: 0xffe09a
  },
  {
    id: 'no-reward',
    label: 'No Reward',
    shortLabel: 'NO REWARD',
    type: 'none',
    amount: 0,
    color: 0x5e0b10,
    accent: 0xb8742d
  },
  {
    id: 'item-gold-box',
    label: 'Gold Mystery Box',
    shortLabel: 'GOLD BOX',
    type: 'item',
    amount: 1,
    color: 0xc8841a,
    accent: 0xfff2b8
  },
  {
    id: 'jackpot-mock',
    label: 'Jackpot Mock',
    shortLabel: 'JACKPOT',
    type: 'jackpot',
    amount: 777,
    color: 0x6d0914,
    accent: 0xffc83d
  },
  {
    id: 'try-again',
    label: 'Try Again',
    shortLabel: 'TRY AGAIN',
    type: 'retry',
    amount: 0,
    color: 0xb2291f,
    accent: 0xffdf86
  }
];
