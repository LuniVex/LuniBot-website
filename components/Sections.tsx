import { site } from "@/lib/bots";
import { Pill } from "./Button";
import { Phase } from "./Moon";
import { Reveal } from "./Motion";

/** Body content of a section starts here on wide screens, past the index column of its SectionHead. */
export const body = "md:pl-40";

/** Each section's moon: thin crescent at 01, waxing down the page, full by the last (07). */
const phaseFor = (index: string) => Math.min(0.5, 0.04 + (Number(index) - 1) * 0.077);

/**
 * The head of a numbered section, as on a printed page: a hairline rule, then the index and label in
 * quiet mono in a fixed left column (with a small moon that waxes from section to section, so a page reads
 * as one lunar cycle), the title beside them, and an optional note pushed to the right.
 */
export function SectionHead({ index, label, title, note }: { index: string; label: string; title: string; note?: string }) {
  return (
    <Reveal className="grid gap-y-3 border-t border-line pt-5 md:grid-cols-[10rem_minmax(0,1fr)_auto] md:items-baseline">
      <p className="t-small flex items-center font-mono text-fg-3 tabular-nums"><Phase phase={phaseFor(index)} className="mr-2.5 translate-y-px" />{index}<span className="ml-3">{label}</span></p>
      <h2 className="t-section">{title}</h2>
      {note && <p className="t-small max-w-[32ch] text-fg-2 md:pl-6 md:text-right">{note}</p>}
    </Reveal>
  );
}

/**
 * The one call to action, last on the hub and on every bot page: join the Discord to suggest a bot or get
 * help. One sentence, one button; nothing else on the page asks for the same thing.
 */
export function DiscordCta({ index }: { index: string }) {
  return (
    <section className="px-5 pb-16 md:pb-24">
      <div className="mx-auto max-w-page">
        <SectionHead index={index} label="Discord" title="Suggest a bot or get help" />
        <Reveal className={`mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${body}`}>
          <p className="t-lead max-w-[36ch] text-fg-2">Tell us what you&apos;d like a bot to do, report a bug, or ask for help setting one up. It all happens in the Discord.</p>
          <Pill href={site.discord} external size="lg" className="shrink-0 self-start md:self-auto">Join the Discord</Pill>
        </Reveal>
      </div>
    </section>
  );
}
