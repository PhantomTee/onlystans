import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: { message, details } }, { status });
}

export async function parseJson<T>(request: Request, schema: ZodSchema<T>) {
  try {
    const body = await request.json();
    return { data: schema.parse(body), response: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return { data: null, response: apiError("Invalid request payload", 422, error.flatten()) };
    }
    return { data: null, response: apiError("Invalid JSON payload", 400) };
  }
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(request: Request, key: string, limit: number, windowMs: number) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return null;
  }
  bucket.count += 1;
  if (bucket.count > limit) return apiError("Rate limit exceeded", 429);
  return null;
}

export function requireSameOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return apiError("Cross-origin mutation blocked", 403);
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const requestUrl = new URL(request.url);
  const originUrl = new URL(origin);
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  const sameLocalhost = localHosts.has(originUrl.hostname) && localHosts.has(requestUrl.hostname) && originUrl.port === requestUrl.port;
  if (originUrl.host !== requestUrl.host && !sameLocalhost) return apiError("Cross-origin mutation blocked", 403);
  return null;
}
