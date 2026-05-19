import Link from "next/link";
import type { Creator } from "@/types";
import { FollowButton } from "@/components/FollowButton";

export function CreatorCard({ creator }: { creator: Creator }) {
  const initials = creator.avatar || creator.name.slice(0, 2).toUpperCase();

  return (
    <div className="glass rounded-2xl p-4 space-y-4">
      <Link href={`/creator/${creator.handle}`} className="flex items-center gap-3 group">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 font-bold text-white shadow-lg shadow-violet-950/30 transition group-hover:scale-105">
            {initials}
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white transition group-hover:text-teal-300">{creator.name}</p>
          <p className="text-xs text-zinc-500">@{creator.handle}</p>
        </div>
      </Link>

      {creator.bio && (
        <p className="text-sm leading-relaxed text-zinc-400">{creator.bio}</p>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="truncate font-mono text-[10px] text-zinc-700">{creator.walletAddress.slice(0, 20)}…</p>
        <FollowButton handle={creator.handle} />
      </div>
    </div>
  );
}
