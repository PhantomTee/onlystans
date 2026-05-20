import { NextResponse } from "next/server";
import { sendCirclePayment } from "@/lib/circle";
import { createSubscriptionRepo, checkSubscriptionRepo, listSubscriptionsRepo, getCreatorByHandleRepo } from "@/lib/repository";

// POST /api/subscriptions — subscribe to a creator
export async function POST(request: Request) {
  try {
    const { viewerWalletId, creatorHandle, durationDays = 30 } = await request.json();
    if (!viewerWalletId || !creatorHandle) {
      return NextResponse.json({ error: "viewerWalletId and creatorHandle required" }, { status: 400 });
    }

    // Check already subscribed
    const alreadySubbed = await checkSubscriptionRepo(viewerWalletId, creatorHandle);
    if (alreadySubbed) {
      return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }

    // Get creator pricing
    const creator = await getCreatorByHandleRepo(creatorHandle);
    if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    if (!creator.isPaidTier) return NextResponse.json({ error: "Creator is free — no subscription needed" }, { status: 400 });

    const price = creator.subscriptionPrice ?? 5; // default 5 USDC/month

    // Execute Circle nanopayment: viewer wallet → creator wallet
    const payment = await sendCirclePayment({
      sessionId: `sub_${creatorHandle}_${viewerWalletId}_${Date.now()}`,
      amount: price,
      destinationAddress: creator.walletAddress,
      walletId: viewerWalletId,
    });

    // Record subscription
    const sub = await createSubscriptionRepo({
      viewerId: viewerWalletId,
      creatorHandle,
      amountPaid: price,
      txHash: payment.txHash,
      durationDays,
    });

    return NextResponse.json({ subscribed: true, expiresAt: sub.expiresAt, txHash: payment.txHash, price });
  } catch (e) {
    console.error("subscribe error", e);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}

// GET /api/subscriptions?viewerId=xxx&creatorHandle=yyy
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const viewerId      = searchParams.get("viewerId");
  const creatorHandle = searchParams.get("creatorHandle");

  if (!viewerId) return NextResponse.json({ error: "viewerId required" }, { status: 400 });

  if (creatorHandle) {
    const active = await checkSubscriptionRepo(viewerId, creatorHandle);
    return NextResponse.json({ subscribed: active });
  }

  const subs = await listSubscriptionsRepo(viewerId);
  return NextResponse.json({ subscriptions: subs });
}
