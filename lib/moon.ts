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

/** The mean synodic month: new moon to new moon, in days. */
export const SYNODIC = 29.530588853;
const DAY = 86_400_000;
const rad = Math.PI / 180;

/**
 * The time of a true new moon (integer k) or full moon (k + 0.5), counted in lunations from the new moon
 * of 6 January 2000. Meeus, Astronomical Algorithms, chapter 49, with its periodic terms down to 0.00017
 * days: accurate to a few minutes, so the day numbers and the dates of the next full and new moon are exact.
 */
function lunation(k: number) {
  const T = k / 1236.85;
  const jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T ** 2 - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T ** 2;
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T ** 2) * rad;
  const Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T ** 2 + 0.00001238 * T ** 3) * rad;
  const F = (160.7108 + 390.67050284 * k - 0.0016118 * T ** 2 - 0.00000227 * T ** 3) * rad;
  const O = (124.7746 - 1.56375588 * k + 0.0020672 * T ** 2) * rad;
  const full = k % 1 !== 0;
  const c = full
    ? [-0.40614, 0.17302, 0.01614, 0.01043, 0.00734, -0.00515, 0.00209]
    : [-0.4072, 0.17241, 0.01608, 0.01039, 0.00739, -0.00514, 0.00208];
  const fix = c[0] * Math.sin(Mp) + c[1] * E * Math.sin(M) + c[2] * Math.sin(2 * Mp) + c[3] * Math.sin(2 * F)
    + c[4] * E * Math.sin(Mp - M) + c[5] * E * Math.sin(Mp + M) + c[6] * E * E * Math.sin(2 * M)
    - 0.00111 * Math.sin(Mp - 2 * F) - 0.00057 * Math.sin(Mp + 2 * F) + 0.00056 * E * Math.sin(2 * Mp + M)
    - 0.00042 * Math.sin(3 * Mp) + 0.00042 * E * Math.sin(M + 2 * F) + 0.00038 * E * Math.sin(M - 2 * F)
    - 0.00024 * E * Math.sin(2 * Mp - M) - 0.00017 * Math.sin(O);
  return (jde + fix - 2440587.5) * DAY; // Julian day to Unix milliseconds
}

let tonight: ReturnType<typeof moonToday> | null = null;
/** Tonight's moon, worked out once per page load (a stable value for React's external-store snapshots). */
export const moonTonight = () => (tonight ??= moonToday());

/**
 * The moon at a moment: phase (0..1, from the true new and full moons around it), how much of the disc is
 * lit, its name, its age in days and day of the lunation (1..30), and the next new and full moons.
 */
export function moonToday(date = new Date()) {
  const t = date.getTime();
  let k = Math.floor((t / DAY + 2440587.5 - 2451550.09766) / 29.530588861);
  while (lunation(k) > t) k--;
  while (lunation(k + 1) <= t) k++;
  const [start, full, end] = [lunation(k), lunation(k + 0.5), lunation(k + 1)];
  const phase = t < full ? (0.5 * (t - start)) / (full - start) : 0.5 + (0.5 * (t - full)) / (end - full);
  const age = (t - start) / DAY;
  const nextFull = t < full ? full : lunation(k + 1.5);
  return { phase, lit: litAt(phase), name: phaseName(phase), age, day: Math.floor(age) + 1, nextNew: new Date(end), nextFull: new Date(nextFull) };
}

/** The usual names, by the phase at which each one ends. */
const NAMES: [number, string, string][] = [
  [0.03, "New moon", "New"], [0.22, "Waxing crescent", "Crescent"], [0.28, "First quarter", "Quarter"], [0.47, "Waxing gibbous", "Gibbous"],
  [0.53, "Full moon", "Full"], [0.72, "Waning gibbous", "Gibbous"], [0.78, "Last quarter", "Quarter"], [0.97, "Waning crescent", "Crescent"], [1, "New moon", "New"],
];
const named = (phase: number) => NAMES.find(([end]) => (((phase % 1) + 1) % 1) < end)!;
/** "Waxing gibbous". */
export const phaseName = (phase: number) => named(phase)[1];
/** "Gibbous": the one-word form used in index labels. */
export const phaseWord = (phase: number) => named(phase)[2];
/** Day of the lunation, 1..30 (day 1 starts at new moon). */
export const dayOf = (phase: number) => Math.min(30, Math.floor((((phase % 1) + 1) % 1) * SYNODIC) + 1);
/** "D09": a day of the lunation as an index marker. */
export const dayLabel = (phase: number) => `D${String(dayOf(phase)).padStart(2, "0")}`;
/** How much of the disc is lit at a phase (0..1). */
export const litAt = (phase: number) => (1 - Math.cos(2 * Math.PI * phase)) / 2;
/**
 * A page as half a lunation. The page opens on a young crescent and each numbered section ("moment")
 * advances the phase by an equal step, so the last section is the full moon. The background moon and each
 * section's glyph use these exact values, so scrolling through a page is moving through the month.
 */
export const OPENING = 0.16;
export const momentPhase = (i: number, of: number) => OPENING + ((0.5 - OPENING) * Math.min(i, of)) / Math.max(1, of);

/** The phases a bot can be assigned (data/bots.json `lunar.phase`), at their exact values. */
export const BOT_PHASES = { new: 0, crescent: 0.14, quarter: 0.25, gibbous: 0.38, full: 0.5 } as const;
export type BotPhase = keyof typeof BOT_PHASES;
