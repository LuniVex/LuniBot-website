"use client";
import { useRef, useState } from "react";
import type { Votes } from "@/lib/analytics";
import { fetchJson } from "@/lib/fetch-json";
import { spring, springs, useGSAP } from "@/lib/motion";
import type { Spring } from "@/lib/spring";
import { reloadStats, setVotes, useStats } from "@/lib/stats-client";
import { Count } from "./Count";

/**
 * One upvote per visitor, stored on the server; press again to take it back. The count comes from the
 * page's shared figures, updates instantly, and rolls back if the server refuses. A standing vote shows as
 * an ink outline and a filled arrow, not a fill: the accent stays on the one primary action beside it.
 */
export function VoteButton({ slug, size = "md" }: { slug: string; size?: "md" | "lg" }) {
  const { data, failed } = useStats(slug);
  const v = data?.votes;
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const arrow = useRef<SVGSVGElement>(null);
  const lift = useRef<Spring | null>(null);
  const voted = v?.voted ?? false;

  // The arrow springs up a pixel and a half while your vote stands (the press itself is global physics).
  useGSAP(() => {
    lift.current ??= spring(arrow.current!, "y", springs.release, { from: 0, unit: "px", eps: 0.02 });
    lift.current.to(voted ? -1.5 : 0);
  }, { dependencies: [voted] });

  async function toggle() {
    if (!v || saving) return;
    const before = v;
    setVotes(slug, { voted: !v.voted, count: v.count + (v.voted ? -1 : 1) });
    setSaving(true);
    setSaveFailed(false);
    try {
      setVotes(slug, await fetchJson<Votes>(`/api/votes/${slug}`, { method: "POST" }));
    } catch {
      setVotes(slug, before);
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-center gap-1">
      <button type="button" onClick={toggle} disabled={!v} aria-pressed={voted} aria-busy={saving}
        className={`smooth inline-flex items-center gap-2 rounded-ui border disabled:opacity-50 ${size === "lg" ? "min-h-12 px-6 t-control-lg" : "min-h-9 px-4 t-control"} ${
          voted ? "border-fg text-fg" : "border-line text-fg enabled:hover:border-fg-3"}`}>
        <svg ref={arrow} viewBox="0 0 12 12" aria-hidden="true" className="size-3">
          <path d="M6 1.75 10.75 10H1.25z" fill={voted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
        <span>{voted ? "Upvoted" : "Upvote"}</span>
        <span className="opacity-70" aria-label={v ? `${v.count} votes` : "votes unavailable"}>{v ? <Count value={v.count} /> : "–"}</span>
      </button>
      {failed && !v && (
        <span role="status" className="t-tiny text-fg-3">
          Votes didn&apos;t load. <button type="button" className="link" onClick={() => reloadStats(slug)}>Try again</button>
        </span>
      )}
      {saveFailed && <span role="alert" className="t-tiny text-fg-3">Your vote wasn&apos;t saved. Try again.</span>}
    </span>
  );
}
