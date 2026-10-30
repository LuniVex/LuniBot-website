import Link from "next/link";
import { site } from "@/lib/bots";
import { Crescent } from "./Moon";
import { MoonTonight } from "./MoonTonight";

/** The footer: LuniBot by LuniVex, where to go, and the fine print (with tonight's moon), on the page grid. */
export function Footer() {
  const year = new Date().getFullYear();
  const col = "t-small flex flex-col gap-2";
  const link = "smooth text-fg-2 hover:text-fg";
  return (
    <footer className="border-t border-line bg-alt px-5">
      <div className="mx-auto max-w-page py-12">
        <div className="grid gap-10 md:grid-cols-[10rem_minmax(0,1fr)_10rem_10rem]">
          <div><p className="t-body-lg flex items-center gap-2 font-semibold"><Crescent size={18} />{site.name}</p><p className="t-small mt-1 text-fg-3">by {site.owner}</p></div>
          <p className="t-small max-w-[44ch] text-fg-2">Discord bots you download and run yourself. Each is a zip of source code under GPL-3.0, with a checksum to check it against.</p>
          <nav aria-label="Site" className={col}>
            <p className="font-mono text-fg-3">Site</p>
            <Link href="/" className={link}>Bots</Link>
            <Link href="/about" className={link}>About</Link>
            <Link href="/about#checking" className={link}>Checking a download</Link>
          </nav>
          <nav aria-label="Elsewhere" className={col}>
            <p className="font-mono text-fg-3">Elsewhere</p>
            <a href={`https://github.com/${site.githubOwner}`} target="_blank" rel="noopener noreferrer" className={link}>GitHub</a>
            <a href={site.discord} target="_blank" rel="noopener noreferrer" className={link}>Discord server</a>
          </nav>
        </div>
        <div className="t-tiny mt-12 flex flex-col gap-2 border-t border-line pt-5 text-fg-3 sm:flex-row sm:justify-between">
          <p>Downloads and upvotes are counted anonymously; see <Link href="/about#counting" className="link">what the site counts</Link>. Not affiliated with Discord or OpenAI.</p>
          <p className="flex shrink-0 flex-col gap-1 sm:items-end"><MoonTonight /><span>© {year} {site.owner}</span></p>
        </div>
      </div>
    </footer>
  );
}
