import { CmdLine, SlashCommand, TermFrame } from "@/components/Term";
import { RevealChild, RevealGroup } from "@/components/Motion";
import type { Block } from "@/lib/docs/types";
import { Rich } from "./Rich";

const prose = "max-w-[60ch]";

function One({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p className={`${prose} text-pretty text-fg-2`}><Rich text={block.text} /></p>;
    case "h":
      return <h3 className="t-h3 pt-4 text-balance">{block.text}</h3>;
    case "list":
      return (
        <ul className={`${prose} flex flex-col gap-2 text-fg-2`}>
          {block.items.map((item, i) => (
            <li key={i} className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-baseline">
              <span aria-hidden="true" className="text-fg-3">–</span>
              <span className="text-pretty"><Rich text={item} /></span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className={`${prose} flex flex-col gap-3 text-fg-2`}>
          {block.items.map((item, i) => (
            <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline">
              <span className="t-small font-mono tabular-nums text-fg-3">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-pretty"><Rich text={item} /></span>
            </li>
          ))}
        </ol>
      );
    case "term":
      return (
        <TermFrame title={block.title}>
          {block.lines.map((line, i) => <CmdLine key={i} line={line} />)}
        </TermFrame>
      );
    case "code":
      return (
        <TermFrame title={block.title}>
          <pre className="whitespace-pre-wrap break-words font-mono">{block.text}</pre>
        </TermFrame>
      );
    case "table":
      return (
        <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
          <table className="t-small w-full min-w-[34rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                {block.head.map((cell) => <th key={cell} scope="col" className="py-2 pr-6 align-bottom font-mono font-normal text-fg-3">{cell}</th>)}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-b border-line/70 align-baseline">
                  {row.map((cell, c) => (
                    <td key={c} className={`py-3 pr-6 ${c === 0 ? "text-fg" : "text-fg-2"} ${block.mono?.includes(c) ? "whitespace-nowrap font-mono" : ""}`}>
                      <Rich text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "commands":
      return (
        <ul className="border-b border-line/70">
          {block.items.map((c) => (
            <li key={c.name} className="grid gap-1 border-t border-line/70 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6">
              <SlashCommand name={c.name} />
              <span className="text-pretty text-fg-2"><Rich text={c.description} /></span>
            </li>
          ))}
        </ul>
      );
    case "note":
      return (
        <aside className={`${prose} rounded-ui bg-tile px-6 py-5`}>
          <p className="t-small font-mono text-fg-3">{block.label}</p>
          <p className="mt-1 text-pretty text-fg-2"><Rich text={block.text} /></p>
        </aside>
      );
    case "qa":
      return (
        <dl className={`${prose} border-b border-line/70`}>
          {block.items.map((item) => (
            <div key={item.q} className="border-t border-line/70 py-4">
              <dt className="text-balance text-fg"><Rich text={item.q} /></dt>
              <dd className="mt-1 text-pretty text-fg-2"><Rich text={item.a} /></dd>
            </div>
          ))}
        </dl>
      );
  }
}

/** A section's blocks, revealed as one cascade. */
export function Blocks({ blocks, className = "" }: { blocks: Block[]; className?: string }) {
  return (
    <RevealGroup className={`flex flex-col gap-6 ${className}`}>
      {blocks.map((block, i) => (
        <RevealChild key={i}><One block={block} /></RevealChild>
      ))}
    </RevealGroup>
  );
}
