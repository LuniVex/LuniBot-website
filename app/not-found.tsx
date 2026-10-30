import Link from "next/link";
import { Mark } from "@/components/Mark";
import { Pill } from "@/components/Button";
import { bots } from "@/lib/bots";
import { getMark } from "@/lib/marks";

export default function NotFound() {
  return (
    <section className="px-5 pb-24 pt-32 md:pb-32 md:pt-40">
      <div className="mx-auto max-w-page">
      <p className="t-small font-mono text-fg-3">404</p>
      <h1 className="t-hero mt-3 max-w-[16ch]">This page can&apos;t be found.</h1>
      <p className="t-lead mt-6 max-w-[34ch] text-fg-2">The link may be out of date, or the bot may have been renamed. These are the bots on the site:</p>
      <ul className="mt-12 grid max-w-[640px] gap-4 sm:grid-cols-2">
        {bots.map((b) => (
          <li key={b.slug}>
            <Link href={`/bots/${b.slug}`} className="smooth flex items-center gap-4 rounded-ui bg-tile p-4 hover:bg-line/40">
              <Mark svg={getMark(b.slug)} name={b.name} size={40} />
              <span><span className="block font-semibold">{b.name}</span><span className="t-small text-fg-2">{b.tagline}</span></span>
            </Link>
          </li>
        ))}
      </ul>
      <Pill href="/" size="lg" className="mt-12">Back to all bots</Pill>
      </div>
    </section>
  );
}
