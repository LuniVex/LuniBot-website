"use client";
import Link from "next/link";
import { memo, useMemo, useRef, useState } from "react";
import type { Bot, UpcomingBot } from "@/lib/bots";
import { fmtDate } from "@/lib/format";
import { licenseInfo } from "@/lib/license";
import { arrive, cascade, Flip, gsap, reducedMotion, settle, settleDuration, spring, springs, useGSAP } from "@/lib/motion";
import { useLoadStats, useStats } from "@/lib/stats-client";
import { DownloadBars } from "./Bars";
import { More, pill } from "./Button";
import { Count } from "./Count";
import { DownloadButton } from "./DownloadButton";
import { Mark } from "./Mark";
import { PhaseBadge } from "./Moon";
import { Appear, Assemble, finishAssemblies } from "./Motion";
import { VoteButton } from "./VoteButton";

/** One bot as the hub shows it. `mark` is its inlined SVG. */
export interface Entry { bot: Bot; size: string; index: string; mark: string | null }

/** A bot that is built but not released: a coming-soon card after the released ones. */
export interface UpcomingEntry { bot: UpcomingBot; mark: string | null }

/** How well a bot matches a search: name first, then tagline, then anything else. 0 means no match. */
function score(bot: Pick<Bot, "name" | "tagline" | "description" | "language"> & { tags?: string[] }, q: string) {
  if (!q) return 1;
  const name = bot.name.toLowerCase();
  if (name.startsWith(q)) return 4;
  if (name.includes(q)) return 3;
  if (bot.tagline.toLowerCase().includes(q)) return 2;
  return [bot.description, bot.language, ...(bot.tags ?? [])].join(" ").toLowerCase().includes(q) ? 1 : 0;
}

/**
 * Search and the bot cards. Every card stays mounted: filtered-out ones are
 * display:none and sorted to the end. A filter change is captured with GSAP Flip just before it happens
 * and played once React has re-rendered, so cards glide to their new places, leaving cards fade out, and
 * an interrupted change picks up from wherever the cards are. Nothing is ever unmounted mid-animation.
 */
export function BotGallery({ entries, upcoming = [], featured, soonMark }: { entries: Entry[]; upcoming?: UpcomingEntry[]; featured: string; soonMark: string | null }) {
  const [query, setQuery] = useState("");
  useLoadStats("all");

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => entries
    .map((e, i) => ({ e, i, s: score(e.bot, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.e.bot.slug), [entries, q]);
  const filtering = Boolean(q);
  // Upcoming bots stay last and only answer a search that matches them.
  const upcomingShown = upcoming.filter((u) => score(u.bot, q) > 0).map((u) => u.bot.slug);
  const order = [...visible, ...entries.map((e) => e.bot.slug).filter((s) => !visible.includes(s))];
  const bySlug = new Map(entries.map((e) => [e.bot.slug, e]));

  const grid = useRef<HTMLUListElement>(null);
  const flip = useRef<{ state: Flip.FlipState; was: string[] } | null>(null);
  const running = useRef<gsap.core.Timeline | null>(null);
  const shown = useRef<string[]>(visible);

  const cards = () => gsap.utils.toArray<HTMLElement>("[data-card]", grid.current);
  const update = (change: () => void) => {
    finishAssemblies(grid.current); // someone filtered before the cards finished assembling
    if (grid.current && !reducedMotion()) {
      // Capture where everything is right now (mid-animation included), then stop the old move.
      flip.current = { state: Flip.getState([grid.current, ...cards()], { props: "opacity" }), was: shown.current };
      running.current?.kill();
    }
    change();
  };

  const key = `${visible.join(" ")}|${upcomingShown.join(" ")}|${filtering}`;
  useGSAP(() => {
    shown.current = visible;
    const pending = flip.current;
    flip.current = null;
    if (!pending) return;
    const all = cards();
    const isShown = (el: HTMLElement) => getComputedStyle(el).display !== "none";
    const leaving = all.filter((el) => !isShown(el) && pending.was.includes(el.dataset.card!));
    // Cards that stay are set back to full opacity; Flip animates them there from wherever they were.
    gsap.set(all.filter(isShown), { clearProps: "opacity,visibility,zIndex" });
    running.current = Flip.from(pending.state, {
      // Cards travel on `settle`, a spring's motion: they leave at once, arrive with a hint of follow-through.
      targets: [grid.current!, ...all], absolute: leaving, nested: true, duration: settleDuration, ease: settle,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: arrive, stagger: cascade(0.06), delay: 0.05 }),
      // A leaving card fades quickly underneath the cards moving into place (they sit at z-index 1).
      onLeave: (els) => gsap.fromTo(els, { zIndex: 0 }, { autoAlpha: 0, duration: 0.22, ease: arrive }),
      onComplete: () => { gsap.set(grid.current, { clearProps: "width,height" }); },
    });
  }, { dependencies: [key], scope: grid });

  const clear = () => update(() => setQuery(""));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Search bots</span>
          <svg viewBox="0 0 16 16" aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-3">
            <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input type="search" value={query} onChange={(e) => { const v = e.target.value; update(() => setQuery(v)); }} placeholder="Search bots"
            className="smooth t-control-lg h-12 w-full rounded-ui border border-transparent bg-tile pl-11 pr-5 placeholder:text-fg-3 hover:border-line focus:border-blue focus:bg-bg focus:outline-none" />
        </label>

        <p role="status" className="t-small font-mono text-fg-3 tabular-nums">{filtering ? `${visible.length} of ${entries.length} bots` : `${entries.length} bots`}</p>
      </div>

      <ul ref={grid} className="relative mt-6 grid gap-5 md:grid-cols-2">
        {order.map((slug) => (
          <li key={slug} data-card={slug} className={`relative z-[1] min-w-0 ${slug === featured ? "md:col-span-2" : ""} ${visible.includes(slug) ? "" : "hidden"}`}>
            <Assemble className="h-full"><Tile {...bySlug.get(slug)!} featured={slug === featured} /></Assemble>
          </li>
        ))}
        {upcoming.map((u) => (
          <li key={u.bot.slug} data-card={`upcoming-${u.bot.slug}`} className={`relative z-[1] min-w-0 md:col-span-2 ${upcomingShown.includes(u.bot.slug) ? "" : "hidden"}`}>
            <Assemble><Upcoming {...u} /></Assemble>
          </li>
        ))}
        <li data-card="soon" className={`relative z-[1] min-w-0 md:col-span-2 ${filtering ? "hidden" : ""}`}><Assemble><Soon mark={soonMark} /></Assemble></li>
      </ul>

      {visible.length === 0 && upcomingShown.length === 0 && (
        <Appear className="mt-5 rounded-ui bg-tile p-8">
          <p className="t-tile">Nothing matches “{query.trim()}”.</p>
          <p className="mt-3 text-fg-2">Search covers names, descriptions, languages and tags.</p>
          <button type="button" onClick={clear} className={pill("secondary", "md", "mt-6")}>Show all bots</button>
        </Appear>
      )}
    </div>
  );
}

/**
 * Hover and keyboard focus on a card: it lifts 2px and a hairline fades in around it, both on the `hover`
 * spring, so leaving mid-lift eases back with its momentum. The metadata brightens through CSS
 * (`group-hover/card`), not JavaScript. Nothing here touches React state, so hovering never re-renders
 * the card, and the card surface is its own compositing layer (`will-change-transform`) from the start,
 * so the lift never swaps how its text is rasterised.
 */
function useCardHover() {
  const ref = useRef<HTMLElement>(null);
  const api = useRef<{ on: () => void; off: () => void } | null>(null);
  useGSAP((_, contextSafe) => {
    const card = ref.current!.querySelector<HTMLElement>("[data-lift]")!;
    const hair = ref.current!.querySelector<HTMLElement>("[data-hair]")!;
    const lift = spring(card, "y", springs.hover, { from: 0, unit: "px", eps: 0.02 });
    const line = spring(hair, "opacity", springs.hover, { from: 0, eps: 0.002 });
    const y = (v: number) => lift.to(v);
    const lineTo = (v: number) => line.to(v);
    api.current = {
      on: contextSafe!(() => { if (!reducedMotion()) y(-2); lineTo(1); }),
      off: contextSafe!(() => { y(0); lineTo(0); }),
    };
  }, { scope: ref });
  const handlers = {
    onPointerEnter: () => api.current?.on(),
    onPointerLeave: () => api.current?.off(),
    onFocus: () => api.current?.on(),
    onBlur: (e: React.FocusEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) api.current?.off(); },
  };
  return { ref, handlers };
}

/** Corner registration marks, as on a printed plate: four small hairline angles just inside a box. */
function Corners() {
  const c = "pointer-events-none absolute size-2.5 border-line";
  return (
    <>
      <span aria-hidden="true" className={`${c} left-3 top-3 border-l border-t`} />
      <span aria-hidden="true" className={`${c} right-3 top-3 border-r border-t`} />
      <span aria-hidden="true" className={`${c} bottom-3 left-3 border-b border-l`} />
      <span aria-hidden="true" className={`${c} bottom-3 right-3 border-b border-r`} />
    </>
  );
}

/**
 * The card's stage: a faint band, engraved with hairline hatching, with corner marks and the bot's phase
 * badge (its place in the lunar cycle, data/bots.json `lunar`), where the bot is shown as an object. The hub's 3D
 * journey lands the bot's slab here and raises its model out of it (components/three/journey.ts); until
 * then, and wherever 3D doesn't run, the bot's mark is drawn here large. `[data-journey]` is the box the
 * 3D aims at, and its contents step aside once the 3D is live (app/globals.css).
 */
function Stage({ slug, mark, name, index, note, featured, phase }: { slug: string; mark: string | null; name: string; index: string; note?: string; featured: boolean; phase: Bot["lunar"]["phase"] }) {
  return (
    <div className={`hatch relative bg-alt ${featured ? "min-h-72 border-b border-line md:order-last md:min-h-0 md:border-b-0 md:border-l" : "aspect-[16/10] border-b border-line"}`}>
      <Corners />
      <p data-meta="" className="smooth group-hover/card:text-fg-2 group-focus-within/card:text-fg-2 t-tiny absolute left-6 top-5 font-mono text-fg-3 tabular-nums">
        {index}{note && <span className="ml-3">{note}</span>}
      </p>
      <PhaseBadge phase={phase} className="absolute right-6 top-5" />
      <div data-journey={slug} className="absolute inset-x-6 bottom-6 top-12 grid place-items-center">
        <Mark svg={mark} name={name} size={featured ? 128 : 96} />
      </div>
    </div>
  );
}

/**
 * One bot as a catalogue entry on paper, framed by a hairline: its stage with the bot as an object, then the
 * facts (status, name and line, a row of specs, the last 30 days of downloads) and the actions on a
 * hairline. The featured bot spans the full width with its stage on the right. The whole card opens the
 * bot's page; the one accent is the Download button.
 */
const Tile = memo(function Tile({ bot, size, index, mark, featured }: Entry & { featured: boolean }) {
  const { data } = useStats(bot.slug);
  const downloads = data?.downloads.total;
  // The article is the hover target and never moves; only the card inside lifts. If the moving card were
  // the target, a cursor near its bottom edge would fall off it as it rose and the hover would stutter.
  const { ref, handlers } = useCardHover();
  const meta = "smooth group-hover/card:text-fg-2 group-focus-within/card:text-fg-2";
  const specs: [string, string][] = [["Version", `v${bot.version}`], ["Size", size], ["Updated", fmtDate(bot.updated)]];
  return (
    <article ref={ref} className="group/card relative h-full" {...handlers}>
      <div data-lift="" data-press="0.985" className={`relative h-full overflow-hidden will-change-transform rounded-ui border border-line bg-bg ${featured ? "grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" : "flex flex-col"}`}>
        <span data-hair="" aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 rounded-ui border border-fg-3 opacity-0" />
        <Stage slug={bot.slug} mark={mark} name={bot.name} index={index} note={featured ? "Newest" : undefined} featured={featured} phase={bot.lunar.phase} />
        <div className={`flex flex-1 flex-col ${featured ? "p-8 md:p-10" : "p-8"}`}>
          <p data-meta="" className={`${meta} t-small font-mono text-fg-3`}><span className="capitalize">{bot.status}</span> · {bot.language} · {licenseInfo(bot.license).short}</p>
          <h3 className={`mt-2 ${featured ? "t-section" : "t-tile"}`}>
            <Link href={`/bots/${bot.slug}`} className="rounded-ui after:absolute after:inset-0 after:rounded-ui focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-blue">{bot.name}</Link>
          </h3>
          <p className={`mt-2 max-w-[30ch] text-fg-2 ${featured ? "t-lead" : "t-body-lg min-h-[2lh]"}`}>{bot.tagline}</p>

          <dl className="mt-8 grid grid-cols-3 gap-x-4 border-t border-line/70 pt-4">
            {specs.map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt data-meta="" className={`${meta} t-tiny font-mono text-fg-3`}>{k}</dt>
                <dd className="t-small mt-1 truncate tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          {/* One line: the label, the month's bars running between like a leader, and the total. */}
          <div data-meta="" className={`${meta} t-tiny mb-8 mt-6 flex items-end gap-3 font-mono text-fg-3 tabular-nums`}>
            <span className="shrink-0">Last 30 days</span>
            <DownloadBars slug={bot.slug} className="h-6 flex-1" />
            <span className="shrink-0">{downloads === undefined ? "–" : <Count value={downloads} />} {downloads === 1 ? "download" : "downloads"} in all</span>
          </div>

          <div className="relative z-10 mt-auto flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-line/70 pt-6">
            <DownloadButton slug={bot.slug}>Download</DownloadButton>
            <VoteButton slug={bot.slug} />
            <More href={`/bots/${bot.slug}`} className="ml-auto">Details</More>
          </div>
        </div>
      </div>
    </article>
  );
});

/**
 * A bot that is built but not released yet. It shares the "More bots" row's unlit look (a dashed hairline
 * and the new-moon badge) but names the bot, says where it stands, and opens its page. No download, stats or
 * votes until it is released; the one accent is its mark's solid shape.
 */
const Upcoming = memo(function Upcoming({ bot, mark }: UpcomingEntry) {
  const { ref, handlers } = useCardHover();
  const meta = "smooth group-hover/card:text-fg-2 group-focus-within/card:text-fg-2";
  return (
    <article ref={ref} className="group/card relative" {...handlers}>
      <div data-lift="" data-press="0.985" className="relative grid will-change-transform gap-8 rounded-ui bg-bg p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-10">
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-ui border border-dashed border-line" />
        <span data-hair="" aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-ui border border-fg-3 opacity-0" />
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <Mark svg={mark} name={bot.name} size={56} optical />
          <div className="min-w-0">
            <p data-meta="" className={`${meta} t-small font-mono text-fg-3`}>Coming soon · {bot.stage} · v{bot.version}</p>
            <PhaseBadge phase="new" className="mt-1" />
            <h3 className="t-tile mt-1">
              <Link href={`/bots/${bot.slug}`} className="rounded-ui after:absolute after:inset-0 after:rounded-ui focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-blue">{bot.name}</Link>
            </h3>
            <p className="t-body-lg mt-2 max-w-[40ch] text-fg-2">{bot.tagline}</p>
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-x-6 gap-y-3 md:flex-col md:items-end">
          <More href={`/bots/${bot.slug}`}>Details</More>
          <More href={`/docs/${bot.slug}`}>Read the docs</More>
        </div>
      </div>
    </article>
  );
});

/**
 * The last row: more bots are coming. Its phase is the new moon: there, but not yet lit. It points to the one
 * Discord call to action rather than repeating it.
 */
const Soon = memo(function Soon({ mark }: { mark: string | null }) {
  const { ref, handlers } = useCardHover();
  return (
    <article ref={ref} className="group/card relative" {...handlers}>
      <div data-lift="" data-press="0.985" className="relative flex will-change-transform flex-col gap-6 rounded-ui bg-bg p-8 md:flex-row md:items-center">
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-ui border border-dashed border-line" />
        <span data-hair="" aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-ui border border-fg-3 opacity-0" />
        <Mark svg={mark} name="More" size={56} optical className="text-fg-2" />
        <div className="md:flex-1">
          <p data-meta="" className="smooth group-hover/card:text-fg-2 group-focus-within/card:text-fg-2 t-small font-mono text-fg-3">Coming soon</p>
          <PhaseBadge phase="new" className="mt-1" />
          <h3 className="t-tile mt-1">More bots</h3>
          <p className="t-body-lg mt-2 max-w-[40ch] text-fg-2">New ones are in the works. Ideas go in the Discord, at the end of this page.</p>
        </div>
      </div>
    </article>
  );
});
