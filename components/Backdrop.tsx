"use client";
import { useRef, useSyncExternalStore } from "react";
import { gsap, reducedMotion, spring, springs, useGSAP } from "@/lib/motion";
import { moonTonight, OPENING, phasePath } from "@/lib/moon";
import { SWEEP } from "./Moment";
import { r3 } from "./Moon";
import { Starfield } from "./Starfield";

/** Size of the window around the cursor in which the drawing comes into focus. */
const FOCUS = 360;
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
/** Each orbit's depth: outer orbits sit nearer the viewer, so they lean and drift a little further (parallax). */
const DEPTH = [0.2, 0.45, 0.75, 1.1, 1.5, 2];
const HATCH = 10; // the hatch tile (app/globals.css .hatch), so the focus window's hatch can stay put on the page

/**
 * The moon's phase for the current scroll: the page is half a lunation (lib/moon.ts `momentPhase`). It holds
 * each section's phase while you read it and sweeps to the next one as that section's head comes up, over
 * the same stretch as the head's own glyph (components/Moment.tsx), so they move together and reverse together.
 * Pages without numbered sections simply wax with scroll progress.
 */
function phaseNow() {
  const moments = [...document.querySelectorAll<HTMLElement>("[data-moment]")]
    .map((el) => ({ top: el.getBoundingClientRect().top, phase: Number(el.dataset.moment) }))
    .sort((a, b) => a.top - b.top);
  if (!moments.length) {
    const progress = Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight));
    return OPENING + (0.5 - OPENING) * progress;
  }
  const span = (SWEEP.start - SWEEP.end) * innerHeight;
  return moments.slice(1).reduce((p, m, i) => {
    const t = Math.min(1, Math.max(0, (SWEEP.start * innerHeight - m.top) / span));
    return p + (m.phase - moments[i].phase) * t;
  }, moments[0].phase);
}
const parseGeo = (key: string) => { const [r, x, y] = key.split("|").map(Number); return { r, x, y }; };

/**
 * The site's one background system: LuniVex's moon in a night sky (skills/visual-directions.md), fixed
 * behind every page. The stars (components/Starfield.tsx) sit furthest back; the moon covers those behind it.
 * - A large, faint moon: a hairline disc whose lit part is one flat shape in the faintest tint (bg-alt, so
 *   cards in front of it still read as cards), edged with a hairline. The phase is drawn exactly
 *   (`phasePath`), with the unlit side engraved with hatching. It is the page's spine: it waxes from the
 *   opening crescent to full, one moment (numbered section) at a time (`phaseNow`).
 * - Hairline orbits around it, spaced wider with distance and fading out, each at its own depth (parallax), and a dial of 30 ticks (one per
 *   day of the lunar month) that turns slowly with the scroll. One tick, longer and in ink, is tonight's
 *   real phase. It stays out of the accent: the accent belongs to the page's own primary action.
 * - Everything leans a few pixels toward the pointer, and under the cursor the drawing comes into focus:
 *   inside a soft round window the same orbits, dial and moon are traced again in a stronger tint over a
 *   fine hatch, like a lamp passing over an engraving. Nothing is added to the page; the cursor only reveals what is there.
 *
 * Driven by the slow `drift` spring on GSAP's ticker (the same loop as Lenis and the 3D), transform only
 * (plus the lit shape's path and the orbits' centres), and idle once settled. Reduced motion: nothing moves;
 * the moon is simply set to the phase of the section you're in.
 */
export function Backdrop() {
  const orbit = useRef<HTMLDivElement>(null);
  const dials = useRef<(SVGGElement | null)[]>([]);
  const lits = useRef<(SVGPathElement | null)[]>([]);
  const orbits = useRef<(SVGCircleElement | null)[]>([]);
  const hatch = useRef<HTMLDivElement>(null);
  const focus = useRef<HTMLDivElement>(null);
  const focusSvg = useRef<SVGSVGElement>(null);
  const geo = parseGeo(useSyncExternalStore(onResize, screenGeo, () => SERVER_GEO));
  const today = useSyncExternalStore(() => () => {}, () => moonTonight().phase, () => null);

  useGSAP(() => {
    const r = geo.r;
    const state = { scroll: 0, phase: OPENING, leanX: 0, leanY: 0, fx: innerWidth / 2, fy: innerHeight / 3 };
    const paint = () => {
      const d = phasePath(state.phase, r);
      lits.current.forEach((el) => el?.setAttribute("d", d));
      const dy = state.leanY - state.scroll * 0.06;
      orbit.current!.style.transform = `translate3d(calc(-50% + ${state.leanX.toFixed(2)}px), calc(-50% + ${dy.toFixed(2)}px), 0)`;
      const turn = `rotate(${(state.scroll * 0.012).toFixed(3)}deg)`;
      dials.current.forEach((el) => { if (el) el.style.transform = turn; });
      // Orbits at their depths: offsets relative to the moon, from the pointer and a slow drift with scroll.
      orbits.current.forEach((el, i) => {
        if (!el) return;
        const k = DEPTH[i % DEPTH.length] - 0.2;
        el.setAttribute("cx", (state.leanX * k * 0.9).toFixed(2));
        el.setAttribute("cy", (state.leanY * k * 0.9 - state.scroll * 0.006 * k).toFixed(2));
      });
      // The focus window moves with the cursor; its small drawing shows the part of the orbit drawing under
      // it (a viewBox in the drawing's own coordinates), so the two always line up exactly.
      const x = state.fx - FOCUS / 2, y = state.fy - FOCUS / 2;
      focus.current!.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      const cx = geo.x * innerWidth + state.leanX, cy = geo.y * innerHeight + dy;
      focusSvg.current!.setAttribute("viewBox", `${(x - cx).toFixed(2)} ${(y - cy).toFixed(2)} ${FOCUS} ${FOCUS}`);
      // The hatch under the focus stays fixed on the screen: shifted back by the window's offset in its tile.
      const hx = ((x % HATCH) + HATCH) % HATCH, hy = ((y % HATCH) + HATCH) % HATCH;
      hatch.current!.style.transform = `translate3d(${(-hx).toFixed(2)}px, ${(-hy).toFixed(2)}px, 0)`;
    };
    if (reducedMotion()) {
      // Nothing moves; only the moon's phase is set to the section you're in (no motion between them).
      paint();
      const still = () => { const d = phasePath(phaseNow(), r); lits.current.forEach((el) => el?.setAttribute("d", d)); };
      still();
      addEventListener("scroll", still, { passive: true });
      return () => removeEventListener("scroll", still);
    }

    // Springs only record their values; one ticker callback paints once per frame when something moved.
    let dirty = false;
    const frame = () => { if (dirty) { dirty = false; paint(); } };
    gsap.ticker.add(frame);
    const follow = (key: keyof typeof state, eps = 0.05, config = springs.drift) => spring((v) => { state[key] = v; dirty = true; }, key, config, { from: state[key], eps });
    const s = {
      scroll: follow("scroll"), phase: follow("phase", 0.0005), leanX: follow("leanX"), leanY: follow("leanY"),
      // The focus keeps close to the pointer, with a little weight: it trails, then settles on it.
      fx: follow("fx", 0.05, springs.hover), fy: follow("fy", 0.05, springs.hover),
    };
    const shown = spring(focus.current!, "opacity", springs.hover, { from: 0, eps: 0.002 });
    s.scroll.set(scrollY); s.phase.set(phaseNow());
    paint();

    const onScroll = () => { s.scroll.to(scrollY); s.phase.to(phaseNow()); };
    // A new page (client navigation) or a resize moves the moments: start from the new page's phase.
    const onLayout = () => { s.phase.to(phaseNow()); };
    const layout = new ResizeObserver(onLayout);
    layout.observe(document.body);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      s.leanX.to((e.clientX / innerWidth - 0.5) * 14);
      s.leanY.to((e.clientY / innerHeight - 0.5) * 14);
      s.fx.to(e.clientX);
      s.fy.to(e.clientY);
      shown.to(1);
    };
    const onLeave = () => { shown.to(0); s.leanX.to(0); s.leanY.to(0); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      layout.disconnect();
      gsap.ticker.remove(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, { dependencies: [geo.r] });

  const { r } = geo;
  // Orbits widen with distance, like a technical drawing's scale rings, instead of an even ripple.
  const rings = [1.4, 1.85, 2.45, 3.25, 4.3, 5.7].map((k) => Math.round(r * k));
  const dialR = r + 26;
  const tick = (i: number, len: number) => {
    const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
    return { x1: r3(Math.cos(a) * dialR), y1: r3(Math.sin(a) * dialR), x2: r3(Math.cos(a) * (dialR + len)), y2: r3(Math.sin(a) * (dialR + len)) };
  };
  const line = (stroke: string) => ({ fill: "none", stroke, strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const });

  /**
   * The orbit drawing, centred on (0, 0). Drawn twice: quietly across the page, and again in a stronger
   * tint, lines only, inside the focus window. The dial's ticks stand on their own hairline circle, so they
   * read as one instrument rather than loose marks.
   */
  const drawing = (i: number, quiet: boolean) => {
    const hair = line(quiet ? "var(--texture)" : "var(--fg-3)");
    return (
      <>
        {rings.map((rr, j) => <circle key={rr} ref={(el) => { orbits.current[i * rings.length + j] = el; }} r={rr} {...hair} />)}
        <g ref={(el) => { dials.current[i] = el; }} style={{ transformOrigin: "0 0" }}>
          <circle r={dialR} {...hair} />
          {Array.from({ length: TICKS }, (_, t) => <line key={t} {...tick(t, t % 5 === 0 ? 12 : 6)} {...hair} />)}
          {today !== null && <line {...tick(today * TICKS, 20)} {...line("var(--fg-3)")} />}
        </g>
        {/* The moon: a hairline disc and its lit part as one flat shape, edged along its limb and terminator. */}
        <circle r={r} {...hair} fill={quiet ? "var(--moon-dark)" : "none"} />
        {/* The unlit side engraved with hatching (light theme; in the dark theme the hatch all but vanishes). */}
        {quiet && <circle r={r} fill="url(#lb-moon-hatch)" />}
        <path ref={(el) => { lits.current[i] = el; }} d={phasePath(OPENING, r)} {...line(quiet ? "var(--line)" : "var(--fg-3)")} fill={quiet ? "var(--moon-lit)" : "none"} strokeLinejoin="round" />
      </>
    );
  };

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Starfield />
      <div ref={orbit} className="orbits absolute will-change-transform" style={{ left: `${geo.x * 100}%`, top: `${geo.y * 100}%`, width: SPAN, height: SPAN, transform: "translate3d(-50%, -50%, 0)" }}>
        <svg viewBox={`${-SPAN / 2} ${-SPAN / 2} ${SPAN} ${SPAN}`} width={SPAN} height={SPAN}>
          <defs>
            <pattern id="lb-moon-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--hatch)" strokeWidth="1" />
            </pattern>
          </defs>
          {drawing(0, true)}
        </svg>
      </div>
      <div ref={focus} className="focus absolute left-0 top-0 opacity-0 will-change-transform" style={{ width: FOCUS, height: FOCUS }}>
        {/* Under the cursor the engraving shows through: hatch, then the orbit linework in a stronger tint. */}
        <div ref={hatch} className="hatch absolute left-0 top-0 will-change-transform" style={{ width: FOCUS + HATCH, height: FOCUS + HATCH }} />
        <svg ref={focusSvg} viewBox={`0 0 ${FOCUS} ${FOCUS}`} width={FOCUS} height={FOCUS} className="relative">{drawing(1, false)}</svg>
      </div>
    </div>
  );
}
