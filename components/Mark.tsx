/**
 * A bot's mark (public/marks/*.svg), inlined. Lines are drawn in the text colour and the one solid
 * shape in the accent. The stroke is scaled so it renders at 1.5px at any size, matching the hairlines.
 * Without a mark, the bot's first letter stands in.
 */
export function Mark({ svg, name, size = 56, optical = false, journey, className = "" }: { svg: string | null; name: string; size?: number; optical?: boolean; journey?: string; className?: string }) {
  // Optical alignment: the ink starts 6 units into the 48-unit box, so a mark on a left edge is pulled left by that much.
  const style = { width: size, height: size, "--mark-sw": (1.5 * 48) / size, marginLeft: optical ? -(size * 6) / 48 : undefined } as React.CSSProperties;
  if (!svg) {
    return <span aria-hidden="true" style={style} className={`grid place-items-center rounded-ui border border-line font-mono text-fg-2 ${className}`}>{name.charAt(0)}</span>;
  }
  // `journey`: this mark is where the hub's 3D slab for that bot lands (components/StackJourney.tsx).
  return <span data-mark="" data-journey={journey} aria-hidden="true" style={style} className={`mark block shrink-0 text-fg ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}
