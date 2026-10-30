"use client";
import { useRef } from "react";
import { arrive, gsap, reducedMotion, useGSAP } from "@/lib/motion";
import { type Line, TermFrame, tokens } from "./Term";

/**
 * The hero's terminal, typed out when it comes into view: each command appears a character at a time,
 * already in its syntax colours, with a block cursor that follows; a comment fades in once its command
 * is typed, and the cursor blinks on the last line. The server renders every line in full, so without
 * scripts or with reduced motion it simply reads as finished. Screen readers get each whole line.
 */
export function Terminal({ lines, className }: { lines: Line[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reducedMotion()) return;
    const rows = gsap.utils.toArray<HTMLElement>("[data-row]");
    const cursors = gsap.utils.toArray<HTMLElement>("[data-cursor]");
    const notes = gsap.utils.toArray<HTMLElement>("[data-note]");
    const chars = rows.map((r) => gsap.utils.toArray<HTMLElement>("[data-c]", r));
    gsap.set(chars.flat(), { display: "none" });
    gsap.set(notes, { opacity: 0 });
    gsap.set(cursors, { display: "none" });

    const tl = gsap.timeline({ delay: 0.9, scrollTrigger: { trigger: ref.current, start: "top bottom", once: true } });
    rows.forEach((_, i) => {
      if (i > 0) tl.set(cursors[i - 1], { display: "none" });
      tl.set(cursors[i], { display: "inline-block" });
      // Human rhythm: quick runs within a word, a short beat after spaces and punctuation, a little
      // irregularity everywhere (repeatable, so it types the same way on every visit).
      chars[i].forEach((c, n) => {
        const ch = c.textContent ?? "";
        const prev = n > 0 ? chars[i][n - 1].textContent ?? "" : "";
        const beat = prev === " " ? 0.07 : /[.&-]/.test(prev) ? 0.05 : 0;
        tl.set(c, { display: "inline" }, `+=${0.024 + beat + (((n * 7919 + i * 104729) % 9) / 9) * 0.03 + (ch === " " ? 0.02 : 0)}`);
      });
      if (notes[i]) tl.to(notes[i], { opacity: 1, duration: 0.6, ease: arrive }, "+=0.14");
      tl.to({}, { duration: 0.32 + i * 0.06 });
    });
    // The resting cursor breathes rather than blinking on and off.
    tl.to(cursors[cursors.length - 1], { opacity: 0.15, duration: 0.6, ease: arrive, repeat: -1, yoyo: true, repeatDelay: 0.25 });
  }, { scope: ref });

  return (
    <div ref={ref}>
      <TermFrame className={className}>
        {lines.map((l) => (
          <p key={l.cmd} className="break-words">
            <span className="sr-only">{l.cmd}{l.note ? `, ${l.note}` : ""}</span>
            <span aria-hidden="true">
              <span className="select-none text-fg-3">$ </span>
              <span data-row="">
                {tokens(l.cmd).map((t, j) => (
                  <span key={j} className={t.cls}>{[...t.text].map((c, k) => <span key={k} data-c="">{c}</span>)}</span>
                ))}
              </span>
              <span data-cursor="" className="ml-px hidden h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-blue" />
              {l.note && <span data-note="" className="text-fg-3 max-sm:block max-sm:pl-4">{"  "}# {l.note}</span>}
            </span>
          </p>
        ))}
      </TermFrame>
    </div>
  );
}
