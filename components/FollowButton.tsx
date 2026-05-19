"use client";

import { useEffect, useState } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { isFollowing, toggleFollow } from "@/lib/localStorage";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  handle: string;
  className?: string;
}

export function FollowButton({ handle, className }: FollowButtonProps) {
  const [following, setFollowing] = useState(false);
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    setFollowing(isFollowing(handle));
  }, [handle]);

  function handleClick() {
    const next = toggleFollow(handle);
    setFollowing(next);
    if (next) {
      setPopped(true);
      setTimeout(() => setPopped(false), 300);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200",
        following
          ? "border-violet-500/40 bg-violet-500/15 text-violet-300 hover:bg-violet-500/25"
          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white",
        popped && "animate-count-pop",
        className,
      )}
    >
      {following ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {following ? "Following" : "Follow"}
    </button>
  );
}
