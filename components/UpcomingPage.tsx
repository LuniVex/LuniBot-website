import Link from "next/link";
import { More, Pill } from "@/components/Button";
import { Headline } from "@/components/Headline";
import { Mark } from "@/components/Mark";
import { PhaseBadge } from "@/components/Moon";
import { Enter, Reveal, RevealChild, RevealGroup } from "@/components/Motion";
import { body, DiscordCta, SectionHead } from "@/components/Sections";
import { SlashCommand } from "@/components/Term";
import type { UpcomingBot } from "@/lib/bots";
import { licenseInfo } from "@/lib/license";
import { getMark } from "@/lib/marks";
import { OPENING } from "@/lib/moon";

/**
 * The page of a bot that is built but not released (data/bots.json `upcoming`): what it will do, its
 * commands and what it needs, but no download, stats or votes. The one accent in the hero is the button to
 * its docs, which already describe the version in testing.
 */
export function UpcomingPage({ bot }: { bot: UpcomingBot }) {
  const mark = getMark(bot.slug);
  const lic = licenseInfo(bot.license);
  const of = 4;

  return (
    <>
      <section data-moment={OPENING} className="px-5 pb-16 pt-24 md:pb-24 md:pt-28">
        <div className="mx-auto max-w-page">
          <Enter><More href="/" back>All bots</More></Enter>
          <div className="mt-10 md:mt-14">
            <Enter><Mark svg={mark} name={bot.name} size={88} optical /></Enter>
            <Enter><p className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2"><span className="t-small font-mono text-fg-3">Coming soon · {bot.stage} · v{bot.version}</span><PhaseBadge phase={bot.lunar.phase} /></p></Enter>
            <Headline text={bot.name} className="t-hero mt-2" split="chars" each={0.05} />
            <Enter><p className="t-lead mt-3 max-w-[30ch] text-fg-2">{bot.tagline}</p></Enter>
            <Enter className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Pill href={`/docs/${bot.slug}`} size="lg">Read the docs</Pill>
              <More href="#news">Hear when it&apos;s out</More>
            </Enter>
            <Enter><p className="t-small mt-4 text-fg-3">{bot.language} · {bot.runtime} · {lic.short} licence · not downloadable yet</p></Enter>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 md:pb-24">
        <Reveal className={`mx-auto grid max-w-page gap-8 ${body}`}>
          <p className="t-lead max-w-[38ch]">{bot.description}</p>
          <aside className="max-w-[60ch] rounded-ui bg-tile px-6 py-5">
            <p className="t-small font-mono text-fg-3">Where it stands</p>
            <p className="mt-1 text-pretty text-fg-2">{bot.note}</p>
          </aside>
        </Reveal>
      </section>

      <section className="px-5 pb-16 md:pb-24">
        <div className="mx-auto max-w-page">
          <SectionHead of={of} index="01" label="Features" title="What it will do" />
          <RevealGroup className={`mt-10 grid gap-x-10 md:grid-cols-2 ${body}`}>
            {bot.features.map((f) => (
              <RevealChild key={f} className="flex gap-3 border-t border-line/70 py-4">
                <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-1 size-4 shrink-0 text-fg-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
                <span>{f}</span>
              </RevealChild>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="px-5 pb-16 md:pb-24">
        <div className="mx-auto max-w-page">
          <SectionHead of={of} index="02" label="Commands" title="Slash commands" note="The main ones. The docs list every command and setting." />
          <Reveal className={`mt-10 ${body}`}>
            <ul className="border-b border-line/70">
              {bot.commands.map((c) => (
                <li key={c.name} className="grid gap-1 border-t border-line/70 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6">
                  <SlashCommand name={c.name} />
                  <span className="text-fg-2">{c.description}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6"><More href={`/docs/${bot.slug}#commands`}>All commands</More></p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pb-16 md:pb-24">
        <div className="mx-auto max-w-page">
          <SectionHead of={of} index="03" label="Requirements" title="Before you start" />
          <RevealGroup className={`mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 ${body}`}>
            <RevealChild className="border-t border-line/70 pt-5">
              <h3 className="t-h3">You&apos;ll need</h3>
              <ul className="mt-4 flex flex-col gap-3 text-fg-2">{bot.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
            </RevealChild>
            <RevealChild className="border-t border-line/70 pt-5">
              <h3 className="t-h3">Good to know</h3>
              <dl className="mt-4 flex flex-col gap-3">
                <div><dt className="t-small font-mono text-fg-3">Full guide</dt><dd className="text-fg-2">Setup, every setting and troubleshooting in the <Link href={`/docs/${bot.slug}`} className="link">{bot.name} docs</Link>.</dd></div>
                <div><dt className="t-small font-mono text-fg-3">Data it sends</dt><dd className="text-fg-2">{bot.telemetry}</dd></div>
                <div><dt className="t-small font-mono text-fg-3">Its phase</dt><dd className="text-fg-2"><span className="mb-1 mt-0.5 block"><PhaseBadge phase={bot.lunar.phase} /></span>{bot.lunar.reason}</dd></div>
                <div><dt className="t-small font-mono text-fg-3">Licence</dt><dd className="text-fg-2">{lic.url ? <a href={lic.url} target="_blank" rel="noopener noreferrer" className="link">{lic.name}</a> : lic.name}. {lic.summary}</dd></div>
              </dl>
            </RevealChild>
          </RevealGroup>
        </div>
      </section>

      <div id="news" className="scroll-mt-14"><DiscordCta index="04" /></div>
    </>
  );
}
