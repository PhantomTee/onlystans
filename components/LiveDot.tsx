"use client";

import { cn } from "@/lib/utils";

interface LiveDotProps {
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

export function LiveDot({ count, size = "sm", className }: LiveDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "relative inline-block rounded-full bg-red-500 animate-pulse-ring",
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
        )}
      />
      {count !== undefined && (
        <span className={cn("font-mono tabular-nums text-red-400", size === "sm" ? "text-xs" : "text-sm")}>
          {count}
        </span>
      )}
    </span>
  );
}
