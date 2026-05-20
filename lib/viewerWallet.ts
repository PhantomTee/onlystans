"use client";
// Viewer's Circle wallet identity — stored in localStorage, created once on first visit

const KEY = "os_viewer_wallet";

export type StoredWallet = {
  walletId: string;
  address: string;
  balance: number;
};

export function getStoredWallet(): StoredWallet | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveWallet(w: StoredWallet) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(w));
}

export function clearWallet() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
