"use client";
import { useRef, useState } from "react";
import { fmtDate } from "@/lib/format";
import { cascade, gsap, reducedMotion, revealStart, settle, useGSAP } from "@/lib/motion";
import { useLoadStats, useStats } from "@/lib/stats-client";
import { Count } from "./Count";
import { Shimmer, usePill } from "./Motion";

/** Loads one bot's figures into the page's shared copy (lib/stats-client) when the page opens. */
export function StatsProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  useLoadStats(slug);
  return children;
}

/** The all-time download total, from the same figures as the stats panel and the hub card. */
export function TotalDownloads({ slug }: { slug: string }) {
  const { data } = useStats(slug);
  return data ? <Count value={data.downloads.total} /> : <span aria-label="Download count unavailable">–</span>;
}

/** Download totals and a bar chart of the last 7 or 30 days. */
export function DownloadChart({ slug }: { slug: string }) {
  const { data: stats, failed } = useStats(slug);
  const data = stats?.downloads ?? null;
  const [range, setRange] = useState<7 | 30>(30);
  const { box, pill } = usePill(`${range}-${!!data}`);
  const bars = useRef<HTMLDivElement>(null);
  // Bars grow from the baseline in a quick wave: when the chart first scrolls into view, then on every range change.
  useGSAP(() => {
    if (!bars.current || reducedMotion()) return;
    gsap.fromTo(bars.current.children, { scaleY: 0 }, {
      scaleY: 1, duration: 0.8, ease: settle, stagger: cascade(0.03),
      scrollTrigger: { trigger: bars.current, start: revealStart, once: true },
    });
  }, { dependencies: [range, !!data], scope: bars, revertOnUpdate: true });

  if (failed && !data) return <p className="text-fg-2">Download numbers aren&apos;t available right now. Downloading still works.</p>;
  if (!data) {
    return (
      <div aria-busy="true" aria-label="Loading download numbers">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">{[0, 1, 2, 3, 4].map((i) => <div key={i}><Shimmer className="h-10 w-16" /><Shimmer className="mt-3 h-4 w-24" /></div>)}</div>
        <Shimmer className="mt-10 h-40 w-full" />
      </div>
    );
  }

  const days = data.daily.slice(-range);
  const peak = Math.max(1, ...days.map((d) => d.count));

  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-y border-line py-6 sm:grid-cols-3 md:grid-cols-5">
        {([["All time", data.total], ["Today", data.today], ["Last 7 days", data.last7], ["Last 30 days", data.last30], ["Upvotes", stats!.votes.count]] as const).map(([k, v]) => (
          <div key={k}>
            <dt className="t-small font-mono text-fg-3">{k}</dt>
            <dd className={`t-figure mt-2 ${k === "Upvotes" ? "text-fg-2" : ""}`}><Count value={v} /></dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 flex items-center justify-between gap-4">
        <p className="t-small font-mono text-fg-3">Downloads per day, UTC</p>
        <div ref={box} role="group" aria-label="Chart range" className="group/pill relative flex rounded-ui bg-tile p-1">
          <span ref={pill} aria-hidden="true" className="invisible absolute left-0 top-0 rounded-ui bg-fg" />
          {([7, 30] as const).map((r) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}
              className={`smooth t-small relative rounded-ui px-3 py-1 ${range === r ? "bg-fg text-bg group-data-ready/pill:bg-transparent" : "text-fg-2 hover:text-fg"}`}>
              <span className="relative">{r} days</span>
            </button>
          ))}
        </div>
      </div>
      {/* Hairline peak line with its value, bars on a hairline baseline, today in the accent, quiet ticks for empty days. */}
      <div className="relative mt-10">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-line/70" />
        <span aria-hidden="true" className="t-tiny absolute -top-5 left-0 font-mono text-fg-3 tabular-nums">peak {peak}</span>
        <div ref={bars} role="img" aria-label={`Downloads per day over the last ${range} days: ${days.reduce((a, d) => a + d.count, 0)} in total, at most ${peak} in one day.`}
          className={`flex h-40 items-end border-b border-line ${range === 7 ? "gap-3" : "gap-[3px]"}`}>
          {days.map((d, i) => (
            <div key={`${range}-${d.day}`} title={`${fmtDate(d.day)}: ${d.count}`}
              className={`flex-1 origin-bottom ${i === days.length - 1 ? "bg-blue" : d.count === 0 ? "bg-fg-3/20" : "bg-fg-3/40"}`}
              style={{ height: d.count === 0 ? 1 : `${Math.max(6, (d.count / peak) * 100)}%` }} />
          ))}
        </div>
      </div>
      <p className="t-tiny mt-2 flex justify-between font-mono text-fg-3 tabular-nums">
        <span>{fmtDate(days[0].day)}</span><span className="text-blue">Today</span>
      </p>
    </div>
  );
}
