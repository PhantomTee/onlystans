export type RatePreset = "micro" | "low" | "standard" | "premium";

export type Creator = {
  handle: string;
  name: string;
  avatar: string;
  walletId: string;
  walletAddress: string;
  bio: string;
  isPaidTier?: boolean;
  subscriptionPrice?: number; // USDC/month — undefined = free
  ratePerSecond?: number;
};

export type Chapter = {
  title: string;
  time: number; // seconds from start
};

export type Video = {
  id: string;
  title: string;
  description: string;
  creator: Creator;
  videoCid: string;
  thumbnailCid: string;
  videoSrc: string;
  thumbnailSrc: string;
  tags: string[];
  ratePerSecond: number;
  totalEarned: number;
  totalWatchSeconds: number;
  liveViewers: number;
  createdAt: string;
  chapters?: Chapter[];
  nftGated?: boolean;
  subscriptionRate?: number; // flat monthly USDC
};

export type StreamSession = {
  sessionId: string;
  videoId: string;
  startedAt: string;
  status: "playing" | "paused" | "stopped";
};

export type Transaction = {
  id: string;
  kind: "stream" | "tip" | "withdraw" | "topup";
  amount: number;
  txHash: string;
  createdAt: string;
};

export type TagResult = {
  title: string;
  description: string;
  tags: string[];
};

export type HistoryEntry = {
  videoId: string;
  title: string;
  thumbnailSrc: string;
  handle: string;
  watchedAt: string;
};

export type Subscription = {
  id: string;
  viewerId: string;
  creatorHandle: string;
  amountPaid: number;
  txHash: string;
  startsAt: string;
  expiresAt: string;
};

export type ViewerWallet = {
  walletId: string;
  address: string;
  balance: number;
  totalSpent: number;
};
