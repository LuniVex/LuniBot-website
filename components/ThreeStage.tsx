"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, reducedMotion, ScrollTrigger } from "@/lib/motion";
import type { Kind, Stage } from "./three/objects";
import { lowPower, readPalette } from "./three/shared";

/**
 * A scroll-driven 3D object (skills/3d-and-scroll.md). The static SVG twin (`fallback`) is in the server
 * HTML, so the block always shows something. The 3D layer loads only when the block is within a viewport
 * of the screen, fades in over the drawing, takes its pose from scroll progress through `track` (a
 * selector; the block itself by default), and draws only while on screen, with the tab visible, and
 * while the pose is still easing. Reduced motion, low-power hints, no WebGL or a lost context: the
 * drawing stays.
 */
export function ThreeStage({ kind, slug, svg, track, start = "top bottom", end = "bottom top", fallback, className = "" }: {
  kind: Kind; slug?: string; svg?: string | null; track?: string; start?: string; end?: string; fallback: React.ReactNode; className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = box.current, cv = canvas.current;
    if (!el || !cv || reducedMotion() || lowPower()) return;
    let alive = true, onScreen = false;
    let stage: Stage | null = null;
    let trigger: ScrollTrigger | null = null;
    let colors: MutationObserver | null = null;
    let sizer: ResizeObserver | null = null;

    const tick = (_t: number, deltaMs: number) => { stage?.frame(deltaMs / 1000); };
    const run = () => {
      gsap.ticker.remove(tick);
      if (stage && onScreen && !document.hidden) gsap.ticker.add(tick);
    };
    const stop = () => {
      gsap.ticker.remove(tick);
      trigger?.kill(); colors?.disconnect(); sizer?.disconnect();
      stage?.dispose(); stage = null;
    };
    const lost = (e: Event) => { e.preventDefault(); stop(); setLive(false); };

    const start3d = async () => {
      const { createStage } = await import("./three/objects");
      if (!alive) return;
      stage = createStage(cv, kind, readPalette(), { slug, svg: svg ?? undefined });
      if (!stage) return; // no WebGL: the drawing stays
      cv.addEventListener("webglcontextlost", lost);
      const fit = () => { const r = el.getBoundingClientRect(); stage?.resize(Math.max(1, Math.round(r.width)), Math.max(1, Math.round(r.height))); };
      fit();
      sizer = new ResizeObserver(fit);
      sizer.observe(el);
      trigger = ScrollTrigger.create({
        trigger: (track && document.querySelector(track)) || el, start, end,
        onUpdate: (s) => stage?.aim(s.progress), onRefresh: (s) => stage?.aim(s.progress),
      });
      stage.aim(trigger.progress);
      colors = new MutationObserver(() => stage?.recolor(readPalette()));
      colors.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      stage.frame(1);
      setLive(true);
      run();
    };

    // Load when within one viewport of the screen; draw only while actually on screen.
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { near.disconnect(); void start3d(); } }, { rootMargin: "100% 0px" });
    const seen = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; run(); });
    near.observe(el);
    seen.observe(el);
    document.addEventListener("visibilitychange", run);

    return () => {
      alive = false;
      near.disconnect(); seen.disconnect();
      document.removeEventListener("visibilitychange", run);
      cv.removeEventListener("webglcontextlost", lost);
      stop();
    };
  }, [kind, slug, svg, track, start, end]);

  return (
    <div ref={box} aria-hidden="true" data-stage={kind} data-live={live ? "" : undefined} className={`relative ${className}`}>
      <div className={`absolute inset-0 transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`}>{fallback}</div>
      <canvas ref={canvas} className={`absolute inset-0 size-full transition-opacity duration-700 ${live ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}
