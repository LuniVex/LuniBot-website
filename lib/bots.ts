import data from "@/data/bots.json";

export type BotStatus = "active" | "beta" | "archived";

/** One entry in data/bots.json. Add a bot by adding an object of this shape. */
export interface Bot {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  language: string;
  runtime: string;
  tags: string[];
  status: BotStatus;
  version: string;
  /** Logo name, drawn in components/AppIcon.tsx ("mail-bubble", "voice-notes"). Unknown names show the first letter. */
  icon: string;
  features: string[];
  commands: { name: string; description: string }[];
  requirements: string[];
  /** "none", or a sentence saying what leaves the user's machine. */
  telemetry: string;
  released: string;
  updated: string;
  license: string;
  /**
   * Screenshots, shown as framed plates. Put each file under public/ at the path given (PNG at 2x,
   * 1600×1000, 16:10). Until a file exists, its plate shows a drawing of what it will show.
   */
  shots: Shot[];
  download: {
    /** Path under public/, e.g. /downloads/my-bot/my-bot-1.0.0.zip */
    file: string;
    sourceDir: string;
    github: { repo: string; path: string; releases: string };
  };
}

export interface Shot { file: string; caption: string; kind: "chat" | "card" | "list" }

export const site = data.site;
export const bots = data.bots as Bot[];

export const getBot = (slug: string) => bots.find((b) => b.slug === slug);
export const allTags = () => [...new Set(bots.flatMap((b) => b.tags))].sort();
// Folder names can contain spaces ("music bot"), so each path segment is URL-encoded.
export const sourceUrl = (b: Bot) =>
  `https://github.com/${b.download.github.repo}/tree/main/${b.download.github.path.split("/").map(encodeURIComponent).join("/")}`;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3001")
).replace(/\/$/, "");

/**
 * Full link-preview tags for a page. A page's own `openGraph` replaces the site-wide one rather than
 * merging with it, so every page builds the complete set here. The preview image comes from the
 * route's opengraph-image file, which Next adds on its own.
 */
export function preview(path: string, title: string, description: string) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website" as const, siteName: site.name, locale: "en_GB", url: path, title, description },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}
