"use client";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { arrive, cascade, gsap, reducedMotion, revealStart, rise, riseFor, ScrollTrigger, settle, spring, springs, useGSAP } from "@/lib/motion";
import type { Spring } from "@/lib/spring";

/**
 * The one scroll system: Lenis, ticked by GSAP's ticker (no rAF loop of its own), feeding ScrollTrigger
 * on every scroll so scroll-driven effects stay in step. Reduced-motion visitors get the browser's own
 * scrolling and no Lenis at all. Same-page anchor links glide and respect each target's scroll-margin.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    // Tuned to glide: a slightly lower lerp than Lenis's default carries momentum a little further, and a
    // softer wheel multiplier stops a mouse notch from lurching. Touch keeps the device's own momentum
    // (syncTouch off), which is already the most natural thing on a phone.
    const l = new Lenis({ autoRaf: false, stopInertiaOnNavigate: true, lerp: 0.075, wheelMultiplier: 0.85, touchMultiplier: 1, syncTouch: false });
    l.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.current = l;
    // Start where the address says: the top, or a #section. Lenis and the browser agree from the first frame.
    if (!location.hash) { window.scrollTo(0, 0); l.scrollTo(0, { immediate: true, force: true }); }

    // Links to a #section of the current page glide there with Lenis. Caught before Next's <Link> sees
    // the click, so the router doesn't jump there at the same time. The address is left unchanged, so a
    // reload afterwards starts at the top instead of deep-linking to the section.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      l.scrollTo(target);
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      l.destroy();
      lenis.current = null;
    };
  }, []);

  // A new page starts at the top (or at its #section when the address has one), set through Lenis and the
  // browser together so Lenis never pulls the page back to the previous page's position. Then Lenis and
  // every live trigger re-measure. Triggers of the old page were killed when it unmounted (useGSAP).
  useEffect(() => {
    const l = lenis.current;
    const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (!target) { window.scrollTo(0, 0); l?.scrollTo(0, { immediate: true, force: true }); }
    const id = requestAnimationFrame(() => {
      l?.resize();
      ScrollTrigger.refresh();
      if (target && l) l.scrollTo(target, { immediate: true, force: true });
      else if (target) target.scrollIntoView();
    });
    return () => cancelAnimationFrame(id);
  }, [path]);

  usePressPhysics();
  return children;
}

/** What can be pressed: buttons, `.press` links (every pill), and `[data-press]` surfaces such as cards. */
const PRESSABLE = "button:not(:disabled), .press, [data-press]";

/**
 * Press physics for the whole site, from one set of listeners. Pressing (pointer, or Space/Enter on a
 * focused control) springs the element down at once with the firm `press` spring; letting go springs it
 * back with the `release` spring's touch of give. Dragging off a held button lets it ease back too.
 * Depth is 0.965 for controls, or the element's `data-press` value (cards use a gentler 0.985).
 */
function usePressPhysics() {
  useEffect(() => {
    if (reducedMotion()) return;
    const bodies = new WeakMap<Element, Spring>();
    const body = (el: Element) => {
      let s = bodies.get(el);
      if (!s) { s = spring(el, "scale", springs.press, { from: 1, eps: 0.0005 }); bodies.set(el, s); }
      return s;
    };
    let held: Element | null = null;
    const depth = (el: Element) => Number(el.getAttribute("data-press")) || 0.965;
    const press = (el: Element | null) => { if (!el) return; held = el; body(el).to(depth(el), springs.press); };
    const release = () => { if (held) body(held).to(1, springs.release); held = null; };

    const down = (e: PointerEvent) => { if (e.button === 0) press((e.target as Element | null)?.closest(PRESSABLE) ?? null); };
    const move = (e: PointerEvent) => { if (held && !held.contains(e.target as Node)) release(); };
    const key = (e: KeyboardEvent) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) press(document.activeElement?.closest(PRESSABLE) ?? null);
    };
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerup", release);
    addEventListener("pointercancel", release);
    document.addEventListener("keydown", key);
    document.addEventListener("keyup", release);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("pointermove", move);
      removeEventListener("pointerup", release);
      removeEventListener("pointercancel", release);
      document.removeEventListener("keydown", key);
      document.removeEventListener("keyup", release);
    };
  }, []);
}

// Reveals always state where they end. A delayed from() can read its end values late, after its own
// start values were applied, and then never become visible.
const hidden = (y: number) => ({ autoAlpha: 0, y: reducedMotion() ? 0 : riseFor(y) });
const shown = { autoAlpha: 1, y: 0, clearProps: "transform" };

/** Fades and rises into place the first time it scrolls into view. The trigger is killed once it has fired. */
export function Reveal({ children, className, delay = 0, as: Tag = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(ref.current, hidden(rise.y), {
      ...shown, duration: rise.duration, ease: arrive, delay,
      scrollTrigger: { trigger: ref.current, start: revealStart, once: true },
    });
  }, { scope: ref });
  return <Tag ref={ref as React.Ref<never>} className={className}>{children}</Tag>;
}

/** Children (RevealChild) enter one after another, once, when the group scrolls into view. */
export function RevealGroup({ children, className, gap = 0.1 }: { children: React.ReactNode; className?: string; gap?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo("[data-reveal]", hidden(rise.y), {
      ...shown, duration: rise.duration, ease: arrive, stagger: cascade(gap),
      scrollTrigger: { trigger: ref.current, start: revealStart, once: true },
    });
  }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}

export function RevealChild({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div data-reveal="" className={className}>{children}</div>;
}

/**
 * Marks content that is on screen when a page opens. The page transition (app/template.tsx) brings these
 * in, in document order, just after the page itself. Before scripts run they are hidden by the
 * `motion` class on <html> (see app/layout.tsx), so nothing flashes before it animates.
 */
export function Enter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div data-enter="" className={className}>{children}</div>;
}

/** Fades and rises in when it mounts: for things that appear later, like the empty search state. */
export function Appear({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.fromTo(ref.current, hidden(10), { ...shown, duration: 0.6, ease: arrive }); }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}

const assemblies = new Map<Element, gsap.core.Timeline>();

/** Jumps every unfinished assembly inside `root` to its end, e.g. before the gallery rearranges cards. */
export function finishAssemblies(root: Element | null) {
  if (!root) return;
  assemblies.forEach((tl, el) => { if (root.contains(el)) tl.progress(1); });
}

/**
 * Builds a block in front of the reader, once, when it scrolls into view (or on mount with `onMount`):
 * the block rises in, then its mark draws itself stroke by stroke and its accent shape settles in,
 * screenshot plates wipe open from the top, and chart bars grow from the baseline. Everything is
 * transform, opacity or clip; reduced motion shows the finished block straight away.
 */
export function Assemble({ children, className, onMount = false, delay = 0, rise: lift = true }: {
  children: React.ReactNode; className?: string; onMount?: boolean; delay?: number; rise?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reducedMotion()) return;
    const root = ref.current!;
    const q = gsap.utils.selector(root);
    const strokes = q("[data-mark] svg > :not(.a)");
    const solids = q("[data-mark] svg > .a");
    const plates = q("[data-plate]");
    const bars = q("[data-bars] > *");
    const tl = gsap.timeline({
      delay, defaults: { ease: arrive },
      scrollTrigger: onMount ? undefined : { trigger: root, start: revealStart, once: true },
      onComplete: () => { assemblies.delete(root); },
    });
    if (lift) tl.fromTo(root, { autoAlpha: 0, y: rise.y }, { autoAlpha: 1, y: 0, duration: rise.duration, clearProps: "transform" }, 0);
    // Strokes draw in a cascade, the accent shape settles in like a placed object, plates wipe open,
    // and bars grow with the same settle, each a beat after the last.
    if (strokes.length) tl.fromTo(strokes, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.95, stagger: cascade(0.09) }, 0.15);
    if (solids.length) tl.fromTo(solids, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.7, ease: settle, stagger: cascade(0.06) }, 0.55);
    if (plates.length) tl.fromTo(plates, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05, stagger: cascade(0.14), clearProps: "clipPath" }, 0.2);
    if (bars.length) tl.fromTo(bars, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.75, ease: settle, stagger: cascade(0.022) }, 0.45);
    assemblies.set(root, tl);
    return () => { assemblies.delete(root); };
  }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}

/** Soft breathing placeholder while numbers load. */
export function Shimmer({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reducedMotion()) return;
    gsap.fromTo(ref.current, { opacity: 0.5 }, { opacity: 1, duration: 1.1, ease: arrive, repeat: -1, yoyo: true });
  }, { scope: ref });
  return <div ref={ref} aria-hidden="true" className={`rounded-ui bg-line/50 ${className}`} />;
}

/**
 * The highlight behind the chosen option of a segmented control. It slides to whichever child has
 * aria-pressed="true" or aria-current="page" whenever `active` changes, and snaps into place on first
 * paint and on resize. Until it is in place, the container has no data-ready attribute, so the chosen
 * option can style itself (group-data-ready/pill) and is never unreadable before the script runs.
 */
export function usePill(active: unknown, mode: "fill" | "line" = "fill") {
  const box = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  useGSAP(() => placePill(box.current, pill.current, placed, true, mode), { dependencies: [active], scope: box });

  // Snap into place when the control really changes size (a ResizeObserver also fires once as soon as it
  // starts observing; that first call must not cut a slide short). Re-attached when `active` changes,
  // since the control may only mount once data arrives.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let size = `${el.offsetWidth}x${el.offsetHeight}`;
    const observer = new ResizeObserver(() => {
      const now = `${el.offsetWidth}x${el.offsetHeight}`;
      if (now !== size) { size = now; placePill(el, pill.current, placed, false, mode); }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [active, mode]);

  return { box, pill };
}

/** Moves the highlight onto the chosen option: a filled block ("fill") or a 1px rule under it ("line"). */
const pillSprings = new WeakMap<HTMLElement, { x: Spring; sx: Spring }>();
/** The highlight's base width; its visible width is a scaleX of this, so the slide is transform-only. */
const PILL_BASE = 100;

/**
 * Moves the highlight onto the chosen option, a filled block ("fill") or a 1px rule under it ("line"),
 * on `glide` springs for position and width (as x and scaleX), so a quick second click redirects it
 * mid-slide with its momentum instead of restarting.
 */
function placePill(box: HTMLElement | null, pill: HTMLElement | null, placed: { current: boolean }, animate: boolean, mode: "fill" | "line") {
  if (!box || !pill) return;
  const target = box.querySelector<HTMLElement>('[aria-pressed="true"],[aria-current="page"]');
  if (!target) { gsap.to(pill, { autoAlpha: 0, duration: 0.25 }); return; }
  let s = pillSprings.get(pill);
  if (!s) {
    gsap.set(pill, { width: PILL_BASE, transformOrigin: "0 0" });
    s = { x: spring(pill, "x", springs.glide, { from: target.offsetLeft, unit: "px", eps: 0.05 }), sx: spring(pill, "scaleX", springs.glide, { from: target.offsetWidth / PILL_BASE, eps: 0.0005 }) };
    pillSprings.set(pill, s);
  }
  gsap.set(pill, mode === "line"
    ? { y: target.offsetTop + target.offsetHeight - 1, height: 1, autoAlpha: 1 }
    : { y: target.offsetTop, height: target.offsetHeight, autoAlpha: 1 });
  const x = target.offsetLeft, sx = target.offsetWidth / PILL_BASE;
  if (animate && placed.current) { s.x.to(x); s.sx.to(sx); }
  else { s.x.set(x); s.sx.set(sx); }
  placed.current = true;
  box.dataset.ready = "";
}
