import {
  initiateDeveloperControlledWalletsClient,
} from "@circle-fin/developer-controlled-wallets";
import {
  createWallet as mockCreateWallet,
  getBalance as mockGetBalance,
  sendPayment as mockSendPayment,
} from "@/lib/mock";
import { allowMockFallback } from "@/lib/env";

const circleBase = "https://api.circle.com";

// ARB-SEPOLIA USDC token ID (Circle's canonical ID for this token)
const ARB_SEPOLIA_USDC_TOKEN_ID = "5797fbd6-3795-519d-84ca-ec4c5f80c3b1";

function mockMode() {
  return allowMockFallback() && (process.env.MOCK_MODE !== "false" || !process.env.CIRCLE_API_KEY);
}

function getClient() {
  const apiKey       = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey || !entitySecret) throw new Error("CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET not set");
  return initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function createWallet() {
  if (mockMode()) return mockCreateWallet();
  try {
    const client = getClient();

    // 1. Create a wallet set first (required by Circle)
    const wsResp = await client.createWalletSet({
      name: `OnlyStans-${Date.now()}`,
      idempotencyKey: crypto.randomUUID(),
    });
    const walletSetId = wsResp.data?.walletSet?.id;
    if (!walletSetId) return mockCreateWallet();

    // 2. Create a wallet inside that set
    const wResp = await client.createWallets({
      idempotencyKey: crypto.randomUUID(),
      walletSetId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blockchains: ["ARB-SEPOLIA"] as any,
      count: 1,
    });
    return wResp.data;
  } catch {
    return mockCreateWallet();
  }
}

export async function getBalance(walletId: string) {
  if (mockMode()) return mockGetBalance();
  try {
    const resp = await fetch(`${circleBase}/v1/w3s/wallets/${walletId}/balances`, {
      headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}` },
    });
    if (!resp.ok) return mockGetBalance();
    return resp.json();
  } catch {
    return mockGetBalance();
  }
}

export async function sendCirclePayment(input: {
  sessionId: string;
  amount: number;
  destinationAddress: string;
  walletId?: string;
}): Promise<{ txHash: string; amount: number }> {
  if (mockMode()) return mockSendPayment(input.amount);

  // Require a source Circle wallet ID to execute a real transfer
  const sourceWalletId = input.walletId ?? process.env.CIRCLE_SOURCE_WALLET_ID;
  if (!sourceWalletId) return mockSendPayment(input.amount);

  try {
    const client = getClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = await (client.createTransaction as any)({
      idempotencyKey: `${input.sessionId}-${Date.now()}`,
      walletId: sourceWalletId,
      destinationAddress: input.destinationAddress,
      blockchain: "ARB-SEPOLIA",
      tokenId: ARB_SEPOLIA_USDC_TOKEN_ID,
      amounts: [input.amount.toFixed(6)],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx = (resp.data as any)?.transaction ?? (resp.data as any);
    return {
      txHash: tx?.txHash ?? tx?.transactionId ?? tx?.id ?? `0x${crypto.randomUUID().replace(/-/g, "")}`,
      amount: input.amount,
    };
  } catch {
    return mockSendPayment(input.amount);
  }
}
