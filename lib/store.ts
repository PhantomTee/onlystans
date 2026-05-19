import type { Transaction, Video } from "@/types";
import { mockTransactions, mockVideos } from "@/lib/mock";

type Stream = {
  sessionId: string;
  videoId: string;
  viewerWalletId: string;
  creatorWalletId: string;
  ratePerSecond: number;
  balance?: number;
  status: "playing" | "paused" | "stopped";
  startedAt: number;
  lastAccountedAt: number;
  totalPaid: number;
  idempotencyKeys: Set<string>;
};

type StoreState = {
  videos: Video[];
  streams: Map<string, Stream>;
  transactions: Transaction[];
};

const globalState = globalThis as typeof globalThis & { __onlystansStore?: StoreState };

function state() {
  globalState.__onlystansStore ??= {
    videos: [...mockVideos],
    streams: new Map(),
    transactions: [...mockTransactions],
  };
  return globalState.__onlystansStore;
}

export function listVideos(sort = "trending") {
  const videos = [...state().videos];
  if (sort === "cheapest") return videos.sort((a, b) => a.ratePerSecond - b.ratePerSecond);
  if (sort === "new") return videos.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return videos.sort((a, b) => b.liveViewers + b.totalWatchSeconds / 10000 - (a.liveViewers + a.totalWatchSeconds / 10000));
}

export function getVideo(videoId: string) {
  return state().videos.find((video) => video.id === videoId);
}

export function createVideo(input: Omit<Video, "id" | "creator" | "createdAt" | "totalEarned" | "totalWatchSeconds" | "liveViewers" | "thumbnailSrc" | "videoSrc"> & { src: string }) {
  const video: Video = {
    id: `vid_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title: input.title,
    description: input.description,
    tags: input.tags,
    ratePerSecond: input.ratePerSecond,
    videoCid: input.videoCid,
    thumbnailCid: input.thumbnailCid,
    videoSrc: input.src,
    thumbnailSrc: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#09090b"/><circle cx="960" cy="120" r="220" fill="#2dd4bf" opacity=".18"/><text x="80" y="540" fill="white" font-family="Arial" font-size="64" font-weight="700">${input.title}</text></svg>`)}`,
    totalEarned: 0,
    totalWatchSeconds: 0,
    liveViewers: 0,
    createdAt: new Date().toISOString(),
    creator: mockVideos[0].creator,
  };
  state().videos.unshift(video);
  return video;
}

export function startStream(input: Omit<Stream, "sessionId" | "status" | "startedAt" | "lastAccountedAt" | "totalPaid" | "idempotencyKeys"> & { sessionId?: string }) {
  const now = Date.now();
  const existing = input.sessionId ? state().streams.get(input.sessionId) : undefined;
  if (existing && existing.status !== "stopped") {
    existing.status = "playing";
    existing.lastAccountedAt = now;
    return existing;
  }
  const sessionId = input.sessionId || `stream_${input.videoId}_${now}_${Math.random().toString(16).slice(2)}`;
  const stream: Stream = { ...input, sessionId, status: "playing", startedAt: now, lastAccountedAt: now, totalPaid: 0, idempotencyKeys: new Set() };
  state().streams.set(sessionId, stream);
  const video = getVideo(input.videoId);
  if (video) video.liveViewers += 1;
  return stream;
}

export function pauseStream(sessionId: string) {
  const stream = state().streams.get(sessionId);
  if (!stream || stream.status === "stopped") return stream;
  stream.status = "paused";
  return stream;
}

export function stopStream(sessionId: string) {
  const stream = state().streams.get(sessionId);
  if (!stream) return stream;
  if (stream.status !== "stopped") {
    const video = getVideo(stream.videoId);
    if (video) video.liveViewers = Math.max(0, video.liveViewers - 1);
  }
  stream.status = "stopped";
  return stream;
}

export function accountHeartbeat(sessionId: string, idempotencyKey: string) {
  const stream = state().streams.get(sessionId);
  if (!stream) return { stream: null, amount: 0, duplicate: false };
  if (stream.idempotencyKeys.has(idempotencyKey)) return { stream, amount: 0, duplicate: true };
  stream.idempotencyKeys.add(idempotencyKey);
  if (stream.status !== "playing") return { stream, amount: 0, duplicate: false };
  const now = Date.now();
  const elapsedSeconds = Math.min(30, Math.max(0, (now - stream.lastAccountedAt) / 1000));
  stream.lastAccountedAt = now;
  const rawAmount = elapsedSeconds * stream.ratePerSecond;
  const remaining = typeof stream.balance === "number" ? Math.max(0, stream.balance - stream.totalPaid) : rawAmount;
  const amount = Number(Math.min(rawAmount, remaining).toFixed(6));
  stream.totalPaid = Number((stream.totalPaid + amount).toFixed(6));
  const video = getVideo(stream.videoId);
  if (video) {
    video.totalEarned = Number((video.totalEarned + amount).toFixed(6));
    video.totalWatchSeconds += Math.round(elapsedSeconds);
  }
  return { stream, amount, duplicate: false };
}

export function addTransaction(tx: Transaction) {
  state().transactions.unshift(tx);
  state().transactions = state().transactions.slice(0, 100);
  return tx;
}

export function listTransactions(limit = 20) {
  return state().transactions.slice(0, limit);
}
