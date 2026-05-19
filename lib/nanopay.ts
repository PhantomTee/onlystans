import { sendCirclePayment } from "@/lib/circle";

export function createSession(videoId: string) {
  return {
    sessionId: `stream_${videoId}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    videoId,
    startedAt: new Date().toISOString(),
    status: "playing" as const,
  };
}

export async function heartbeatPayment(input: { sessionId: string; amount: number; creatorWalletId: string }) {
  return sendCirclePayment({
    sessionId: input.sessionId,
    amount: input.amount,
    destinationAddress: input.creatorWalletId,
  });
}
