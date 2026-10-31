import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { More } from "@/components/Button";
import { Blocks } from "@/components/docs/Blocks";
import { Headline } from "@/components/Headline";
import { Mark } from "@/components/Mark";
import { Enter, Reveal } from "@/components/Motion";
import { body, DiscordCta, SectionHead } from "@/components/Sections";
import { getBot, getUpcoming, preview } from "@/lib/bots";
import { docs, getDoc, groups, neighbours } from "@/lib/docs";
import { getMark } from "@/lib/marks";
import { OPENING } from "@/lib/moon";

// Only pages in lib/docs exist; any other slug is a clean 404.
export const dynamicParams = false;
export const generateStaticParams = () => docs.map((d) => ({ slug: d.slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = getDoc((await params).slug);
  if (!doc) return {};
  return preview(`/docs/${doc.slug}`, `${doc.title} · LuniBot docs`, doc.summary);
}

const pad = (n: number) => String(n).padStart(2, "0");

export default async function DocPage({ params }: Props) {
  const doc = getDoc((await params).slug);
  if (!doc) notFound();
  const bot = doc.bot ? getBot(doc.bot) : undefined;
  const soon = getUpcoming(doc.slug);
  const named = bot ?? soon;
  const mark = named ? getMark(named.slug) : null;
  const group = groups.find((g) => g.id === doc.group)!;
  const { prev, next } = neighbours(doc.slug);
  // The page's moments: each section, then the Discord call to action as the full moon.
  const of = doc.sections.length + 1;

  return (
    <>
      <section data-moment={OPENING} className="px-5 pb-16 pt-24 md:pb-24 md:pt-28">
        <div className="mx-auto max-w-page">
          <Enter><More href="/docs" back>All docs</More></Enter>
          {mark && named && <Enter className="mt-10"><Mark svg={mark} name={named.name} size={56} optical /></Enter>}
          <Enter>
            <p className={`t-small font-mono text-fg-3 ${mark ? "mt-6" : "mt-10"}`}>
              Docs · {group.title}
              {bot && <> · v{bot.version} · <span className="capitalize">{bot.status}</span></>}
              {doc.status && <> · {doc.status}</>}
            </p>
          </Enter>
          <Headline text={doc.title} className="t-hero mt-2 max-w-[16ch]" />
          <Enter><p className="t-lead mt-6 max-w-[38ch] text-pretty text-fg-2">{doc.lead}</p></Enter>
          {named && (
            <Enter><p className="t-small mt-6 flex flex-wrap gap-x-6 gap-y-2"><More href={`/bots/${named.slug}`}>{bot ? "Download page" : "Bot page (coming soon)"}</More></p></Enter>
          )}
          <Enter>
            <nav aria-label="On this page" className="mt-14 grid gap-y-4 border-t border-line pt-5 md:grid-cols-[10rem_minmax(0,1fr)]">
              <p className="t-small font-mono text-fg-3">On this page</p>
              <ol className="t-small grid gap-x-10 gap-y-2 sm:grid-cols-2">
                {doc.sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="smooth flex items-baseline text-fg-2 hover:text-fg">
                      <span className="mr-3 w-6 shrink-0 font-mono tabular-nums text-fg-3">{pad(i + 1)}</span>{s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </Enter>
        </div>
      </section>

      {doc.sections.map((s, i) => (
        <section key={s.id} id={s.id} className="scroll-mt-14 px-5 pb-16 md:pb-24">
          <div className="mx-auto max-w-page">
            <SectionHead index={pad(i + 1)} of={of} label={s.label} title={s.title} />
            <Blocks blocks={s.blocks} className={`mt-10 ${body}`} />
            {i === doc.sections.length - 1 && (prev || next) && (
              <Reveal className={`mt-16 ${body}`}>
                <nav aria-label="More docs" className="t-small grid gap-6 border-t border-line pt-5 sm:grid-cols-2">
                  <div>{prev && <><p className="font-mono text-fg-3">Previous</p><More href={`/docs/${prev.slug}`} back className="mt-1">{prev.title}</More></>}</div>
                  <div className="sm:text-right">{next && <><p className="font-mono text-fg-3">Next</p><More href={`/docs/${next.slug}`} className="mt-1">{next.title}</More></>}</div>
                </nav>
              </Reveal>
            )}
          </div>
        </section>
      ))}

      <DiscordCta index={pad(of)} />
    </>
  );
}
