import { NextResponse } from "next/server";
import { toggleFollowRepo, checkFollowRepo, getFollowerCountRepo } from "@/lib/repository";

// POST /api/follows — toggle follow
export async function POST(request: Request) {
  const { viewerId, creatorHandle } = await request.json();
  if (!viewerId || !creatorHandle) return NextResponse.json({ error: "viewerId and creatorHandle required" }, { status: 400 });
  const following = await toggleFollowRepo(viewerId, creatorHandle);
  return NextResponse.json({ following });
}

// GET /api/follows?viewerId=xxx&creatorHandle=yyy
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const viewerId      = searchParams.get("viewerId");
  const creatorHandle = searchParams.get("creatorHandle");
  if (!creatorHandle) return NextResponse.json({ error: "creatorHandle required" }, { status: 400 });
  const count = await getFollowerCountRepo(creatorHandle);
  const following = viewerId ? await checkFollowRepo(viewerId, creatorHandle) : false;
  return NextResponse.json({ following, count });
}
