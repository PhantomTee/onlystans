import { NextResponse } from "next/server";
import { parseJson, rateLimit, requireSameOrigin } from "@/lib/api";
import { startStreamSchema } from "@/lib/schemas";
import { startStream } from "@/lib/store";

export async function POST(request: Request) {
  const sameOrigin = requireSameOrigin(request);
  if (sameOrigin) return sameOrigin;
  const limited = rateLimit(request, "stream:start", 120, 60_000);
  if (limited) return limited;
  const { data, response } = await parseJson(request, startStreamSchema);
  if (response) return response;
  const session = startStream({
    sessionId: data?.sessionId,
    videoId: data!.videoId,
    viewerWalletId: data!.viewerWalletId,
    creatorWalletId: data!.creatorWalletId,
    ratePerSecond: data!.ratePerSecond,
    balance: data!.balance,
  });
  return NextResponse.json({
    sessionId: session.sessionId,
    videoId: session.videoId,
    startedAt: new Date(session.startedAt).toISOString(),
    status: session.status,
    totalPaid: session.totalPaid,
    paymaster: process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS || "MOCK_PAYMASTER",
    fee: { type: "sponsored" },
  });
}
