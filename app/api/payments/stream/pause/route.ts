import { NextResponse } from "next/server";
import { parseJson, rateLimit, requireSameOrigin } from "@/lib/api";
import { sessionSchema } from "@/lib/schemas";
import { heartbeatPayment } from "@/lib/nanopay";
import { addTransactionRepo } from "@/lib/repository";
import { accountHeartbeat, pauseStream } from "@/lib/store";

export async function POST(request: Request) {
  const sameOrigin = requireSameOrigin(request);
  if (sameOrigin) return sameOrigin;
  const limited = rateLimit(request, "stream:pause", 180, 60_000);
  if (limited) return limited;
  const { data, response } = await parseJson(request, sessionSchema);
  if (response) return response;
  const accounted = accountHeartbeat(data!.sessionId, `${data!.sessionId}:pause:${Date.now()}`);
  let settled = null;
  if (accounted.stream && accounted.amount > 0) {
    settled = await heartbeatPayment({ sessionId: data!.sessionId, amount: accounted.amount, creatorWalletId: accounted.stream.creatorWalletId });
    await addTransactionRepo({ id: `pause_${Date.now()}`, kind: "stream", amount: accounted.amount, txHash: settled.txHash, createdAt: new Date().toISOString() });
  }
  const stream = pauseStream(data!.sessionId);
  return NextResponse.json({ sessionId: data!.sessionId, status: stream?.status || "missing", settledAmount: accounted.amount, totalPaid: accounted.stream?.totalPaid || 0, pausedAt: new Date().toISOString() });
}
