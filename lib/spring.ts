import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

/**
 * Spring physics for everything the user touches (skills/motion.md). A spring is defined the way
 * Apple's are: `response` (seconds, roughly how long one swing takes) and `damping` (1 = settles with no
 * overshoot, below 1 = a touch of give). Unlike a tween, a spring keeps its velocity when its target
 * changes, so reversing mid-move (the cursor leaving halfway through a hover) eases back with the momentum
 * it had instead of restarting from a standstill.
 *
 * Every spring runs on GSAP's ticker, the same loop that drives Lenis, ScrollTrigger and the 3D, and only
 * while it is moving: a settled spring costs nothing.
 */
export interface SpringConfig { response: number; damping: number }

/** The site's springs. One set, used everywhere. */
export const springs = {
  /** Pressing down: instant, firm, no wobble. */
  press: { response: 0.16, damping: 0.9 },
  /** Letting go: springs back with a little give (about 4% overshoot). */
  release: { response: 0.34, damping: 0.6 },
  /** Hovers: eases in with weight and settles without bounce. */
  hover: { response: 0.5, damping: 0.9 },
  /** Things that travel: sliding highlights, nudges, toggles. */
  glide: { response: 0.48, damping: 0.82 },
  /** Background drift after the pointer and the scroll: slow and heavy. */
  drift: { response: 1.4, damping: 1 },
} satisfies Record<string, SpringConfig>;

const reduce = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Body {
  x: number; v: number; target: number; k: number; c: number; eps: number;
  write: (x: number) => void;
}

const moving = new Set<Body>();
let ticking = false;

function step(_time: number, deltaMs: number) {
  // Fixed small substeps keep the integration stable on slow frames; a long stall is capped.
  let dt = Math.min(deltaMs / 1000, 1 / 20);
  const h = 1 / 240;
  while (dt > 0) {
    const s = Math.min(h, dt);
    for (const b of moving) {
      const a = -b.k * (b.x - b.target) - b.c * b.v;
      b.v += a * s;
      b.x += b.v * s;
    }
    dt -= s;
  }
  for (const b of moving) {
    if (Math.abs(b.x - b.target) < b.eps && Math.abs(b.v) < b.eps * 10) { b.x = b.target; b.v = 0; moving.delete(b); }
    b.write(b.x);
  }
  if (!moving.size) { gsap.ticker.remove(step); ticking = false; }
}

const constants = ({ response, damping }: SpringConfig) => ({ k: (2 * Math.PI / response) ** 2, c: (4 * Math.PI * damping) / response });

export interface Spring {
  /** Springs toward `value`, keeping the current velocity. */
  to(value: number, config?: SpringConfig): void;
  /** Jumps to `value` with no motion. */
  set(value: number): void;
  readonly value: number;
}

/**
 * A spring on one property. `target` is an element (the property is set through GSAP, so it shares the
 * transform cache with every other GSAP animation) or a function that receives each value.
 */
export function spring(target: Element | ((v: number) => void), prop: string, config: SpringConfig, opts: { from?: number; unit?: string; eps?: number } = {}): Spring {
  // quickSetter ignores the "scale" shorthand, so scale writes scaleX and scaleY together.
  const set = (p: string) => gsap.quickSetter(target as Element, p, opts.unit) as (v: number) => void;
  const pair = prop === "scale" && typeof target !== "function" ? [set("scaleX"), set("scaleY")] : null;
  const write = typeof target === "function" ? target : pair ? (v: number) => { pair[0](v); pair[1](v); } : set(prop);
  const start = opts.from ?? (typeof target === "function" ? 0 : Number(gsap.getProperty(target, prop)) || 0);
  const body: Body = { x: start, v: 0, target: start, ...constants(config), eps: opts.eps ?? 0.01, write };
  return {
    to(value, next) {
      if (next) Object.assign(body, constants(next));
      body.target = value;
      if (reduce()) { body.x = value; body.v = 0; moving.delete(body); write(value); return; }
      moving.add(body);
      if (!ticking) { gsap.ticker.add(step); ticking = true; }
    },
    set(value) { body.x = body.target = value; body.v = 0; moving.delete(body); write(value); },
    get value() { return body.x; },
  };
}

/**
 * A spring's step response sampled into a GSAP ease, for the few moves that must be tweens (GSAP Flip,
 * counters). Returns the ease and the time the spring takes to settle, to use as the tween's duration.
 */
export function springEase(name: string, config: SpringConfig) {
  const { k, c } = constants(config);
  let x = 0, v = 0, t = 0;
  const h = 1 / 600;
  const pts: [number, number][] = [[0, 0]];
  while (t < 4) {
    const a = -k * (x - 1) - c * v;
    v += a * h; x += v * h; t += h;
    if (Math.round(t / h) % 6 === 0) pts.push([t, x]);
    if (t > 0.1 && Math.abs(x - 1) < 0.0015 && Math.abs(v) < 0.01) break;
  }
  const duration = t;
  const path = `M0,0 ${pts.map(([pt, px]) => `L${(pt / duration).toFixed(4)},${px.toFixed(4)}`).join(" ")} L1,1`;
  return { ease: CustomEase.create(name, path), duration };
}
