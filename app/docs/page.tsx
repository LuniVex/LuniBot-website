import type { Metadata } from "next";
import Link from "next/link";
import { More } from "@/components/Button";
import { Headline } from "@/components/Headline";
import { Enter, RevealChild, RevealGroup } from "@/components/Motion";
import { body, DiscordCta, SectionHead } from "@/components/Sections";
import { getBot, preview } from "@/lib/bots";
import { docs, groups } from "@/lib/docs";
import { OPENING } from "@/lib/moon";

export const metadata: Metadata = preview(
  "/docs",
  "Docs · LuniBot",
  "Guides for every LuniBot bot: installing, configuring, commands, hosting 24/7, keeping data safe, and fixing problems.",
);

const pad = (n: number) => String(n).padStart(2, "0");

export default function DocsIndex() {
  const of = groups.length + 1;
  return (
    <>
      <section data-moment={OPENING} className="px-5 pb-16 pt-32 md:pb-24 md:pt-40">
        <div className="mx-auto max-w-page">
          <Headline text="Docs" className="t-hero max-w-[16ch]" />
          <Enter><p className="t-lead mt-6 max-w-[38ch] text-pretty text-fg-2">How to install, run and configure each bot, keep it online, and fix it when something goes wrong.</p></Enter>
          <Enter><p className="mt-8"><More href="/docs/getting-started">New here? Start with Getting started</More></p></Enter>
        </div>
      </section>

      {groups.map((g, i) => (
        <section key={g.id} id={g.id} className="scroll-mt-14 px-5 pb-16 md:pb-24">
          <div className="mx-auto max-w-page">
            <SectionHead index={pad(i + 1)} of={of} label={g.label} title={g.title} note={g.note} />
            <RevealGroup className={`mt-10 border-b border-line/70 ${body}`}>
              {docs.filter((d) => d.group === g.id).map((d) => {
                const bot = d.bot ? getBot(d.bot) : undefined;
                const meta = bot ? `v${bot.version} · ${bot.status}` : d.status;
                return (
                  <RevealChild key={d.slug} className="grid gap-x-6 gap-y-1 border-t border-line/70 py-5 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:items-baseline">
                    <div>
                      <Link href={`/docs/${d.slug}`} className="smooth t-h3 text-balance text-fg decoration-1 underline-offset-[0.2em] hover:underline">{d.title}</Link>
                      {meta && <p className="t-small mt-1 font-mono text-fg-3">{meta}</p>}
                    </div>
                    <p className="max-w-[60ch] text-pretty text-fg-2">{d.summary}</p>
                  </RevealChild>
                );
              })}
            </RevealGroup>
          </div>
        </section>
      ))}

      <DiscordCta index={pad(of)} />
    </>
  );
}
