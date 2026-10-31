import type { DocGroup, DocPage } from "./types";
import { gettingStarted } from "./pages/getting-started";
import { hosting } from "./pages/hosting";
import { safety } from "./pages/safety";
import { modmail } from "./pages/modmail";
import { discmeet } from "./pages/discmeet";
import { musicBot } from "./pages/music-bot";
import { guard } from "./pages/guard";
import { troubleshooting } from "./pages/troubleshooting";
import { faq } from "./pages/faq";

/** Every docs page, in reading order. Previous and next links follow this order. */
export const docs: DocPage[] = [gettingStarted, hosting, safety, modmail, discmeet, musicBot, guard, troubleshooting, faq];

export const groups: { id: DocGroup; label: string; title: string; note: string }[] = [
  { id: "start", label: "Start", title: "Start here", note: "What every bot has in common." },
  { id: "bots", label: "Bots", title: "Bot guides", note: "Setup, commands and settings for each bot." },
  { id: "help", label: "Help", title: "When something goes wrong", note: "Fixes and short answers." },
];

export const getDoc = (slug: string) => docs.find((d) => d.slug === slug);

export function neighbours(slug: string) {
  const i = docs.findIndex((d) => d.slug === slug);
  return { prev: i > 0 ? docs[i - 1] : null, next: i >= 0 && i < docs.length - 1 ? docs[i + 1] : null };
}
