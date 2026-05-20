import { NextResponse } from "next/server";
import { updateCreatorTierRepo } from "@/lib/repository";

// POST /api/creator/settings — update creator tier settings
export async function POST(request: Request) {
  try {
    const { handle, isPaidTier, subscriptionPrice, ratePerSecond } = await request.json();
    if (!handle) return NextResponse.json({ error: "handle required" }, { status: 400 });

    await updateCreatorTierRepo(
      handle,
      Boolean(isPaidTier),
      isPaidTier && subscriptionPrice ? Number(subscriptionPrice) : null,
      Number(ratePerSecond) || 0.0001,
    );

    return NextResponse.json({ updated: true });
  } catch (e) {
    console.error("creator settings error", e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
