"use client";
import { useRef } from "react";
import { arrive, cascade, gsap, reducedMotion, riseFor, useGSAP } from "@/lib/motion";

let firstPage = true;

/**
 * Page transition, remounted by Next on every navigation. The page fades up from nothing, then the
 * content marked with <Enter> rises into place in document order, slightly after it. The wrapper only
 * ever animates opacity and clears it afterwards, so it never clips content or traps the sticky header.
 * On the very first load there is nothing to transition from, so only the content entrance plays.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const enter = gsap.utils.toArray<HTMLElement>("[data-enter]", ref.current);
    const first = firstPage;
    firstPage = false;
    if (reducedMotion()) { gsap.set(enter, { autoAlpha: 1 }); return; }
    const tl = gsap.timeline({ defaults: { ease: arrive } });
    if (!first) tl.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.4, clearProps: "opacity" });
    // The page's opening content gathers in a cascade: varied rise, gaps that tighten as it goes.
    tl.fromTo(enter, { autoAlpha: 0, y: riseFor(18) }, { autoAlpha: 1, y: 0, duration: 1.05, stagger: cascade(0.11), clearProps: "transform" }, first ? 0.25 : 0.12);
  }, { scope: ref });
  return <div ref={ref}>{children}</div>;
}
