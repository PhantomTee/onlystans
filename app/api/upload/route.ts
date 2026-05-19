import { NextResponse } from "next/server";
import { apiError, rateLimit, requireSameOrigin } from "@/lib/api";
import { uploadToIpfs } from "@/lib/ipfs";

export async function POST(request: Request) {
  const sameOrigin = requireSameOrigin(request);
  if (sameOrigin) return sameOrigin;
  const limited = rateLimit(request, "upload", 10, 60_000);
  if (limited) return limited;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return apiError("Missing file", 422);
  if (file.size > 100 * 1024 * 1024) return apiError("File exceeds 100MB limit", 413);
  if (file.type && file.type !== "video/mp4") return apiError("Only MP4 uploads are supported", 415);
  const name = file.name || "upload.mp4";
  if (!name.toLowerCase().endsWith(".mp4")) return apiError("Only .mp4 files are supported", 415);
  const result = await uploadToIpfs(file instanceof File ? file : { name });
  return NextResponse.json(result);
}
