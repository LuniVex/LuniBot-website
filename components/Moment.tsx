"use client";
import { useRef } from "react";
import { phasePath } from "@/lib/moon";
import { gsap, reducedMotion, useGSAP } from "@/lib/motion";

/**
 * Where a section's moment sweeps in: from its head's top at 92% of the screen to 62%. The background
 * moon (components/Backdrop.tsx) advances its phase over exactly the same stretch, so the page's moon and
 * the section's own glyph move as one.
 */
export const SWEEP = { start: 0.92, end: 0.62 };

/**
 * The boundary into a section, as a terminator crossing: its hairline rule is drawn left to right and the
 * head's phase glyph sweeps from the previous moment's phase to this one, both scrubbed by scroll, so they
 * run backwards when you scroll back. Transform for the rule; the glyph's lit path is recomputed exactly.
 * Reduced motion: drawn finished.
 */
export function Sweep({ from, to }: { from: number; to: number }) {
  const rule = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const host = rule.current!.parentElement!;
    const lit = host.querySelector<SVGPathElement>("[data-glyph] path");
    if (reducedMotion()) return;
    const state = { t: 0 };
    const paint = () => {
      rule.current!.style.transform = `scaleX(${state.t.toFixed(4)})`;
      lit?.setAttribute("d", phasePath(from + (to - from) * state.t, 5.25));
    };
    // Linear inside a scrub: the scrub's lag supplies the easing (skills/motion.md).
    gsap.to(state, {
      t: 1, ease: "none", onUpdate: paint,
      scrollTrigger: { trigger: host, start: `top ${SWEEP.start * 100}%`, end: `top ${SWEEP.end * 100}%`, scrub: 0.6, onRefresh: paint },
    });
    paint();
  }, { dependencies: [from, to] });
  return <span ref={rule} aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left bg-line" />;
}
