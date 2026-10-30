import { More, Pill } from "./Button";
import { Headline } from "./Headline";
import { Crescent } from "./Moon";
import { Enter } from "./Motion";
import { StackDrawing } from "./StackDrawing";

/**
 * The hero, split 5:4 on the grid. Left: the headline, one plain sentence and the two actions. Right: the
 * stack, one slab per bot carrying its mark. The static drawing lives here; when the 3D journey is live
 * (components/StackJourney.tsx) it draws the stack over this box and carries each slab down to its card.
 */
export function Hero({ marks }: { marks: (string | null)[] }) {
  return (
    <section data-hero="" className="px-5 pb-16 pt-24 md:pb-24 md:pt-28">
      <div className="mx-auto grid max-w-page items-center gap-x-10 gap-y-12 md:min-h-[calc(100svh-15rem)] md:grid-cols-[5fr_4fr]">
        <div>
          <Enter><p className="t-small mb-6 flex items-center gap-2 font-mono text-fg-3"><Crescent size={14} className="text-fg-2" />LuniVex · LuniBot</p></Enter>
          <Headline text="Discord bots you run yourself." className="t-hero max-w-[12ch]" />
          <Enter>
            <p className="t-lead mt-6 max-w-[30ch] text-fg-2">
              Download a bot, add your bot token, and start it on your own computer or server. It&apos;s free and you don&apos;t need an account.
            </p>
          </Enter>
          <Enter className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Pill href="#bots" size="lg">Browse bots</Pill>
            <More href="#how" className="t-control-lg">How it works</More>
          </Enter>
        </div>
        <div data-stack-anchor="" className="relative aspect-square w-full max-w-xs justify-self-center md:max-w-sm">
          <StackDrawing marks={marks} />
        </div>
      </div>
    </section>
  );
}
