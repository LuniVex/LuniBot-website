import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Headline } from "@/components/Headline";
import { More } from "@/components/Button";
import { DownloadButton } from "@/components/DownloadButton";
import { Mark } from "@/components/Mark";
import { PhaseBadge } from "@/components/Moon";
import { Assemble, Enter, Reveal, RevealChild, RevealGroup } from "@/components/Motion";
import { Plate } from "@/components/Plate";
import { body, DiscordCta, SectionHead } from "@/components/Sections";
import { DownloadChart, StatsProvider, TotalDownloads } from "@/components/Stats";
import { GetIt } from "@/components/GetIt";
import { ThreeStage } from "@/components/ThreeStage";
import { SlashCommand } from "@/components/Term";
import { VoteButton } from "@/components/VoteButton";
import { bots, getBot, preview, siteUrl } from "@/lib/bots";
import { getFile, inPublic } from "@/lib/files";
import { fmtDate, fmtSize } from "@/lib/format";
import { licenseInfo } from "@/lib/license";
import { getMark } from "@/lib/marks";
import { OPENING } from "@/lib/moon";

// Only bots in data/bots.json exist; any other slug is a clean 404.
export const dynamicParams = false;
export const generateStaticParams = () => bots.map((b) => ({ slug: b.slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bot = getBot((await params).slug);
  if (!bot) return {};
  const meta = preview(`/bots/${bot.slug}`, `${bot.name} · LuniBot`, `${bot.tagline} Free to download, ${licenseInfo(bot.license).short} licence, runs on your own machine.`);
  return { ...meta, title: bot.name, description: `${bot.tagline} ${bot.description}`.slice(0, 200) };
}

export default async function BotPage({ params }: Props) {
  const bot = getBot((await params).slug);
  if (!bot) notFound();
  const file = getFile(bot);
  const lic = licenseInfo(bot.license);
  const shots = bot.shots.map((shot, i) => ({ shot, fig: i + 1, ready: inPublic(shot.file) }));
  const [lead, ...more] = shots;

  const jsonLd = {
    "@context": "https://schema.org", "@type": "SoftwareApplication", name: bot.name, description: bot.description,
    applicationCategory: "DeveloperApplication", operatingSystem: bot.runtime, softwareVersion: bot.version,
    datePublished: bot.released, dateModified: bot.updated, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    downloadUrl: `${siteUrl}${bot.download.file}`,
  };

  const facts: [string, React.ReactNode][] = [
    ["Version", bot.version],
    ["First release", fmtDate(bot.released)],
    ["Latest update", fmtDate(bot.updated)],
    ["Size", file ? fmtSize(file.size) : "–"],
    ["Licence", lic.short],
    ["Downloads", <TotalDownloads key="d" slug={bot.slug} />],
  ];
  // Sections are numbered in order; the In Discord section only appears when there is more than one shot.
  const sections = ["Features", ...(more.length ? ["In Discord"] : []), "Commands", "Download", "Download stats", "Before you start", "Requests"];
  const n = (name: string) => String(sections.indexOf(name) + 1).padStart(2, "0");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <StatsProvider slug={bot.slug}>
        <section data-moment={OPENING} className="px-5 pb-16 pt-24 md:pb-24 md:pt-28">
          <div className="mx-auto max-w-page">
            <Enter><More href="/" back>All bots</More></Enter>
            <div className="mt-10 grid items-center gap-12 md:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div>
                <Enter><Assemble onMount delay={0.25} rise={false}><Mark svg={getMark(bot.slug)} name={bot.name} size={88} optical /></Assemble></Enter>
                <Enter><p className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2"><span className="t-small font-mono text-fg-3"><span className="capitalize">{bot.status}</span> · v{bot.version}</span><PhaseBadge phase={bot.lunar.phase} /></p></Enter>
                <Headline text={bot.name} className="t-hero mt-2" split="chars" each={0.05} />
                <Enter><p className="t-lead mt-3 max-w-[26ch] text-fg-2">{bot.tagline}</p></Enter>
                <Enter className="mt-8 flex flex-wrap items-center gap-3">
                  <DownloadButton slug={bot.slug} size="lg">Download v{bot.version}</DownloadButton>
                  <VoteButton slug={bot.slug} size="lg" />
                </Enter>
                <Enter><p className="t-small mt-4 text-fg-3">{bot.language} · {bot.runtime} · {lic.short} licence</p></Enter>
              </div>
              {lead && <Enter><Assemble onMount delay={0.4} rise={false}><Plate shot={lead.shot} fig={lead.fig} ready={lead.ready} priority /></Assemble></Enter>}
            </div>
          </div>
        </section>

        <section className="px-5">
          <Reveal className="mx-auto grid max-w-page grid-cols-2 gap-y-8 border-y border-line py-8 sm:grid-cols-3 lg:grid-cols-[10rem_repeat(5,minmax(0,1fr))]">
            {facts.map(([k, v]) => (
              <div key={k}>
                <p className="t-small font-mono text-fg-3">{k}</p>
                <p className="t-h3 mt-1 whitespace-nowrap tabular-nums">{v}</p>
              </div>
            ))}
          </Reveal>
        </section>

        <section className="px-5 py-16 md:py-24">
          <Reveal className={`mx-auto max-w-page ${body}`}>
            <p className="t-lead max-w-[38ch]">{bot.description}</p>
          </Reveal>
        </section>

        <section className="px-5 pb-16 md:pb-24">
          <div className="mx-auto max-w-page">
            <SectionHead of={sections.length} index={n("Features")} label="Features" title="What it does" />
            <div className="mt-10 md:grid md:grid-cols-[10rem_minmax(0,1fr)]">
              {/* The bot's model on its plinth, held beside the list and turned by scroll. */}
              <div className="hidden md:block">
                <ThreeStage kind="model" slug={bot.slug} svg={getMark(bot.slug)} className="sticky top-28 -ml-8 size-40"
                  fallback={<div className="grid size-full place-items-center"><Mark svg={getMark(bot.slug)} name={bot.name} size={128} /></div>} />
              </div>
            <RevealGroup className="grid gap-x-10 md:grid-cols-2">
              {bot.features.map((f) => (
                <RevealChild key={f} className="flex gap-3 border-t border-line/70 py-4">
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-1 size-4 shrink-0 text-blue" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
                  <span>{f}</span>
                </RevealChild>
              ))}
            </RevealGroup>
            </div>
          </div>
        </section>

        {more.length > 0 && (
          <section className="px-5 pb-16 md:pb-24">
            <div className="mx-auto max-w-page">
              <SectionHead of={sections.length} index={n("In Discord")} label="In Discord" title="What you’ll see" note="Plates marked “Screenshot to come” are drawings until the real ones are in." />
              <Assemble className={`mt-10 grid gap-8 md:grid-cols-2 ${body}`}>
                {more.map((s) => <Plate key={s.shot.file} shot={s.shot} fig={s.fig} ready={s.ready} />)}
              </Assemble>
            </div>
          </section>
        )}

        <section className="px-5 pb-16 md:pb-24">
          <div className="mx-auto max-w-page">
            <SectionHead of={sections.length} index={n("Commands")} label="Commands" title="Slash commands" note="Type these in Discord once the bot is in your server." />
            <Reveal className={`mt-10 ${body}`}>
              <ul className="border-b border-line/70">
                {bot.commands.map((c) => (
                  <li key={c.name} className="grid gap-1 border-t border-line/70 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6">
                    <SlashCommand name={c.name} />
                    <span className="text-fg-2">{c.description}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className="px-5 pb-16 md:pb-24">
          <div className="mx-auto max-w-page">
            <SectionHead of={sections.length} index={n("Download")} label="Download" title="Get it running" />
            <Reveal className={`mt-10 ${body}`}><GetIt bot={bot} file={file} /></Reveal>
          </div>
        </section>

        <section className="px-5 pb-16 md:pb-24">
          <div className="mx-auto max-w-page">
            <SectionHead of={sections.length} index={n("Download stats")} label="Stats" title="Downloads" note="Counted on our server, once per visitor per hour." />
            <Reveal className={`mt-10 ${body}`}><DownloadChart slug={bot.slug} /></Reveal>
          </div>
        </section>

        <section className="px-5 pb-16 md:pb-24">
          <div className="mx-auto max-w-page">
            <SectionHead of={sections.length} index={n("Before you start")} label="Requirements" title="Before you start" />
            <RevealGroup className={`mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 ${body}`}>
              <RevealChild className="border-t border-line/70 pt-5">
                <h3 className="t-h3">You&apos;ll need</h3>
                <ul className="mt-4 flex flex-col gap-3 text-fg-2">{bot.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
              </RevealChild>
              <RevealChild className="border-t border-line/70 pt-5">
                <h3 className="t-h3">Good to know</h3>
                <dl className="mt-4 flex flex-col gap-3">
                  <div><dt className="t-small font-mono text-fg-3">Data it sends</dt><dd className="text-fg-2">{bot.telemetry === "none" ? "Nothing beyond Discord itself." : bot.telemetry}</dd></div>
                  <div><dt className="t-small font-mono text-fg-3">Its phase</dt><dd className="text-fg-2"><span className="mb-1 mt-0.5 block"><PhaseBadge phase={bot.lunar.phase} /></span>{bot.lunar.reason}</dd></div>
                  <div><dt className="t-small font-mono text-fg-3">Licence</dt><dd className="text-fg-2">{lic.url ? <a href={lic.url} target="_blank" rel="noopener noreferrer" className="link">{lic.name}</a> : lic.name}. {lic.summary} The full text is in the LICENSE file inside the zip.</dd></div>
                  <div><dt className="t-small font-mono text-fg-3">Changelog</dt><dd className="text-fg-2">None published yet. Release notes will go on <a href={bot.download.github.releases} target="_blank" rel="noopener noreferrer" className="link">GitHub</a>.</dd></div>
                </dl>
              </RevealChild>
            </RevealGroup>
          </div>
        </section>

        <DiscordCta index={n("Requests")} />
      </StatsProvider>
    </>
  );
}
