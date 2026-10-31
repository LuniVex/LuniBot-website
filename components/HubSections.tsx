import Link from "next/link";
import { type Bot, bots, type SiteUpdate, updates, upcoming } from "@/lib/bots";
import { fmtDate } from "@/lib/format";
import { Terminal } from "./HeroFx";
import { RevealChild, RevealGroup, Reveal } from "./Motion";
import { body, SectionHead } from "./Sections";
import { PackageDrawing } from "./PackageDrawing";
import { ThreeStage } from "./ThreeStage";
import { TotalDownloads } from "./Totals";

/** 02 · The three steps every bot shares, then the same commands typed out in the terminal, beside the zip as a box. */
export function HowItWorks({ index, of, zip }: { index: string; of: number; zip: string }) {
  const steps = [
    { n: "1", title: "Download", text: "Pick a bot and download its zip. It's source code, and its page shows a SHA-256 checksum to check the file against.", cmd: `unzip ${zip}` },
    { n: "2", title: "Add your token", text: "Copy the example settings and paste in your Discord bot token. If a bot needs a key for another service, its page says which.", cmd: "cp .env.example .env" },
    { n: "3", title: "Run it", text: "Install and start it on your computer or a server. It runs until you stop it, and you can read every line of it.", cmd: "npm ci && npm start" },
  ];
  return (
    <section className="px-5 pb-16 md:pb-24">
      <div className="mx-auto max-w-page">
        <SectionHead index={index} of={of} label="How it works" title="Three steps, every bot" />
        <div className="mt-10 md:grid md:grid-cols-[10rem_minmax(0,1fr)]">
          {/* The zip as a box, held in the index column: it opens as you read the steps and lifts the token out. */}
          <div className="hidden md:block">
            <ThreeStage kind="package" track="#how" start="top 75%" end="bottom 60%" className="sticky top-28 -ml-8 size-40"
              fallback={<PackageDrawing />} />
          </div>
          <div>
            <RevealGroup className="grid gap-x-10 gap-y-8 md:grid-cols-3">
              {steps.map((s) => (
                <RevealChild key={s.n} className="border-t border-line/70 pt-5">
                  <p className="t-small font-mono text-fg-3">{s.n}</p>
                  <h3 className="t-h3 mt-2">{s.title}</h3>
                  <p className="mt-2 text-fg-2">{s.text}</p>
                </RevealChild>
              ))}
            </RevealGroup>
            <Reveal className="mt-12">
              <Terminal lines={steps.map((s, i) => (i === 1 ? { cmd: s.cmd, note: "add your bot token" } : { cmd: s.cmd }))} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

type Event = { day: string; text: string; href?: string };

/**
 * Every release and update in data/bots.json, newest first; updates on the same day are grouped. Site news
 * (`updates`) is listed first on its day.
 */
function timeline(list: Bot[], news: SiteUpdate[] = []): Event[] {
  const byDay = new Map<string, { released: string[]; updated: Map<string, string[]> }>();
  const at = (day: string) => byDay.get(day) ?? byDay.set(day, { released: [], updated: new Map() }).get(day)!;
  for (const b of list) {
    at(b.released).released.push(b.name);
    if (b.updated !== b.released) {
      const u = at(b.updated).updated;
      u.set(b.version, [...(u.get(b.version) ?? []), b.name]);
    }
  }
  const and = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}` : xs[0]);
  for (const n of news) at(n.date);
  return [...byDay.entries()].sort(([a], [b]) => b.localeCompare(a)).flatMap(([day, e]) => [
    ...news.filter((n) => n.date === day).map((n) => ({ day, text: n.text, href: n.href })),
    ...[...e.updated.entries()].map(([v, names]) => ({ day, text: `${and(names)} updated to ${v}` })),
    ...(e.released.length ? [{ day, text: `${and(e.released)} first released` }] : []),
  ]);
}

/** 03 · What changed lately, from the bots' own dates, beside the plain facts about every download. */
export function LatestUpdates({ index, of }: { index: string; of: number }) {
  const events = timeline(bots, updates);
  const facts: [string, React.ReactNode][] = [
    ["Bots", bots.length],
    ...(upcoming.length ? [["Coming soon", upcoming.length] as [string, React.ReactNode]] : []),
    ["Downloads, all time", <TotalDownloads key="t" slugs={bots.map((b) => b.slug)} />],
    ["Licence", "GPL-3.0"],
    ["Account needed", "None"],
  ];
  return (
    <section className="px-5 pb-16 md:pb-24">
      <div className="mx-auto max-w-page">
        <SectionHead index={index} of={of} label="Updates" title="Latest updates" />
        <div className={`mt-10 grid gap-x-10 gap-y-12 md:grid-cols-[minmax(0,1fr)_14rem] ${body}`}>
          <RevealGroup>
            <ol className="border-b border-line/70">
              {events.map((e) => (
                <li key={e.day + e.text} data-reveal="" className="grid gap-1 border-t border-line/70 py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline">
                  <time dateTime={e.day} className="t-small font-mono text-fg-3 tabular-nums">{fmtDate(e.day)}</time>
                  <span>{e.href ? <Link href={e.href} className="smooth decoration-1 underline-offset-[0.2em] hover:underline">{e.text}</Link> : e.text}</span>
                </li>
              ))}
            </ol>
          </RevealGroup>
          <Reveal>
            <dl className="flex flex-col border-b border-line/70">
              {facts.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-t border-line/70 py-4">
                  <dt className="t-small font-mono text-fg-3">{k}</dt>
                  <dd className="t-h3 tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="t-small mt-4 text-fg-3">Downloads are counted on our server, once per visitor per hour.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
