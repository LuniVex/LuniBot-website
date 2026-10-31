/**
 * The docs content model. Each page in lib/docs/pages/ is plain data: numbered sections made of blocks.
 * Text fields accept three bits of inline markup: `code`, **emphasis** and [links](/path).
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "term"; title?: string; lines: { cmd: string; note?: string }[] }
  | { type: "code"; title: string; text: string }
  | { type: "table"; head: string[]; rows: string[][]; mono?: number[] }
  | { type: "commands"; items: { name: string; description: string }[] }
  | { type: "note"; label: string; text: string }
  | { type: "qa"; items: { q: string; a: string }[] };

export interface DocSection {
  id: string;
  /** Short word beside the index in the margin column ("Install", "Commands"). */
  label: string;
  title: string;
  blocks: Block[];
}

export type DocGroup = "start" | "bots" | "help";

export interface DocPage {
  slug: string;
  group: DocGroup;
  title: string;
  /** One sentence for the docs index and link previews. */
  summary: string;
  /** The intro under the title. */
  lead: string;
  /** For bot guides: the bot's slug in data/bots.json, if it is released. */
  bot?: string;
  /** Shown instead of a version for a bot that is not released yet. */
  status?: string;
  sections: DocSection[];
}

// Small constructors keep the page files readable.
export const p = (text: string): Block => ({ type: "p", text });
export const h = (text: string): Block => ({ type: "h", text });
export const list = (...items: string[]): Block => ({ type: "list", items });
export const steps = (...items: string[]): Block => ({ type: "steps", items });
/** Terminal lines: a command, or [command, comment]. */
export const term = (lines: (string | [string] | [string, string])[], title?: string): Block => ({
  type: "term",
  title,
  lines: lines.map((l) => (typeof l === "string" ? { cmd: l } : { cmd: l[0], note: l[1] })),
});
export const code = (title: string, text: string): Block => ({ type: "code", title, text: text.replace(/^\n|\n\s*$/g, "") });
export const table = (head: string[], rows: string[][], mono: number[] = [0]): Block => ({ type: "table", head, rows, mono });
export const commands = (items: [string, string][]): Block => ({ type: "commands", items: items.map(([name, description]) => ({ name, description })) });
export const note = (text: string, label = "Note"): Block => ({ type: "note", label, text });
export const warn = (text: string): Block => note(text, "Warning");
export const qa = (items: [string, string][]): Block => ({ type: "qa", items: items.map(([q, a]) => ({ q, a })) });
