import { NextResponse } from "next/server";
import { getBalance } from "@/lib/circle";

export async function GET(request: Request) {
  const walletId = new URL(request.url).searchParams.get("walletId") || "mock_viewer";
  return NextResponse.json(await getBalance(walletId));
}
