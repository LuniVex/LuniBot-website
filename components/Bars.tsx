"use client";
import { useStats } from "@/lib/stats-client";

/**
 * A bot's last 30 days of downloads as a row of thin bars on a hairline baseline: today in the accent,
 * other days in the quiet grey, and nothing for a day with none (the baseline carries the row). Reads from the page's shared
 * figures, so it always agrees with the totals beside it. Decorative; the totals carry the meaning.
 */
export function DownloadBars({ slug, className = "" }: { slug: string; className?: string }) {
  const { data } = useStats(slug);
  const days = data?.downloads.daily ?? Array.from({ length: 30 }, () => ({ day: "", count: 0 }));
  const peak = Math.max(1, ...days.map((d) => d.count));
  return (
    <div data-bars="" aria-hidden="true" className={`flex items-end gap-[2px] border-b border-line ${className || "h-8"}`}>
      {days.map((d, i) => (
        <span key={i} className={`flex-1 ${d.count === 0 ? "" : i === days.length - 1 ? "bg-blue" : "bg-fg-3/45"}`}
          style={{ height: d.count === 0 ? 0 : `${Math.max(12, (d.count / peak) * 100)}%` }} />
      ))}
    </div>
  );
}
