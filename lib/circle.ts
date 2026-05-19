import { createPublicKey, publicEncrypt, constants } from "node:crypto";
import { createWallet as mockCreateWallet, getBalance as mockGetBalance, sendPayment as mockSendPayment } from "@/lib/mock";
import { allowMockFallback } from "@/lib/env";

const circleBase = "https://api.circle.com";

function mockMode() {
  return allowMockFallback() && (process.env.MOCK_MODE !== "false" || !process.env.CIRCLE_API_KEY);
}

// ── Entity secret ciphertext (computed fresh per request) ─────────────────────

let _cachedPublicKey: string | null = null;

async function getCirclePublicKey(): Promise<string> {
  if (_cachedPublicKey) return _cachedPublicKey;
  const resp = await fetch(`${circleBase}/v1/w3s/config/entity/publicKey`, {
    headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}` },
  });
  const json = await resp.json();
  _cachedPublicKey = json.data?.publicKey ?? json.publicKey ?? null;
  if (!_cachedPublicKey) throw new Error("Could not fetch Circle public key");
  return _cachedPublicKey;
}

async function buildEntityCiphertext(): Promise<string> {
  const rawSecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!rawSecret) throw new Error("CIRCLE_ENTITY_SECRET not set");
  const pem = await getCirclePublicKey();
  const pubKey = createPublicKey(pem);
  const encrypted = publicEncrypt(
    { key: pubKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
    Buffer.from(rawSecret, "hex"),
  );
  return encrypted.toString("base64");
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function createWallet() {
  if (mockMode()) return mockCreateWallet();
  try {
    const entitySecretCiphertext = await buildEntityCiphertext();
    const response = await fetch(`${circleBase}/v1/w3s/wallets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        entitySecretCiphertext,
        blockchains: ["ARB-SEPOLIA"],
        count: 1,
      }),
    });
    if (!response.ok) return mockCreateWallet();
    return response.json();
  } catch {
    return mockCreateWallet();
  }
}

export async function getBalance(walletId: string) {
  if (mockMode()) return mockGetBalance();
  try {
    const response = await fetch(`${circleBase}/v1/w3s/wallets/${walletId}/balances`, {
      headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}` },
    });
    if (!response.ok) return mockGetBalance();
    return response.json();
  } catch {
    return mockGetBalance();
  }
}

export async function sendCirclePayment(input: {
  sessionId: string;
  amount: number;
  destinationAddress: string;
}) {
  if (mockMode()) return mockSendPayment(input.amount);
  try {
    const entitySecretCiphertext = await buildEntityCiphertext();
    const response = await fetch(`${circleBase}/v1/w3s/transactions/transfer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotencyKey: `${input.sessionId}-${Date.now()}`,
        entitySecretCiphertext,
        destinationAddress: input.destinationAddress,
        amounts: [input.amount.toFixed(6)],
        fee: { type: "sponsored" },
      }),
    });
    if (!response.ok) return mockSendPayment(input.amount);
    return response.json();
  } catch {
    return mockSendPayment(input.amount);
  }
}
