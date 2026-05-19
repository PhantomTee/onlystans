import { NextResponse } from "next/server";
import { apiError, ok, parseJson, rateLimit, requireSameOrigin } from "@/lib/api";
import { createVideoRepo, listVideosRepo } from "@/lib/repository";
import { videoCreateSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  const sort = new URL(request.url).searchParams.get("sort") || "trending";
  return NextResponse.json({ videos: await listVideosRepo(sort) });
}

export async function POST(request: Request) {
  const sameOrigin = requireSameOrigin(request);
  if (sameOrigin) return sameOrigin;
  const limited = rateLimit(request, "videos:create", 20, 60_000);
  if (limited) return limited;
  const { data, response } = await parseJson(request, videoCreateSchema);
  if (response) return response;
  if (!data) return apiError("Invalid video payload");
  const video = await createVideoRepo(data);
  return ok({
    video,
    videoId: video.id,
    txHash: `0xregistry${Math.random().toString(16).slice(2)}`,
    contract: process.env.NEXT_PUBLIC_CONTENT_REGISTRY_ADDRESS || "MOCK_CONTENT_REGISTRY",
    active: true,
  });
}
