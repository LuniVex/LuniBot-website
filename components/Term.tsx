/**
 * The terminal block and its syntax colouring, kept to the one accent: command names in the accent,
 * flags in a lighter accent, operators and comments in the quiet grey, everything else plain.
 */
export interface Token { text: string; cls: string }

export function tokens(cmd: string): Token[] {
  let expectCommand = true;
  return cmd.split(/(\s+)/).filter(Boolean).map((text) => {
    if (/^\s+$/.test(text)) return { text, cls: "" };
    if (text === "&&" || text === "|") { expectCommand = true; return { text, cls: "text-fg-3" }; }
    if (expectCommand) { expectCommand = false; return { text, cls: "text-link" }; }
    if (text.startsWith("-")) return { text, cls: "text-link/70" };
    if (/^["'].*["']$/.test(text)) return { text, cls: "text-fg-2" };
    return { text, cls: "" };
  });
}

export interface Line { cmd: string; note?: string }

/** The window: hairline frame, a title bar, then mono lines. */
export function TermFrame({ title = "Terminal", className = "", children }: { title?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`overflow-hidden rounded-ui border border-line text-left ${className}`}>
      <div className="relative flex h-9 items-center border-b border-line bg-alt px-4">
        <span className="flex gap-2" aria-hidden="true">
          <i className="size-2.5 rounded-full border border-line" /><i className="size-2.5 rounded-full border border-line" /><i className="size-2.5 rounded-full border border-line" />
        </span>
        <span className="t-tiny absolute inset-x-0 text-center font-mono text-fg-3">{title}</span>
      </div>
      <div className="t-mono bg-bg px-6 py-5 leading-7 dark:bg-tile">{children}</div>
    </div>
  );
}

/** One coloured command line with its prompt and optional comment. */
export function CmdLine({ line }: { line: Line }) {
  return (
    <p className="break-words">
      <span className="select-none text-fg-3">$ </span>
      {tokens(line.cmd).map((t, i) => <span key={i} className={t.cls}>{t.text}</span>)}
      {line.note && <span className="text-fg-3 max-sm:block max-sm:pl-4">{"  "}# {line.note}</span>}
    </p>
  );
}

/**
 * A slash command with its parts told apart: the command in full colour, subcommand choices in
 * secondary grey, <required> arguments in the accent and [optional] ones in the quiet grey.
 */
export function SlashCommand({ name }: { name: string }) {
  return (
    <code className="t-mono break-words">
      {name.split(/(\s+)/).map((part, i) => (
        <span key={i} className={
          i === 0 ? "text-fg" : part.startsWith("<") ? "text-link" : part.startsWith("[") ? "text-fg-3" : part.includes("|") ? "text-fg-2" : ""
        }>{part}</span>
      ))}
    </code>
  );
}
