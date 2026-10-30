"use client";
import { useEffect, useRef } from "react";
import { gsap, reducedMotion, ScrollTrigger } from "@/lib/motion";
import type { Box, Journey } from "./three/journey";
import { lowPower, readPalette } from "./three/shared";

const rectOf = (el: Element | null): Box | null => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 0 ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
};

/**
 * Runs the hub's 3D journey (components/three/journey.ts) on a fixed full-viewport canvas above the page.
 * - The hero anchor (`[data-stack-anchor]`) holds the static drawing; once the 3D is live the drawing hides
 *   and the stack is drawn in its place.
 * - Each slab has a ScrollTrigger from "the hero begins to leave" to "the Bots section reaches the top",
 *   so the trip is scrubbed by scroll and reverses when you scroll back.
 * - The scroll values are followed with a short time-based lag on GSAP's ticker (the same loop as Lenis),
 *   so the slabs feel attached to the scroll rather than bolted to it.
 * - A frame is drawn only when something changed (scroll, size, theme, an easing value); otherwise nothing
 *   runs. Reduced motion, low-power hints, no WebGL or software GL: the drawing and the marks simply stay.
 */
export function StackJourney({ slugs, marks }: { slugs: string[]; marks: string[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const anchor = document.querySelector<HTMLElement>("[data-stack-anchor]");
    if (!cv || !hero || !anchor || reducedMotion() || lowPower()) return;
    let alive = true;
    let journey: Journey | null = null;
    const triggers: ScrollTrigger[] = [];
    let colors: MutationObserver | null = null;
    const goal = { hero: 0, trips: slugs.map(() => 0) };
    const now = { hero: 0, trips: slugs.map(() => 0) };
    let dirty = true;
    const targets = () => slugs.map((s) => document.querySelector(`[data-journey="${s}"]`));
    const shown = slugs.map(() => -1);
    const cleanup: (() => void)[] = [];

    const tick = (_t: number, deltaMs: number) => {
      if (!journey) return;
      // Follow the scroll values with a short lag (time-based, ~12% per frame at 60fps).
      const f = 1 - Math.exp(-Math.min(deltaMs / 1000, 0.05) * 7.7);
      let moving = false;
      const ease = (a: number, b: number) => { const d = b - a; if (Math.abs(d) < 0.0005) return b; moving = true; return a + d * f; };
      now.hero = ease(now.hero, goal.hero);
      now.trips = now.trips.map((v, i) => ease(v, goal.trips[i]));
      if (!moving && !dirty) return;
      dirty = false;
      const anchorBox = rectOf(anchor) ?? { x: 0, y: -9999, w: 1, h: 1 };
      const els = targets();
      journey.draw({ anchor: anchorBox, hero: now.hero, pieces: now.trips.map((travel, i) => ({ travel, target: rectOf(els[i]) })) });
      // Hand each card's mark over as its slab lands.
      els.forEach((el, i) => {
        const o = Math.round(journey!.handover(i) * 100) / 100;
        if (el && o !== shown[i]) { (el as HTMLElement).style.opacity = String(o); shown[i] = o; }
      });
    };
    const mark = () => { dirty = true; };

    (async () => {
      const { createJourney } = await import("./three/journey");
      if (!alive) return;
      journey = createJourney(cv, readPalette(), marks);
      if (!journey) return; // no WebGL: the drawing and the marks stay as they are
      const fit = () => { journey?.resize(innerWidth, innerHeight); dirty = true; };
      fit();
      addEventListener("resize", fit);
      addEventListener("scroll", mark, { passive: true });
      const heroLeaves = () => hero.getBoundingClientRect().bottom + scrollY - innerHeight * 0.75;
      triggers.push(ScrollTrigger.create({
        trigger: hero, start: "top top", end: "bottom top",
        onUpdate: (s) => { goal.hero = s.progress; }, onRefresh: (s) => { goal.hero = s.progress; },
      }));
      // Every slab finishes its trip by the time the Bots section reaches the top of the screen (where
      // "Browse bots" stops), so no slab is ever left hanging over the cards once you've arrived. On a
      // narrow screen the lower cards are below the fold then; their slabs land there, out of sight.
      const bots = document.getElementById("bots");
      const arrived = () => Math.max(heroLeaves() + 160, (bots?.getBoundingClientRect().top ?? 0) + scrollY - 60);
      targets().forEach((el, i) => {
        if (!el) return;
        triggers.push(ScrollTrigger.create({
          start: heroLeaves,
          end: arrived,
          onUpdate: (s) => { goal.trips[i] = s.progress; }, onRefresh: (s) => { goal.trips[i] = s.progress; dirty = true; },
        }));
      });
      // Start exactly where the page is, with no catch-up animation on load.
      now.hero = goal.hero; now.trips = [...goal.trips];
      colors = new MutationObserver(() => { journey?.recolor(readPalette()); dirty = true; });
      colors.observe(root, { attributes: true, attributeFilter: ["class"] });
      root.dataset.journeyLive = "";
      gsap.ticker.add(tick);
      cleanup.push(() => { removeEventListener("resize", fit); removeEventListener("scroll", mark); });
    })();

    return () => {
      alive = false;
      gsap.ticker.remove(tick);
      triggers.forEach((t) => t.kill());
      colors?.disconnect();
      cleanup.forEach((f) => f());
      delete root.dataset.journeyLive;
      targets().forEach((el) => (el as HTMLElement | null)?.style.removeProperty("opacity"));
      journey?.dispose();
    };
  }, [slugs, marks]);

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 size-full" />;
}
