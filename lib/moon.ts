/**
 * The moon, LuniVex's motif (skills/visual-directions.md). Phase runs 0..1: 0 new, 0.25 first quarter,
 * 0.5 full, 0.75 last quarter. Waxing moons are lit on the right, waning on the left (as seen from the
 * northern hemisphere).
 */

/** The lit part of a moon of radius r centred on (0, 0), as an SVG path. Exact: an outer semicircle on the lit side plus the elliptical terminator. */
export function phasePath(phase: number, r: number) {
  const p = ((phase % 1) + 1) % 1;
  const k = Math.abs(Math.cos(2 * Math.PI * p)) * r; // terminator half-width
  const waxing = p < 0.5;
  const crescent = p < 0.25 || p > 0.75;
  const outer = waxing ? 1 : 0;
  const term = waxing ? (crescent ? 0 : 1) : (crescent ? 1 : 0);
  return `M0 ${-r} A${r} ${r} 0 0 ${outer} 0 ${r} A${k.toFixed(3)} ${r} 0 0 ${term} 0 ${-r}Z`;
}

const SYNODIC = 29.530588853; // days
const KNOWN_NEW = Date.UTC(2000, 0, 6, 18, 14); // a new moon

let tonight: ReturnType<typeof moonToday> | null = null;
/** Tonight's moon, worked out once per page load (a stable value for React's external-store snapshots). */
export const moonTonight = () => (tonight ??= moonToday());

/** Tonight's phase (0..1), how much of the disc is lit (0..1), and its name. */
export function moonToday(date = new Date()) {
  const days = (date.getTime() - KNOWN_NEW) / 86_400_000;
  const phase = (((days % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC;
  const lit = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const names: [number, string][] = [[0.03, "New moon"], [0.22, "Waxing crescent"], [0.28, "First quarter"], [0.47, "Waxing gibbous"], [0.53, "Full moon"], [0.72, "Waning gibbous"], [0.78, "Last quarter"], [0.97, "Waning crescent"], [1, "New moon"]];
  return { phase, lit, name: names.find(([end]) => phase < end)![1] };
}
