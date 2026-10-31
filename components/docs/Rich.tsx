import Link from "next/link";

const code = "rounded-ui bg-tile px-1.5 py-0.5 font-mono text-[0.85em]";
const PATTERN = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

/** Renders the docs' inline markup: `code`, **emphasis** (full ink colour) and [links](href). */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(PATTERN).map((part, i) => {
        if (!part) return null;
        if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className={`${code} break-words`}>{part.slice(1, -1)}</code>;
        if (part.startsWith("**") && part.endsWith("**")) return <span key={i} className="text-fg">{part.slice(2, -2)}</span>;
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link) {
          const [, label, href] = link;
          if (/^https?:/.test(href)) return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="link">{label}</a>;
          return <Link key={i} href={href} className="link">{label}</Link>;
        }
        return part;
      })}
    </>
  );
}
