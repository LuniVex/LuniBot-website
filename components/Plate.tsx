import Image from "next/image";
import type { Shot } from "@/lib/bots";

/**
 * A screenshot framed like a printed plate: 1px hairline, small radius, a fixed 16:10 window, and a
 * caption line in quiet metadata type ("Fig. 2  Now-playing card…"). Until the real screenshot exists,
 * the plate shows a hairline drawing of what it will show, labelled so it's clearly a stand-in.
 */
export function Plate({ shot, fig, ready, priority = false, className = "" }: { shot: Shot; fig: number; ready: boolean; priority?: boolean; className?: string }) {
  return (
    <figure className={className}>
      <div data-plate="" className="relative aspect-[16/10] overflow-hidden rounded-ui border border-line bg-bg">
        {ready ? (
          <Image src={shot.file} alt={shot.caption} fill sizes="(min-width: 980px) 600px, 100vw" priority={priority} className="object-cover object-top" />
        ) : (
          <>
            <Schematic kind={shot.kind} />
            <span className="t-tiny absolute left-3 top-2.5 font-mono text-fg-3">Screenshot to come</span>
          </>
        )}
      </div>
      <figcaption className="t-small mt-3 flex gap-3 text-fg-3">
        <span className="shrink-0 font-mono tabular-nums">Fig. {fig}</span>
        <span>{shot.caption}</span>
      </figcaption>
    </figure>
  );
}

const line = { vectorEffect: "non-scaling-stroke" as const, stroke: "currentColor", strokeWidth: 1, fill: "none" };
/** A bar of "text" in the drawing. */
const Text = ({ x, y, w, o = 0.22 }: { x: number; y: number; w: number; o?: number }) => <rect x={x} y={y} width={w} height={5} fill="currentColor" opacity={o} />;
/** A message author: round avatar and a name. */
const Author = ({ y, name = 54 }: { y: number; name?: number }) => (
  <><circle cx={34} cy={y + 8} r={9} fill="currentColor" opacity={0.16} /><Text x={52} y={y} w={name} o={0.45} /></>
);

/** Hairline wireframes of Discord views, in the theme's greys with one accent element. */
function Schematic({ kind }: { kind: Shot["kind"] }) {
  return (
    <svg viewBox="0 0 320 200" aria-hidden="true" className="absolute inset-0 size-full text-fg-3" preserveAspectRatio="xMidYMid meet">
      {kind === "chat" && (
        <g>
          <Author y={30} /><Text x={52} y={44} w={196} /><Text x={52} y={54} w={150} />
          <Author y={82} name={40} />
          <rect x={52} y={95} width={3} height={22} fill="var(--blue)" />
          <Text x={62} y={97} w={170} /><Text x={62} y={108} w={120} />
          <Author y={138} name={62} /><Text x={52} y={152} w={210} /><Text x={52} y={162} w={88} />
        </g>
      )}
      {kind === "card" && (
        <g>
          <Author y={22} />
          <rect x={52} y={42} width={236} height={136} {...line} opacity={0.6} />
          <rect x={52} y={42} width={3} height={136} fill="var(--blue)" />
          <Text x={66} y={56} w={120} o={0.45} /><Text x={66} y={70} w={180} /><Text x={66} y={80} w={140} />
          <line x1={66} y1={110} x2={274} y2={110} {...line} opacity={0.6} />
          <line x1={66} y1={110} x2={150} y2={110} {...line} stroke="var(--blue)" />
          <circle cx={150} cy={110} r={3} fill="var(--blue)" />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={66 + i * 34} y={130} width={26} height={14} {...line} opacity={0.6} />)}
          <Text x={66} y={160} w={70} />
        </g>
      )}
      {kind === "list" && (
        <g>
          <Text x={28} y={24} w={110} o={0.45} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <line x1={28} y1={44 + i * 24} x2={292} y2={44 + i * 24} {...line} opacity={0.35} />
              {i === 1 && <rect x={28} y={48 + i * 24} width={3} height={16} fill="var(--blue)" />}
              <Text x={38} y={53 + i * 24} w={10} o={0.35} />
              <Text x={60} y={53 + i * 24} w={[150, 118, 172, 96, 140, 124][i]} />
              <Text x={252} y={53 + i * 24} w={40} o={0.16} />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
