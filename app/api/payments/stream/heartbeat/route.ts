import { NextResponse } from "next/server";
import { heartbeatPayment } from "@/lib/nanopay";
import { apiError, parseJson, rateLimit, requireSameOrigin } from "@/lib/api";
import { heartbeatSchema } from "@/lib/schemas";
import { addTransactionRepo } from "@/lib/repository";
import { accountHeartbeat } from "@/lib/store";

export async function POST(request: Request) {
  const sameOrigin = requireSameOrigin(request);
  if (sameOrigin) return sameOrigin;
  const limited = rateLimit(request, "stream:heartbeat", 240, 60_000);
  if (limited) return limited;
  const { data, response } = await parseJson(request, heartbeatSchema);
  if (response) return response;
  const idempotencyKey = data!.idempotencyKey || `${data!.sessionId}:${Math.floor(Date.now() / 10_000)}`;
  const accounted = accountHeartbeat(data!.sessionId, idempotencyKey);
  if (!accounted.stream) return apiError("Unknown stream session", 404);
  if (accounted.duplicate || accounted.amount === 0) {
    return NextResponse.json({ sessionId: data!.sessionId, amount: 0, totalPaid: accounted.stream.totalPaid, duplicate: accounted.duplicate, status: accounted.stream.status });
  }
  const payment = await heartbeatPayment({ sessionId: data!.sessionId, amount: accounted.amount, creatorWalletId: accounted.stream.creatorWalletId });
  await addTransactionRepo({ id: idempotencyKey, kind: "stream", amount: accounted.amount, txHash: payment.txHash, createdAt: new Date().toISOString() });
  return NextResponse.json({ ...payment, amount: accounted.amount, totalPaid: accounted.stream.totalPaid, status: "settled" });
}
