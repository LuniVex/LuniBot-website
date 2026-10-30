"use client";
import { useSyncExternalStore } from "react";
import { moonTonight } from "@/lib/moon";
import { Phase } from "./Moon";

/** Tonight's real moon, worked out in the browser from today's date (so it's never a stale build-time value). */
export function MoonTonight() {
  const now = useSyncExternalStore(() => () => {}, moonTonight, () => null);
  if (!now) return <span className="inline-block h-4" />;
  return (
    <span className="inline-flex items-center gap-2">
      <Phase phase={now.phase} size={12} className="text-fg-2" />
      Tonight: {now.name.toLowerCase()}, {Math.round(now.lit * 100)}% lit
    </span>
  );
}
