"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { PaymentTicker } from "@/components/PaymentTicker";
import { VideoChapters } from "@/components/VideoChapters";
import { addToHistory } from "@/lib/localStorage";
import { formatDuration } from "@/lib/utils";
import type { Video } from "@/types";

export function VideoPlayer({ video, balance }: { video: Video; balance: number }) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const sessionRef  = useRef<string>("");
  const heartbeatRef = useRef<number | null>(null);

  const [playing,   setPlaying]   = useState(false);
  const [muted,     setMuted]     = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);

  const post = useCallback(
    (url: string, body: object) =>
      fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    [],
  );

  const start = useCallback(async () => {
    addToHistory({ videoId: video.id, title: video.title, thumbnailSrc: video.thumbnailSrc, handle: video.creator.handle });

    if (sessionRef.current) {
      await post("/api/payments/stream/start", {
        sessionId: sessionRef.current, videoId: video.id,
        viewerWalletId: "mock_viewer", creatorWalletId: video.creator.walletAddress,
        ratePerSecond: video.ratePerSecond, balance,
      });
    } else {
      const resp = await post("/api/payments/stream/start", {
        videoId: video.id, viewerWalletId: "mock_viewer",
        creatorWalletId: video.creator.walletAddress,
        ratePerSecond: video.ratePerSecond, balance,
      });
      const data = await resp.json();
      sessionRef.current = data.sessionId;
    }
    setPlaying(true);
  }, [balance, post, video]);

  const pause = useCallback(async () => {
    if (!sessionRef.current) return;
    const resp = await post("/api/payments/stream/pause", { sessionId: sessionRef.current });
    const data = await resp.json();
    if (typeof data.totalPaid === "number") setTotalPaid(data.totalPaid);
    setPlaying(false);
  }, [post]);

  const stop = useCallback(async () => {
    if (!sessionRef.current) return;
    const resp = await post("/api/payments/stream/stop", { sessionId: sessionRef.current });
    const data = await resp.json();
    if (typeof data.totalPaid === "number") setTotalPaid(data.totalPaid);
    setPlaying(false);
    sessionRef.current = "";
  }, [post]);

  const heartbeat = useCallback(async () => {
    if (!sessionRef.current || !videoRef.current || videoRef.current.paused) return;
    const resp = await post("/api/payments/stream/heartbeat", {
      sessionId: sessionRef.current,
      idempotencyKey: `${sessionRef.current}:${Math.floor(Date.now() / 10_000)}`,
    });
    const data = await resp.json();
    if (typeof data.totalPaid === "number") setTotalPaid(data.totalPaid);
  }, [post]);

  useEffect(() => {
    if (playing) heartbeatRef.current = window.setInterval(heartbeat, 10_000);
    return () => { if (heartbeatRef.current) window.clearInterval(heartbeatRef.current); };
  }, [heartbeat, playing]);

  useEffect(() => {
    function onVisibility() {
      if (document.hidden) { videoRef.current?.pause(); pause(); }
      else if (videoRef.current && sessionRef.current) { videoRef.current.play(); start(); }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pause, start]);

  function togglePlay() {
    if (videoRef.current?.paused) videoRef.current.play();
    else videoRef.current?.pause();
  }

  function toggleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }

  function seekTo(t: number) {
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
  }

  function openFullscreen() {
    videoRef.current?.requestFullscreen?.();
  }

  return (
    <div className="space-y-3">
      {/* Video container */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black shadow-2xl shadow-black/60">
        <video
          ref={videoRef}
          className="aspect-video w-full bg-black"
          src={video.videoSrc}
          poster={video.thumbnailSrc}
          controls={false}
          playsInline
          onPlay={start}
          onPause={pause}
          onEnded={stop}
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        />

        {/* Custom controls bar */}
        <div className="flex items-center gap-3 border-t border-white/[0.06] bg-zinc-950/80 px-4 py-2.5">
          {/* Play / pause */}
          <button
            onClick={togglePlay}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-zinc-950 transition hover:bg-zinc-200 active:scale-95"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-0.5" />}
          </button>

          {/* Scrubber */}
          <div className="relative flex-1 group">
            <div className="h-1 overflow-hidden rounded-full bg-white/10 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seekTo(((e.clientX - rect.left) / rect.width) * duration);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-teal-300 transition-all duration-150"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Time */}
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-500">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>

          {/* Mute */}
          <button onClick={toggleMute} className="text-zinc-500 transition hover:text-zinc-200">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Rate */}
          <span className="hidden font-mono text-[11px] text-zinc-600 sm:block">
            {video.ratePerSecond.toFixed(6)} USDC/s
          </span>

          {/* Fullscreen */}
          <button onClick={openFullscreen} className="text-zinc-600 transition hover:text-zinc-300">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Chapters */}
      {video.chapters && video.chapters.length > 0 && (
        <div className="glass rounded-xl p-3">
          <VideoChapters
            chapters={video.chapters}
            duration={duration}
            currentTime={currentTime}
            onSeek={seekTo}
          />
        </div>
      )}

      {/* Payment ticker */}
      <PaymentTicker
        totalPaid={totalPaid}
        ratePerSecond={video.ratePerSecond}
        balance={Math.max(0, balance - totalPaid)}
        playing={playing}
      />
    </div>
  );
}
