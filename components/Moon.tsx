import { BOT_PHASES, type BotPhase, dayLabel, OPENING, phasePath, phaseWord } from "@/lib/moon";

/**
 * Moon drawings in the site's language (skills/visual-directions.md): a hairline disc with its lit part as
 * one flat shape, drawn exactly from the phase. No glow.
 * - `Phase`: the small glyph beside section numbers and in badges.
 * - `Crescent`: the LuniVex mark, the background's diagram in miniature: a waxing crescent, its orbit, and
 *   the one index tick standing where that phase sits on the 30-day dial.
 * - `PhaseBadge`: a bot's assigned phase (data/bots.json `lunar`).
 */
export function Phase({ phase, size = 12, className = "" }: { phase: number; size?: number; className?: string }) {
  return (
    <svg viewBox="-6 -6 12 12" width={size} height={size} aria-hidden="true" className={`shrink-0 ${className}`}>
      <circle r="5.25" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.55" />
      <path d={phasePath(phase, 5.25)} fill="currentColor" />
    </svg>
  );
}

/** Where a phase sits on the dial, as a point at radius r (0 at the top, turning clockwise). */
export const onDial = (phase: number, r: number) => {
  const a = phase * 2 * Math.PI - Math.PI / 2;
  return [Math.cos(a) * r, Math.sin(a) * r] as const;
};

/** The LuniVex mark: the moon at the phase every page opens on (`OPENING`), its orbit, and the dial's index tick for that phase. */
export function Crescent({ size = 18, phase = OPENING, className = "" }: { size?: number; phase?: number; className?: string }) {
  const [x1, y1] = onDial(phase, 9), [x2, y2] = onDial(phase, 12);
  return (
    <svg viewBox="-12 -12 24 24" width={size} height={size} aria-hidden="true" className={`shrink-0 overflow-visible ${className}`}>
      <circle r="10.5" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.3" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <circle r="6.5" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.45" />
      <path d={phasePath(phase, 6.5)} fill="currentColor" />
    </svg>
  );
}

const WORD: Record<BotPhase, string> = { new: "New moon", crescent: "Crescent", quarter: "First quarter", gibbous: "Gibbous", full: "Full moon" };

/** A bot's phase as its badge: the glyph and the phase in the lunar label style. */
export function PhaseBadge({ phase, day = false, className = "" }: { phase: BotPhase; day?: boolean; className?: string }) {
  const p = BOT_PHASES[phase];
  return (
    <span className={`t-label inline-flex items-center gap-2 text-fg-3 ${className}`}>
      <Phase phase={p} size={12} className="text-fg-2" />
      <span>{WORD[phase]}{day && <span className="ml-2">· {dayLabel(p)}</span>}</span>
    </span>
  );
}

/** A section's position in the page's lunation: "D06 · Crescent". */
export function MomentLabel({ phase, className = "" }: { phase: number; className?: string }) {
  return <span className={`t-label text-fg-3 ${className}`}>{dayLabel(phase)} · {phaseWord(phase)}</span>;
}
