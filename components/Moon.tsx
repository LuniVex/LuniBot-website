import { phasePath } from "@/lib/moon";

/**
 * Moon drawings in the site's language: a hairline disc with its lit part as one flat shape. No glow.
 * `Phase` is the small glyph beside section numbers; `Crescent` is the LuniVex mark.
 */
export function Phase({ phase, size = 12, className = "" }: { phase: number; size?: number; className?: string }) {
  return (
    <svg viewBox="-6 -6 12 12" width={size} height={size} aria-hidden="true" className={`shrink-0 ${className}`}>
      <circle r="5.25" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.55" />
      <path d={phasePath(phase, 5.25)} fill="currentColor" />
    </svg>
  );
}

/** The LuniVex crescent: a waxing crescent and the faint outline of the rest of its disc. */
export function Crescent({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" width={size} height={size} aria-hidden="true" className={`shrink-0 ${className}`}>
      <circle r="10.5" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.35" />
      <path d={phasePath(0.16, 10.5)} fill="currentColor" />
    </svg>
  );
}
