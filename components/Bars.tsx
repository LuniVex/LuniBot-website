"use client";
import { useStats } from "@/lib/stats-client";

/**
 * A bot's last 30 days of downloads as a row of thin bars on a hairline baseline: today in the accent,
 * other days in the quiet grey, and a 1px tick for a day with none. Reads from the page's shared
 * figures, so it always agrees with the totals beside it. Decorative; the totals carry the meaning.
 */
export function DownloadBars({ slug, className = "" }: { slug: string; className?: string }) {
  const { data } = useStats(slug);
  const days = data?.downloads.daily ?? Array.from({ length: 30 }, () => ({ day: "", count: 0 }));
  const peak = Math.max(1, ...days.map((d) => d.count));
  return (
    <div data-bars="" aria-hidden="true" className={`flex h-10 items-end gap-[3px] border-b border-line ${className}`}>
      {days.map((d, i) => (
        <span key={i} className={`flex-1 ${i === days.length - 1 ? "bg-blue" : d.count === 0 ? "bg-fg-3/20" : "bg-fg-3/40"}`}
          style={{ height: d.count === 0 ? 1 : `${Math.max(12, (d.count / peak) * 100)}%` }} />
      ))}
    </div>
  );
}
