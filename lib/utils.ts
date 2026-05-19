import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function usd(value: number, digits = 6) {
  return `$${value.toFixed(digits)}`;
}

export function ratePerMinute(ratePerSecond: number) {
  return ratePerSecond * 60;
}

export function estimatedMonthly(ratePerSecond: number) {
  return ratePerSecond * 60 * 5 * 1000 * 30;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatWatchSeconds(seconds: number): string {
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

/** Generates deterministic-ish sparkline data points for a total earned value. */
export function generateSparklineData(total: number, points = 14): number[] {
  const data: number[] = [];
  for (let i = 0; i < points - 1; i++) {
    const progress = i / (points - 1);
    // curve: slow start, accelerating toward end, with gentle sine variation
    const curve = Math.pow(progress, 1.6);
    const variation = Math.sin(i * 1.9 + total * 0.01) * 0.08;
    data.push(Math.max(0, total * (curve + variation)));
  }
  data.push(total);
  return data;
}
