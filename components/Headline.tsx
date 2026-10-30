"use client";
import { arrive, cascade } from "@/lib/motion";
import SplitText from "./bits/SplitText";

/**
 * A page's H1, rising into place piece by piece through a mask on the site's `arrive` ease, in a
 * cascade (gaps that tighten and vary) rather than an even tick. Words by default; `chars` for short names.
 */
export function Headline({ text, className = "", split = "words", each = 0.085 }: { text: string; className?: string; split?: "words" | "chars"; each?: number }) {
  return (
    <SplitText tag="h1" text={text} className={className} textAlign="left" splitType={split} effect="rise" mask
      trigger="load" duration={1.05} ease={arrive} staggerFn={cascade(each)} />
  );
}
