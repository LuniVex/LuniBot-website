"use client";
import { ThemeProvider as NextThemes, useTheme } from "next-themes";
import { useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { easeCss, reducedMotion, spring, springs, useGSAP } from "@/lib/motion";
import { phasePath } from "@/lib/moon";
import type { Spring } from "@/lib/spring";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <NextThemes attribute="class" defaultTheme="dark" enableSystem={false} storageKey="lunibots-theme" disableTransitionOnChange>{children}</NextThemes>;
}

type StartViewTransition = (update: () => void) => { ready: Promise<void> };

/** Light/dark switch. The new theme spreads out from the button as a growing circle; the icon turns as it changes. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const icon = useRef<SVGSVGElement>(null);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const dark = mounted && resolvedTheme === "dark";
  const turn = useRef<Spring | null>(null);
  useGSAP(() => {
    const rotate = dark ? 180 : 0;
    // Snap on first paint; after that the half-moon turns on the `release` spring, with a little give.
    if (!turn.current) { turn.current = spring(icon.current!, "rotate", springs.release, { from: rotate, eps: 0.05 }); turn.current.set(rotate); }
    else if (mounted) turn.current.to(rotate);
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
      <svg ref={icon} viewBox="0 0 16 16" aria-hidden="true" className="size-[17px]">
        {/* The LuniVex crescent: the toggle turns it half a revolution on each switch. */}
        <circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
        <path transform="translate(8 8)" d={phasePath(0.2, 6.4)} fill="currentColor" />
      </svg>
    </button>
  );
}
