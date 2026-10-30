"use client";
import { ThemeProvider as NextThemes, useTheme } from "next-themes";
import { useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { easeCss, reducedMotion, spring, springs, useGSAP } from "@/lib/motion";
import { OPENING, phasePath } from "@/lib/moon";
import { onDial } from "./Moon";
import type { Spring } from "@/lib/spring";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <NextThemes attribute="class" defaultTheme="dark" enableSystem={false} storageKey="lunibots-theme" disableTransitionOnChange>{children}</NextThemes>;
}

type StartViewTransition = (update: () => void) => { ready: Promise<void> };

/**
 * Light/dark switch, drawn as the LuniVex moon diagram (components/Moon.tsx `Crescent`). Night is the
 * opening crescent, day the full moon: on each switch the terminator sweeps between them on the `release`
 * spring and the dial's index tick travels with it, while the new theme spreads out from the button.
 */
const DAY_PHASE = 0.5;
const drawIcon = (svg: SVGSVGElement | null, phase: number) => {
  if (!svg) return;
  svg.querySelector("[data-lit]")?.setAttribute("d", phasePath(phase, 6.5));
  const [x1, y1] = onDial(phase, 9), [x2, y2] = onDial(phase, 12);
  const tick = svg.querySelector("[data-tick]");
  tick?.setAttribute("x1", x1.toFixed(2)); tick?.setAttribute("y1", y1.toFixed(2));
  tick?.setAttribute("x2", x2.toFixed(2)); tick?.setAttribute("y2", y2.toFixed(2));
};
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const icon = useRef<SVGSVGElement>(null);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const dark = mounted && resolvedTheme === "dark";
  const turn = useRef<Spring | null>(null);
  useGSAP(() => {
    const phase = !mounted || dark ? OPENING : DAY_PHASE;
    // Snap on first paint; after that the phase sweeps on the `glide` spring (no overshoot past full).
    if (!turn.current) { turn.current = spring((v) => drawIcon(icon.current, v), "phase", springs.glide, { from: phase, eps: 0.001 }); turn.current.set(phase); }
    else if (mounted) turn.current.to(phase);
  }, { dependencies: [dark, mounted] });

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next = dark ? "light" : "dark";
    const start = (document as Document & { startViewTransition?: StartViewTransition }).startViewTransition?.bind(document);
    if (reducedMotion() || !start) { setTheme(next); return; }
    const box = e.currentTarget.getBoundingClientRect();
    const x = box.left + box.width / 2, y = box.top + box.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    start(() => {
      document.documentElement.classList.toggle("dark", next === "dark");
      flushSync(() => setTheme(next));
    }).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 900, easing: easeCss, pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => {});
  }

  return (
    <button type="button" onClick={toggle} aria-label={dark ? "Switch to light appearance" : "Switch to dark appearance"}
      className="smooth grid size-9 place-items-center rounded-ui text-fg-2 hover:bg-tile hover:text-fg">
      <svg ref={icon} viewBox="-12 -12 24 24" aria-hidden="true" className="size-[19px] overflow-visible">
        <circle r="10.5" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.3" />
        <line data-tick="" x1={onDial(OPENING, 9)[0]} y1={onDial(OPENING, 9)[1]} x2={onDial(OPENING, 12)[0]} y2={onDial(OPENING, 12)[1]} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <circle r="6.5" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.45" />
        <path data-lit="" d={phasePath(OPENING, 6.5)} fill="currentColor" />
      </svg>
    </button>
  );
}
