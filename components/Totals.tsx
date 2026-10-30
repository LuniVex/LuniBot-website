"use client";
import { useStats } from "@/lib/stats-client";
import { Count } from "./Count";

/** All-time downloads across the given bots, summed from the page's shared figures (the same ones the cards show). */
export function TotalDownloads({ slugs }: { slugs: string[] }) {
  const all = slugs.map((s) => useStats(s)); // eslint-disable-line react-hooks/rules-of-hooks -- fixed list, fixed order
  if (all.some((e) => !e.data)) return <span aria-label="Download count unavailable">–</span>;
  return <Count value={all.reduce((n, e) => n + (e.data?.downloads.total ?? 0), 0)} />;
}
