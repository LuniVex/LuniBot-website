"use client";
import { useRef, useSyncExternalStore } from "react";
import { gsap, reducedMotion, spring, springs, useGSAP } from "@/lib/motion";
import { moonTonight, phasePath } from "@/lib/moon";

const LENS = 520;
const SPAN = 3200; // the orbit drawing's size in px; it fades out long before its edges
const TICKS = 30; // one per day of the lunar month

/** Size and place of the moon for this screen: behind the hero's stack on wide screens, low in the corner on phones. */
const SERVER_GEO = "240|0.76|0.44";
function screenGeo() {
  const wide = innerWidth >= 768;
  const short = Math.min(innerWidth, innerHeight);
  // On phones it peeks in from the lower right, away from the headline and text.
  return `${Math.round(wide ? Math.min(0.27 * short, 300) : 0.5 * short)}|${wide ? 0.76 : 0.92}|${wide ? 0.46 : 0.8}`;
}
const onResize = (notify: () => void) => { addEventListener("resize", notify); return () => removeEventListener("resize", notify); };
/** Scroll progress (0..1) to the moon's phase: a thin waxing crescent at the top, full at the bottom. */
const phaseAt = (progress: number) => 0.13 + 0.37 * progress;
const parseGeo = (key: string) => { const [r, x, y] = key.split("|").map(Number); return { r, x, y }; };

/**
 * The site's one background system: LuniVex's moon (skills/visual-directions.md), fixed behind every page.
 * - A large, faint moon: a hairline disc whose lit part is one flat shape in the faintest tint (bg-alt, so
 *   cards in front of it still read as cards), edged with a hairline. The phase is drawn exactly
 *   (`phasePath`): a thin crescent at the top of a page, waxing to full at the bottom.
 * - Hairline orbits around it, spaced wider with distance and fading out, and a dial of 30 ticks (one per
 *   day of the lunar month) that turns slowly with the scroll. One tick, longer and in ink, is tonight's
 *   real phase. It stays out of the accent: the accent belongs to the page's own primary action.
 * - Everything leans a few pixels toward the pointer, and a soft window of dots follows the cursor.
 *
 * Driven by the slow `drift` spring on GSAP's ticker (the same loop as Lenis and the 3D), transform only
 * (plus the lit shape's path), and idle once settled. Reduced motion: a still crescent.
 */
export function Backdrop() {
  const orbit = useRef<HTMLDivElement>(null);
  const dial = useRef<SVGGElement>(null);
  const lit = useRef<SVGPathElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const dots = useRef<HTMLDivElement>(null);
  const geo = parseGeo(useSyncExternalStore(onResize, screenGeo, () => SERVER_GEO));
  const today = useSyncExternalStore(() => () => {}, () => moonTonight().phase, () => null);

  useGSAP(() => {
    const r = geo.r;
    const state = { scroll: 0, progress: 0, leanX: 0, leanY: 0, lx: innerWidth / 2, ly: innerHeight / 3 };
    const paint = () => {
      lit.current?.setAttribute("d", phasePath(phaseAt(state.progress), r));
      orbit.current!.style.transform = `translate3d(calc(-50% + ${state.leanX.toFixed(2)}px), calc(-50% + ${(state.leanY - state.scroll * 0.06).toFixed(2)}px), 0)`;
      if (dial.current) dial.current.style.transform = `rotate(${(state.scroll * 0.012).toFixed(3)}deg)`;
      const x = state.lx - LENS / 2, y = state.ly - LENS / 2;
      lens.current!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      dots.current!.style.transform = `translate3d(${(((-x % 16) - 16) % 16) - 16}px, ${(((-y % 16) - 16) % 16) - 16}px, 0)`;
    };
    if (reducedMotion()) { paint(); return; }

    // Springs only record their values; one ticker callback paints once per frame when something moved.
    let dirty = false;
    const frame = () => { if (dirty) { dirty = false; paint(); } };
    gsap.ticker.add(frame);
    const follow = (key: keyof typeof state, eps = 0.05) => spring((v) => { state[key] = v; dirty = true; }, key, springs.drift, { from: state[key], eps });
    const s = { scroll: follow("scroll"), progress: follow("progress", 0.0005), leanX: follow("leanX"), leanY: follow("leanY"), lx: follow("lx"), ly: follow("ly") };
    const shown = spring(lens.current!, "opacity", springs.hover, { from: 0, eps: 0.002 });
    const at = () => ({ y: scrollY, p: Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) });
    const start = at();
    s.scroll.set(start.y); s.progress.set(start.p);
    paint();

    const onScroll = () => { const a = at(); s.scroll.to(a.y); s.progress.to(a.p); };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      s.leanX.to((e.clientX / innerWidth - 0.5) * 14);
      s.leanY.to((e.clientY / innerHeight - 0.5) * 14);
      s.lx.to(e.clientX);
      s.ly.to(e.clientY);
      shown.to(1);
    };
    const onLeave = () => { shown.to(0); s.leanX.to(0); s.leanY.to(0); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      gsap.ticker.remove(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, { dependencies: [geo.r] });

  const { r } = geo;
  // Orbits widen with distance, like a technical drawing's scale rings, instead of an even ripple.
  const rings = [1.4, 1.85, 2.45, 3.25, 4.3, 5.7].map((k) => Math.round(r * k));
  const tick = (i: number, len: number) => {
    const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
    const r1 = r + 26, r2 = r + 26 + len;
    return { x1: Math.cos(a) * r1, y1: Math.sin(a) * r1, x2: Math.cos(a) * r2, y2: Math.sin(a) * r2 };
  };
  const hair = { fill: "none", stroke: "var(--texture)", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div ref={orbit} className="orbits absolute will-change-transform" style={{ left: `${geo.x * 100}%`, top: `${geo.y * 100}%`, width: SPAN, height: SPAN, transform: "translate3d(-50%, -50%, 0)" }}>
        <svg viewBox={`${-SPAN / 2} ${-SPAN / 2} ${SPAN} ${SPAN}`} width={SPAN} height={SPAN}>
          {rings.map((rr) => <circle key={rr} r={rr} {...hair} />)}
          <g ref={dial} style={{ transformOrigin: "0 0" }}>
            {Array.from({ length: TICKS }, (_, i) => <line key={i} {...tick(i, i % 5 === 0 ? 14 : 7)} {...hair} />)}
            {today !== null && <line {...tick(today * TICKS, 20)} stroke="var(--fg-3)" strokeWidth={1} vectorEffect="non-scaling-stroke" />}
          </g>
          {/* The dark limb is the quietest line; the lit shape carries a hairline along its limb and terminator. */}
          <circle r={r} fill="var(--bg)" stroke="var(--texture)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <path ref={lit} d={phasePath(phaseAt(0), r)} fill="var(--bg-alt)" stroke="var(--line)" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
      </div>
      <div ref={lens} className="lens absolute left-0 top-0 opacity-0 will-change-transform" style={{ width: LENS, height: LENS }}>
        <div ref={dots} className="dots-field absolute will-change-transform" style={{ width: LENS + 32, height: LENS + 32 }} />
      </div>
    </div>
  );
}
