"use client";
import { useRef, useSyncExternalStore } from "react";
import { gsap, reducedMotion, spring, springs, useGSAP } from "@/lib/motion";
import { moonTonight } from "@/lib/moon";

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
const parseGeo = (key: string) => { const [r, x, y] = key.split("|").map(Number); return { r, x, y }; };

/**
 * The site's one background system: LuniVex's moon (skills/visual-directions.md), fixed behind every page.
 * - A large, faint moon: a hairline disc whose lit part is a flat surface tint. It waxes as you scroll,
 *   from a thin crescent at the top of a page to full at the bottom.
 * - Concentric hairline orbits around it, fading with distance, and a dial of 30 ticks (one per day of the
 *   lunar month) that turns slowly with the scroll. One tick is in the accent: tonight's real moon phase.
 * - Everything leans a few pixels toward the pointer, and a soft window of dots follows the cursor.
 *
 * Driven by the slow `drift` spring on GSAP's ticker (the same loop as Lenis and the 3D), transform only
 * (the waxing is a shadow disc sliding aside), and idle once settled. Reduced motion: a still crescent.
 */
export function Backdrop() {
  const orbit = useRef<HTMLDivElement>(null);
  const dial = useRef<SVGGElement>(null);
  const shadow = useRef<SVGCircleElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const dots = useRef<HTMLDivElement>(null);
  const geo = parseGeo(useSyncExternalStore(onResize, screenGeo, () => SERVER_GEO));
  const today = useSyncExternalStore(() => () => {}, () => moonTonight().phase, () => null);

  useGSAP(() => {
    const r = geo.r;
    const state = { scroll: 0, progress: 0, leanX: 0, leanY: 0, lx: innerWidth / 2, ly: innerHeight / 3 };
    const paint = () => {
      // Waxing: the shadow disc slides left; a gap of d between the discs leaves a crescent d wide.
      const phase = 0.12 + 0.38 * state.progress;
      shadow.current?.setAttribute("transform", `translate(${(-4 * r * phase).toFixed(2)} 0)`);
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
  const rings = Array.from({ length: 22 }, (_, i) => r + 72 + i * 72);
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
          <defs>
            <mask id="lb-moon-lit">
              <circle r={r} fill="#fff" />
              <circle ref={shadow} r={r + 1} fill="#000" transform={`translate(${-4 * r * 0.12} 0)`} />
            </mask>
          </defs>
          {rings.map((rr) => <circle key={rr} r={rr} {...hair} />)}
          <g ref={dial} style={{ transformOrigin: "0 0" }}>
            {Array.from({ length: TICKS }, (_, i) => <line key={i} {...tick(i, i % 5 === 0 ? 14 : 7)} {...hair} />)}
            {today !== null && <line {...tick(today * TICKS, 18)} stroke="var(--blue)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinecap="round" />}
          </g>
          <circle r={r} fill="var(--tile)" mask="url(#lb-moon-lit)" />
          <circle r={r} fill="none" stroke="var(--line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div ref={lens} className="lens absolute left-0 top-0 opacity-0 will-change-transform" style={{ width: LENS, height: LENS }}>
        <div ref={dots} className="dots-field absolute will-change-transform" style={{ width: LENS + 32, height: LENS + 32 }} />
      </div>
    </div>
  );
}
