"use client";
import { useRef } from "react";
import { gsap, reducedMotion, ScrollTrigger, soft, useGSAP } from "@/lib/motion";

const fmt = (v: number) => Math.round(v).toLocaleString("en-GB");

/** Rolls up to its value once it is on screen, and glides between values when it changes. */
export function Count({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef({ n: 0 }); // same starting text on server and client

  useGSAP(() => {
    const el = ref.current!;
    const draw = () => { el.textContent = fmt(shown.current.n); };
    if (reducedMotion()) { shown.current.n = value; draw(); return; }
    const distance = Math.abs(value - shown.current.n);
    const roll = () => gsap.to(shown.current, {
      n: value, duration: distance <= 1 ? 0.5 : Math.min(1.6, 0.8 + Math.log10(distance + 1) * 0.35), ease: soft, onUpdate: draw, overwrite: true,
    });
    // The first roll waits until the number is on screen; later changes animate straight away.
    if (shown.current.n === 0) ScrollTrigger.create({ trigger: el, start: "top bottom", once: true, onEnter: roll });
    else roll();
  }, { dependencies: [value], scope: ref });

  // Screen readers get the real figure straight away; the rolling digits are for the eye only.
  return (
    <span className="tabular-nums">
      <span ref={ref} aria-hidden="true">0</span>
      <span className="sr-only">{fmt(value)}</span>
    </span>
  );
}
