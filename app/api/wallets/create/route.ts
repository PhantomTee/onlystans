import { NextResponse } from "next/server";
import { rateLimit, requireSameOrigin } from "@/lib/api";
import { createWallet } from "@/lib/circle";

export async function POST(request: Request) {
  const sameOrigin = requireSameOrigin(request);
  if (sameOrigin) return sameOrigin;
  const limited = rateLimit(request, "wallet:create", 10, 60_000);
  if (limited) return limited;
  return NextResponse.json(await createWallet());
}
