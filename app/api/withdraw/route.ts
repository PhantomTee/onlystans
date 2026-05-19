import { NextResponse } from "next/server";
import { parseJson, rateLimit, requireSameOrigin } from "@/lib/api";
import { cctpBridge } from "@/lib/cctp";
import { addTransactionRepo } from "@/lib/repository";
import { withdrawSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const sameOrigin = requireSameOrigin(request);
  if (sameOrigin) return sameOrigin;
  const limited = rateLimit(request, "withdraw", 10, 60_000);
  if (limited) return limited;
  const { data, response } = await parseJson(request, withdrawSchema);
  if (response) return response;
  const result = await cctpBridge(data!);
  await addTransactionRepo({ id: `withdraw_${Date.now()}`, kind: "withdraw", amount: data!.amount, txHash: result.messageHash || result.attestation, createdAt: new Date().toISOString() });
  return NextResponse.json(result);
}
