import { NextResponse } from "next/server";
import { createWallet } from "@/lib/circle";
import { upsertViewerBalanceRepo, getViewerBalanceRepo } from "@/lib/repository";

// POST /api/wallets — onboard viewer, create Circle wallet, return wallet info
export async function POST(request: Request) {
  try {
    const { viewerId } = await request.json();
    if (!viewerId) return NextResponse.json({ error: "viewerId required" }, { status: 400 });

    // Check if already has a wallet
    const existing = await getViewerBalanceRepo(viewerId);
    if (existing) return NextResponse.json(existing);

    // Create Circle developer-controlled wallet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await createWallet() as any;
    const wallet = result?.wallets?.[0] ?? result?.wallet ?? result;
    const address: string = wallet?.address ?? wallet?.walletAddress ?? `0x${viewerId.replace(/-/g, "").slice(0, 40)}`;
    const walletId: string = wallet?.id ?? viewerId;

    await upsertViewerBalanceRepo(walletId, address, 0);
    return NextResponse.json({ walletId, address, balance: 0, totalSpent: 0 });
  } catch (e) {
    console.error("wallet onboard error", e);
    return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 });
  }
}

// GET /api/wallets?viewerId=xxx — fetch wallet + balance
export async function GET(request: Request) {
  const viewerId = new URL(request.url).searchParams.get("viewerId");
  if (!viewerId) return NextResponse.json({ error: "viewerId required" }, { status: 400 });
  const wallet = await getViewerBalanceRepo(viewerId);
  if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  return NextResponse.json(wallet);
}
