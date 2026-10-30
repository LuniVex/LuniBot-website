import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A bot's mark from public/marks/<slug>.svg, read at build time and returned as markup to inline, so it
 * costs no extra request and inherits the theme through currentColor. Null if the bot has no mark yet.
 */
export function getMark(slug: string): string | null {
  try {
    return readFileSync(join(process.cwd(), "public", "marks", `${slug}.svg`), "utf8")
      .replace(/<title>.*?<\/title>/, "")
      .replace("<svg ", '<svg aria-hidden="true" focusable="false" ')
      .trim();
  } catch {
    return null;
  }
}
