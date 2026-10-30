"use client";
import Link from "next/link";
import { useRef } from "react";
import { spring, springs, useGSAP } from "@/lib/motion";

/**
 * Text link with a chevron that nudges toward where it goes, e.g. "Details ›" or "‹ All bots".
 * The nudge is a `glide` spring, so leaving mid-nudge eases back with its momentum instead of jumping.
 */
export function More({ href, external, back, children, className = "" }: {
  href: string; external?: boolean; back?: boolean; children: React.ReactNode; className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const nudge = useRef<((v: number) => void) | null>(null);
  useGSAP(() => {
    const x = spring(ref.current!.querySelector("svg")!, "x", springs.glide, { from: 0, unit: "px", eps: 0.02 });
    nudge.current = (v) => x.to(v);
  }, { scope: ref });
  const to = back ? -3 : 3;
  const inner = (
    <>
      {back && <Chevron back />}
      <span className="group-hover:underline group-hover:underline-offset-[0.15em]">{children}</span>
      {!back && <Chevron />}
    </>
  );
  const props = {
    ref, className: `group inline-flex items-center gap-1 text-link ${className}`,
    onPointerEnter: () => nudge.current?.(to), onPointerLeave: () => nudge.current?.(0),
    onFocus: () => nudge.current?.(to), onBlur: () => nudge.current?.(0),
  };
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{inner}</a>;
  return <Link href={href} {...props}>{inner}</Link>;
}

function Chevron({ back }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 8 14" aria-hidden="true" className="size-[0.7em] translate-y-px">
      <path d={back ? "M7 1 1 7l6 6" : "M1 1l6 6-6 6"} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
