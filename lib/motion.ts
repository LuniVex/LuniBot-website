import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { springEase, springs } from "./spring";

/**
 * The site's motion language (skills/motion.md). Two eases and one set of springs; nothing else.
 * - `arrive`: things appearing (reveals, page entrances, fades, plates, mark strokes).
 * - `settle`: a spring's motion as an ease, for the few moves that must be tweens (Flip, counters, bars).
 * - Springs (lib/spring.ts): everything the user touches.
 * Everything runs on GSAP's ticker: Lenis, ScrollTrigger, springs, the background and the 3D share one loop.
 */
const client = typeof window !== "undefined";
if (client) gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, CustomEase, DrawSVGPlugin);

/** `arrive` as cubic-bezier numbers (also the CSS `--ease`). */
export const ease = [0.28, 0.11, 0.32, 1] as const;
export const easeCss = `cubic-bezier(${ease.join(", ")})`;

export const arrive = client ? CustomEase.create("lb-arrive", `M0,0 C${ease[0]},${ease[1]} ${ease[2]},${ease[3]} 1,1`) : "power3.out";
const settled = client ? springEase("lb-settle", { response: 0.55, damping: 0.82 }) : { ease: "power3.out", duration: 0.9 };
export const settle = settled.ease;
/** How long a `settle` tween takes: the time the underlying spring needs to come to rest. */
export const settleDuration = settled.duration;
/** Kept for older call sites: the same as `arrive`. */
export const soft = arrive;

// No tween may fall back to GSAP's own default ease.
if (client) gsap.defaults({ ease: arrive, duration: 0.7 });

/** Reveals: how far things rise and how long they take. */
export const rise = { y: 22, duration: 1.1 };
/** Reveals start this far before the element's top reaches the bottom of the screen. */
export const revealStart = "top bottom-=80";

/** A small, repeatable irregularity per index (no Math.random, so server and client agree). */
const wobble = (i: number) => (((i * 2654435761) >>> 0) % 1000) / 1000 - 0.5;

/**
 * An organic stagger: each gap is a little shorter than the one before (the group gathers pace, like a
 * cascade) and slightly irregular, so groups never tick in uniform steps. `each` is the first gap.
 */
export const cascade = (each = 0.08) => (i: number) => {
  let t = 0;
  for (let j = 0; j < i; j++) t += each * (0.55 + 0.45 * 0.82 ** j) * (1 + 0.28 * wobble(j));
  return t;
};

/** A rise distance that varies a little per element, so a cascade doesn't read as copies. */
export const riseFor = (base = rise.y) => (i: number) => base * (1 + 0.3 * wobble(i + 7));

export const reducedMotion = () => client && matchMedia("(prefers-reduced-motion: reduce)").matches;

export { Flip, gsap, ScrollTrigger, springs, useGSAP };
export { spring } from "./spring";
