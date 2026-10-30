import { site } from "@/lib/bots";
import { momentPhase } from "@/lib/moon";
import { Pill } from "./Button";
import { MomentLabel, Phase } from "./Moon";
import { Sweep } from "./Moment";
import { Reveal } from "./Motion";

/** Body content of a section starts here on wide screens, past the index column of its SectionHead. */
export const body = "md:pl-40";

/**
 * The head of a numbered section, as on a printed page, and one moment of the page's lunation
 * (`momentPhase` in lib/moon.ts): a page is half a month, from a young crescent at the top to full at its
 * last section. `of` is how many numbered sections the page has.
 *
 * A hairline rule, then the index and label in quiet mono in a fixed left column with the section's phase
 * glyph and its day of the cycle ("D09 · Gibbous"), the title beside them, and an optional note pushed to
 * the right. `data-moment` holds the exact phase: the background moon reads it to wax as you scroll.
 */
export function SectionHead({ index, of, label, title, note }: { index: string; of: number; label: string; title: string; note?: string }) {
  const i = Number(index);
  const phase = momentPhase(i, of);
  return (
    <div data-moment={phase} className="relative pt-5">
      <Sweep from={momentPhase(i - 1, of)} to={phase} />
      <Reveal className="grid gap-y-3 md:grid-cols-[10rem_minmax(0,1fr)_auto] md:items-baseline">
        <div>
          <p className="t-small flex items-center font-mono text-fg-3 tabular-nums">
            <span data-glyph="" className="mr-2.5 translate-y-px"><Phase phase={phase} /></span>{index}<span className="ml-3">{label}</span>
          </p>
          <MomentLabel phase={phase} className="mt-1 block" />
        </div>
        <h2 className="t-section">{title}</h2>
        {note && <p className="t-small max-w-[32ch] text-fg-2 md:pl-6 md:text-right">{note}</p>}
      </Reveal>
    </div>
  );
}

/**
 * The one call to action, last on the hub and on every bot page: join the Discord to suggest a bot or get
 * help. One sentence, one button; nothing else on the page asks for the same thing. As the last moment it is
 * always the full moon.
 */
export function DiscordCta({ index }: { index: string }) {
  return (
    <section className="px-5 pb-16 md:pb-24">
      <div className="mx-auto max-w-page">
        <SectionHead index={index} of={Number(index)} label="Discord" title="Suggest a bot or get help" />
        <Reveal className={`mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${body}`}>
          <p className="t-lead max-w-[36ch] text-fg-2">Tell us what you&apos;d like a bot to do, report a bug, or ask for help setting one up. It all happens in the Discord.</p>
          <Pill href={site.discord} external size="lg" className="shrink-0 self-start md:self-auto">Join the Discord</Pill>
        </Reveal>
      </div>
    </section>
  );
}
