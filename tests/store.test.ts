import { describe, expect, it, vi } from "vitest";
import { accountHeartbeat, pauseStream, startStream } from "@/lib/store";

describe("stream accounting", () => {
  it("calculates heartbeat amounts on the server and deduplicates idempotency keys", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-17T00:00:00Z"));
    const stream = startStream({
      videoId: "vid_arcflow_001",
      viewerWalletId: "viewer",
      creatorWalletId: "0x8a1A7dCafE000000000000000000000000000001",
      ratePerSecond: 0.0001,
      balance: 1,
    });
    vi.advanceTimersByTime(10_000);
    const first = accountHeartbeat(stream.sessionId, "beat-1");
    const duplicate = accountHeartbeat(stream.sessionId, "beat-1");
    expect(first.amount).toBe(0.001);
    expect(first.stream?.totalPaid).toBe(0.001);
    expect(duplicate.amount).toBe(0);
    expect(duplicate.duplicate).toBe(true);
    vi.useRealTimers();
  });

  it("stops accounting while paused", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-17T00:01:00Z"));
    const stream = startStream({
      videoId: "vid_arcflow_001",
      viewerWalletId: "viewer",
      creatorWalletId: "0x8a1A7dCafE000000000000000000000000000001",
      ratePerSecond: 0.001,
      balance: 1,
    });
    pauseStream(stream.sessionId);
    vi.advanceTimersByTime(20_000);
    const result = accountHeartbeat(stream.sessionId, "paused-beat");
    expect(result.amount).toBe(0);
    expect(result.stream?.totalPaid).toBe(0);
    vi.useRealTimers();
  });

  it("caps payment at the supplied balance", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-17T00:02:00Z"));
    const stream = startStream({
      videoId: "vid_arcflow_001",
      viewerWalletId: "viewer",
      creatorWalletId: "0x8a1A7dCafE000000000000000000000000000001",
      ratePerSecond: 0.001,
      balance: 0.005,
    });
    vi.advanceTimersByTime(10_000);
    const result = accountHeartbeat(stream.sessionId, "balance-cap");
    expect(result.amount).toBe(0.005);
    expect(result.stream?.totalPaid).toBe(0.005);
    vi.useRealTimers();
  });
});
