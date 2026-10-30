"use client";
import { useEffect, useRef } from "react";
import { gsap, reducedMotion } from "@/lib/motion";
import { lowPower } from "./three/shared";

/** A small seeded random generator, so the sky is the same on every visit and every render. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Star { x: number; y: number; r: number; a: number; layer: number; speed: number; phase: number; bright: boolean }

/** Three depths: far stars barely move with scroll, near ones a little more (parallax). */
/** The page's text column (max-w-page with 20px side padding): the sky is quieter behind it, so text stays clear. */
const MEASURE = 980;
const LAYERS = [{ drift: 0.03, lean: 4 }, { drift: 0.07, lean: 9 }, { drift: 0.13, lean: 16 }];
// The sky repeats vertically every `tile` px (at least a screen and a bit), so scrolling never runs out of stars.

/**
 * The night sky behind the moon (skills/visual-directions.md): flat dots in the ink colour at three depths,
 * a few brighter stars with fine hairline rays, and faint star-chart lines joining nearby bright stars. It
 * drifts with scroll (each depth at its own rate), leans a little toward the pointer, and twinkles gently
 * (opacity only). In the light theme the same sky reads as a printed star chart: ink dots on paper.
 *
 * One canvas, drawn on GSAP's ticker (the same loop as Lenis, the springs and the 3D). Reduced motion: drawn
 * once, still. Hidden from assistive technology.
 */
export function Starfield() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const still = reducedMotion() || lowPower();
    let tile = 1400, w = 0, h = 0, dpr = 1, stars: Star[] = [], links: [Star, Star][] = [];
    let ink = "#f5f5f7", dark = true;
    const lean = { x: 0, y: 0, tx: 0, ty: 0 };
    let scroll = scrollY;

    const colors = () => {
      ink = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#f5f5f7";
      dark = document.documentElement.classList.contains("dark");
    };

    const build = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = innerWidth; h = innerHeight; tile = Math.max(1400, h + 240);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      const rand = mulberry32(7);
      // Density by area: about one star per 2,600 px² of a tile, fewer on small screens.
      const count = Math.round((Math.max(w, 900) * tile) / 2600);
      stars = Array.from({ length: count }, () => {
        const layer = rand() < 0.55 ? 0 : rand() < 0.7 ? 1 : 2;
        const bright = rand() < 0.035;
        return {
          x: rand() * Math.max(w, 900), y: rand() * tile, layer, bright,
          r: bright ? 1.15 + rand() * 0.5 : 0.35 + rand() * (0.45 + layer * 0.25),
          a: bright ? 1 : 0.32 + rand() * 0.6,
          speed: 0.4 + rand() * 1.4, phase: rand() * Math.PI * 2,
        };
      });
      // Star-chart lines: each bright star joins its nearest bright neighbour on the same depth.
      const brights = stars.filter((s) => s.bright);
      links = [];
      for (const s of brights) {
        let best: Star | null = null, bd = 200;
        for (const o of brights) {
          if (o === s || o.layer !== s.layer) continue;
          const d = Math.hypot(o.x - s.x, o.y - s.y);
          if (d < bd) { bd = d; best = o; }
        }
        if (best && !links.some(([a, b]) => (a === best && b === s))) links.push([s, best]);
      }
    };

    const place = (s: Star) => {
      const L = LAYERS[s.layer];
      const x = s.x + lean.x * L.lean;
      let y = (s.y - scroll * L.drift + lean.y * L.lean) % tile;
      if (y < -20) y += tile;
      return [x, y] as const;
    };

    // Behind the text column: dimmer stars, and no rays or chart lines crossing words.
    const inColumn = (x: number) => { const m = Math.min(w - 40, MEASURE); const left = (w - m) / 2; return x > left - 12 && x < left + m + 12; };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // Dark: a night sky. Light: the same sky printed as a star chart, a little quieter.
      const strength = dark ? 1 : 0.55;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1;

      ctx.globalAlpha = (dark ? 0.1 : 0.12);
      ctx.beginPath();
      for (const [a, b] of links) {
        const [ax, ay] = place(a), [bx, by] = place(b);
        if (Math.abs(ay - by) > 300) continue; // the pair straddles the tile seam
        if (inColumn(ax) || inColumn(bx)) continue;
        ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      }
      ctx.stroke();

      for (const s of stars) {
        const [x, y] = place(s);
        if (y > h + 20 || x < -20 || x > w + 20) continue;
        const twinkle = still ? 1 : 0.72 + 0.28 * Math.sin(t * s.speed + s.phase);
        const quiet = inColumn(x);
        ctx.globalAlpha = s.a * twinkle * strength * (quiet ? 0.45 : 1);
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
        if (s.bright && !quiet) {
          // Four fine rays, as on an engraved star chart (hairlines, no glow).
          const ray = 4.5 + 1.5 * twinkle;
          ctx.globalAlpha = 0.45 * twinkle * strength;
          ctx.beginPath();
          ctx.moveTo(x - ray, y); ctx.lineTo(x + ray, y); ctx.moveTo(x, y - ray); ctx.lineTo(x, y + ray);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    colors(); build(); draw(0);
    const theme = new MutationObserver(() => { colors(); if (still) draw(0); });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const onResize = () => { build(); if (still) draw(0); };
    addEventListener("resize", onResize);
    if (still) return () => { theme.disconnect(); removeEventListener("resize", onResize); };

    const onScroll = () => { scroll = scrollY; };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      lean.tx = e.clientX / innerWidth - 0.5; lean.ty = e.clientY / innerHeight - 0.5;
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onMove, { passive: true });
    // The lean follows the pointer slowly (time-based), like the rest of the background.
    // Scrolling and leaning redraw every frame; when only the twinkle changes, 30 redraws a second are plenty.
    let last = -1, drawnAt = scroll;
    const tick = (time: number, delta: number) => {
      if (document.hidden) return;
      const f = 1 - Math.exp(-Math.min(delta / 1000, 0.05) * 2.2);
      lean.x += (lean.tx - lean.x) * f; lean.y += (lean.ty - lean.y) * f;
      const moving = scroll !== drawnAt || Math.abs(lean.tx - lean.x) + Math.abs(lean.ty - lean.y) > 0.001;
      if (!moving && time - last < 1 / 31) return;
      last = time; drawnAt = scroll;
      draw(time);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      theme.disconnect();
      removeEventListener("resize", onResize);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full" />;
}
