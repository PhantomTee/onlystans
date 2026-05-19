import type { HistoryEntry } from "@/types";

// ─── Follow system ───────────────────────────────────────────────────────────

export function getFollows(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("os_follows") || "[]");
  } catch {
    return [];
  }
}

export function isFollowing(handle: string): boolean {
  return getFollows().includes(handle);
}

/** Returns new following state (true = now following). */
export function toggleFollow(handle: string): boolean {
  const follows = getFollows();
  const following = follows.includes(handle);
  const next = following
    ? follows.filter((h) => h !== handle)
    : [...follows, handle];
  localStorage.setItem("os_follows", JSON.stringify(next));
  return !following;
}

// ─── Watch history ────────────────────────────────────────────────────────────

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("os_history") || "[]");
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<HistoryEntry, "watchedAt">): void {
  if (typeof window === "undefined") return;
  const history = getHistory().filter((h) => h.videoId !== entry.videoId);
  history.unshift({ ...entry, watchedAt: new Date().toISOString() });
  localStorage.setItem("os_history", JSON.stringify(history.slice(0, 20)));
}

// ─── Referral tracking ───────────────────────────────────────────────────────

export function getReferrer(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("os_referrer");
}

/** Only stores the first referrer — ignores subsequent calls. */
export function setReferrerOnce(handle: string): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("os_referrer")) {
    localStorage.setItem("os_referrer", handle);
  }
}

export function buildReferralUrl(handle: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/?ref=${handle}`;
}
