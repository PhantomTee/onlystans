import { NextResponse } from "next/server";
import { parseJson, rateLimit, requireSameOrigin } from "@/lib/api";
import { autoTag } from "@/lib/openrouter";
import { tagSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const sameOrigin = requireSameOrigin(request);
  if (sameOrigin) return sameOrigin;
  const limited = rateLimit(request, "agent:tag", 30, 60_000);
  if (limited) return limited;
  const { data, response } = await parseJson(request, tagSchema);
  if (response) return response;
  return NextResponse.json(await autoTag(data!.filename, data!.notes || ""));
}
