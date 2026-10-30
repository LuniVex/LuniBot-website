"use client";
import { useRef } from "react";
import { arrive, gsap, reducedMotion, useGSAP } from "@/lib/motion";
import { OPENING, phasePath } from "@/lib/moon";
import { onDial } from "./Moon";

/**
 * The loading state: the LuniVex moon diagram (components/Moon.tsx `Crescent`) running through a whole
 * lunation while the page loads, its index tick travelling round the orbit with the phase. Each month eases
 * in and out on `arrive`. Reduced motion: the still crescent and the word.
 */
export function MoonLoader() {
  const svg = useRef<SVGSVGElement>(null);
  useGSAP(() => {
    if (reducedMotion()) return;
    const state = { p: OPENING };
    const lit = svg.current!.querySelector("[data-lit]")!, tick = svg.current!.querySelector("[data-tick]")!;
    const paint = () => {
      lit.setAttribute("d", phasePath(state.p, 6.5));
      const [x1, y1] = onDial(state.p, 9), [x2, y2] = onDial(state.p, 12);
      tick.setAttribute("d", `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`);
    };
    gsap.to(state, { p: OPENING + 1, duration: 2.4, ease: arrive, repeat: -1, onUpdate: paint });
  }, { scope: svg });
  const [x1, y1] = onDial(OPENING, 9), [x2, y2] = onDial(OPENING, 12);
  return (
    <div role="status" className="grid min-h-[60svh] place-items-center px-5">
      <div className="flex flex-col items-center gap-4 text-fg-2">
        <svg ref={svg} viewBox="-12 -12 24 24" width={40} height={40} aria-hidden="true" className="overflow-visible">
          <circle r="10.5" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.3" />
          <path data-tick="" d={`M${x1} ${y1}L${x2} ${y2}`} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          <circle r="6.5" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.45" />
          <path data-lit="" d={phasePath(OPENING, 6.5)} fill="currentColor" />
        </svg>
        <span className="t-label text-fg-3">Loading</span>
      </div>
    </div>
  );
}
