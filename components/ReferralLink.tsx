"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { buildReferralUrl } from "@/lib/localStorage";

interface ReferralLinkProps {
  handle: string;
}

export function ReferralLink({ handle }: ReferralLinkProps) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(buildReferralUrl(handle));
  }, [handle]);

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
        <Link2 className="h-4 w-4 text-violet-400" />
        Referral link
      </div>
      <p className="mb-3 text-xs text-zinc-500">
        Share this link. When a new viewer pays for the first time, your wallet gets credited as referrer.
      </p>
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2">
        <span className="flex-1 truncate font-mono text-xs text-zinc-400">{url || "Loading…"}</span>
        <button
          onClick={copy}
          className="shrink-0 rounded-md border border-white/[0.08] bg-white/[0.05] p-1.5 text-zinc-400 transition hover:border-white/20 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
