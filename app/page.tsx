import { BotGallery } from "@/components/BotGallery";
import { Hero } from "@/components/Hero";
import { HowItWorks, LatestUpdates } from "@/components/HubSections";
import { DiscordCta, SectionHead } from "@/components/Sections";
import { StackJourney } from "@/components/StackJourney";
import { bots } from "@/lib/bots";
import { getFile, inPublic } from "@/lib/files";
import { fmtSize } from "@/lib/format";
import { getMark } from "@/lib/marks";

/**
 * The hub, in one order: the hero; 01 the bots (the hero's 3D stack travels into their cards); 02 how it
 * works; 03 latest updates and the plain facts; 04 the one call to action; then the footer.
 */
export default function Hub() {
  // The most recently updated bot is featured: first, full width, with its first screenshot.
  const featured = [...bots].sort((a, b) => b.updated.localeCompare(a.updated) || b.released.localeCompare(a.released))[0]?.slug ?? "";
  const ordered = [...bots].sort((a, b) => Number(b.slug === featured) - Number(a.slug === featured));
  const entries = ordered.map((bot, i) => {
    const file = getFile(bot);
    const first = bot.shots[0];
    return {
      bot, size: file ? fmtSize(file.size) : "no file", index: String(i + 1).padStart(2, "0"), mark: getMark(bot.slug),
      shot: first ? { shot: first, ready: inPublic(first.file) } : undefined,
    };
  });
  const zip = bots[0]?.download.file.split("/").pop() ?? "bot.zip";
  const marks = entries.map((e) => e.mark);
  const slugs = entries.map((e) => e.bot.slug);

  return (
    <>
      <Hero marks={marks} />
      <StackJourney slugs={slugs} marks={marks.map((m) => m ?? "")} />
      <section id="bots" className="scroll-mt-14 px-5 pb-16 md:pb-24">
        <div className="mx-auto max-w-page">
          <SectionHead index="01" label="Bots" title="Pick a bot" note="Each one is a zip of source code with a GPL‑3.0 licence. Free, and no account." />
          <div className="mt-10">
            <BotGallery entries={entries} featured={featured} soonMark={getMark("soon")} />
          </div>
        </div>
      </section>
      <div id="how" className="scroll-mt-14"><HowItWorks index="02" zip={zip} /></div>
      <LatestUpdates index="03" />
      <DiscordCta index="04" />
    </>
  );
}
