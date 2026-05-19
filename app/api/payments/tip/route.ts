import { NextResponse } from "next/server";
import { parseJson, rateLimit, requireSameOrigin } from "@/lib/api";
import { sendCirclePayment } from "@/lib/circle";
import { addTransactionRepo } from "@/lib/repository";
import { tipSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const sameOrigin = requireSameOrigin(request);
  if (sameOrigin) return sameOrigin;
  const limited = rateLimit(request, "payments:tip", 30, 60_000);
  if (limited) return limited;
  const { data, response } = await parseJson(request, tipSchema);
  if (response) return response;
  const payment = await sendCirclePayment({ sessionId: `tip_${data!.videoId}_${Date.now()}`, amount: data!.amount, destinationAddress: data!.creatorWalletId });
  await addTransactionRepo({ id: `tip_${Date.now()}`, kind: "tip", amount: data!.amount, txHash: payment.txHash, createdAt: new Date().toISOString() });
  return NextResponse.json({ ...payment, status: "confirmed" });
}
