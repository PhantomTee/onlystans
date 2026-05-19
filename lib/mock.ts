import type { TagResult, Transaction, Video } from "@/types";

export const MOCK_VIDEO_SRC = "https://www.w3schools.com/html/mov_bbb.mp4";
function thumb(title: string, accent = "#2dd4bf") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#07110f"/><stop offset="1" stop-color="#18181b"/></linearGradient></defs><rect width="1200" height="675" fill="url(#g)"/><circle cx="960" cy="120" r="220" fill="${accent}" opacity=".18"/><rect x="72" y="72" width="1056" height="531" rx="28" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2"/><text x="88" y="525" fill="white" font-family="Arial, sans-serif" font-size="64" font-weight="700">${title}</text><text x="88" y="575" fill="${accent}" font-family="Arial, sans-serif" font-size="28" font-weight="700">ONLYSTANS / USDC PER SECOND</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const hash = (prefix: string) => `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;

export const mockVideos: Video[] = [
  {
    id: "vid_arcflow_001",
    title: "Arc Flow Warmup",
    description: "A crisp movement study with pay-per-second creator support.",
    creator: {
      handle: "maya",
      name: "Maya Flux",
      avatar: "MF",
      walletId: "creator_wallet_maya",
      walletAddress: "0x8a1A7dCafE000000000000000000000000000001",
      bio: "Motion loops, studio notes, and microscopic pricing experiments.",
    },
    videoCid: "bafybeimockarcflow",
    thumbnailCid: "bafybeimockthumb1",
    videoSrc: MOCK_VIDEO_SRC,
    thumbnailSrc: thumb("Arc Flow Warmup"),
    tags: ["movement", "studio", "arc"],
    chapters: [
      { title: "Intro",           time: 0  },
      { title: "Flow sequence 1", time: 5  },
      { title: "Break",           time: 11 },
      { title: "Flow sequence 2", time: 17 },
      { title: "Outro",           time: 25 },
    ],
    ratePerSecond: 0.000001,
    totalEarned: 12.431202,
    totalWatchSeconds: 18420,
    liveViewers: 7,
    createdAt: "2026-05-11T13:00:00Z",
  },
  {
    id: "vid_noads_002",
    title: "No Ads Cut",
    description: "A creator-first clip about direct USDC attention streams.",
    creator: {
      handle: "rio",
      name: "Rio Vale",
      avatar: "RV",
      walletId: "creator_wallet_rio",
      walletAddress: "0x8a1A7dCafE000000000000000000000000000002",
      bio: "Short essays, clean edits, and decentralized video experiments.",
    },
    videoCid: "bafybeimocknoads",
    thumbnailCid: "bafybeimockthumb2",
    videoSrc: MOCK_VIDEO_SRC,
    thumbnailSrc: thumb("No Ads Cut", "#a7f3d0"),
    tags: ["essay", "creator", "usdc"],
    ratePerSecond: 0.00001,
    totalEarned: 42.10004,
    totalWatchSeconds: 32110,
    liveViewers: 12,
    createdAt: "2026-05-13T09:30:00Z",
  },
  {
    id: "vid_micro_003",
    title: "Micro Price Test",
    description: "A premium workflow demo priced by the second.",
    creator: {
      handle: "sana",
      name: "Sana Kepler",
      avatar: "SK",
      walletId: "creator_wallet_sana",
      walletAddress: "0x8a1A7dCafE000000000000000000000000000003",
      bio: "Teaching practical crypto UX in compact video lessons.",
    },
    videoCid: "bafybeimockmicro",
    thumbnailCid: "bafybeimockthumb3",
    videoSrc: MOCK_VIDEO_SRC,
    thumbnailSrc: thumb("Micro Price Test", "#5eead4"),
    tags: ["tutorial", "wallet", "payments"],
    ratePerSecond: 0.0001,
    totalEarned: 103.987654,
    totalWatchSeconds: 55120,
    liveViewers: 3,
    createdAt: "2026-05-14T17:10:00Z",
  },
  {
    id: "vid_cctp_004",
    title: "CCTP Studio Payout",
    description: "A behind-the-scenes look at cross-chain creator withdrawal flows.",
    creator: {
      handle: "niko",
      name: "Niko Chain",
      avatar: "NC",
      walletId: "creator_wallet_niko",
      walletAddress: "0x8a1A7dCafE000000000000000000000000000004",
      bio: "Infrastructure explainers for people who like receipts.",
    },
    videoCid: "bafybeimockcctp",
    thumbnailCid: "bafybeimockthumb4",
    videoSrc: MOCK_VIDEO_SRC,
    thumbnailSrc: thumb("CCTP Payout", "#99f6e4"),
    tags: ["cctp", "withdraw", "infra"],
    nftGated: true,
    subscriptionRate: 4.99,
    ratePerSecond: 0.001,
    totalEarned: 331.442001,
    totalWatchSeconds: 8450,
    liveViewers: 1,
    createdAt: "2026-05-15T12:00:00Z",
  },
  {
    id: "vid_pinata_005",
    title: "Pinata Clip Drop",
    description: "A tiny video release stored on IPFS and monetized live.",
    creator: {
      handle: "lyra",
      name: "Lyra Node",
      avatar: "LN",
      walletId: "creator_wallet_lyra",
      walletAddress: "0x8a1A7dCafE000000000000000000000000000005",
      bio: "Publishing experiments for independent creators.",
    },
    videoCid: "bafybeimockpinata",
    thumbnailCid: "bafybeimockthumb5",
    videoSrc: MOCK_VIDEO_SRC,
    thumbnailSrc: thumb("Pinata Clip Drop", "#ccfbf1"),
    tags: ["ipfs", "publishing", "clip"],
    ratePerSecond: 0.00001,
    totalEarned: 76.220091,
    totalWatchSeconds: 44990,
    liveViewers: 9,
    createdAt: "2026-05-16T08:45:00Z",
  },
];

export async function createWallet() {
  await wait(300);
  return { walletId: hash("wallet"), address: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, "0")}` };
}

export async function getBalance() {
  await wait(300);
  return { balance: Number((10 + Math.random() * 90).toFixed(6)), symbol: "USDC" };
}

export async function sendPayment(amount: number) {
  await wait(1000);
  return { txHash: hash("0xpay"), amount: Number(amount.toFixed(6)), fee: { type: "sponsored" } };
}

export async function uploadToIpfs(filename: string) {
  await wait(2000);
  return { cid: `bafy${hash("mockcid")}`, src: MOCK_VIDEO_SRC, filename };
}

export async function cctpBridge() {
  await wait(3000);
  return { attestation: hash("attestation"), messageHash: hash("0xmsg"), status: "complete" };
}

export function autoTag(filename: string): TagResult {
  const cleaned = filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Untitled clip";
  const title = cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 60);
  return {
    title,
    description: `${title} is a short creator clip prepared for pay-per-second USDC streaming.`.slice(0, 200),
    tags: Array.from(new Set(cleaned.toLowerCase().split(/\s+/).filter(Boolean))).slice(0, 3).concat(["creator", "clip"]).slice(0, 5),
  };
}

export const mockTransactions: Transaction[] = Array.from({ length: 20 }, (_, index) => ({
  id: `tx_${index}`,
  kind: index % 5 === 0 ? "tip" : "stream",
  amount: Number((0.0004 + index * 0.003).toFixed(6)),
  txHash: hash("0xmock"),
  createdAt: new Date(Date.now() - index * 3600_000).toISOString(),
}));
