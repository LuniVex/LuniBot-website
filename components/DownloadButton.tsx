"use client";
import { useRef, useState } from "react";
import { gsap, reducedMotion, settle, useGSAP } from "@/lib/motion";
import { afterDownload } from "@/lib/stats-client";
import { pill } from "./Button";

/**
 * The download button. Clicking it starts the file and briefly reads "Download started" (the two labels
 * share one grid cell, so the button keeps its width while they crossfade), then the page's download
 * figures are re-read so the new download shows up everywhere at once.
 */
export function DownloadButton({ slug, size = "md", children }: { slug: string; size?: "md" | "lg"; children: React.ReactNode }) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useGSAP(() => {
    const [idle, done] = gsap.utils.toArray<HTMLElement>("[data-label]");
    const d = reducedMotion() ? 0 : 0.25;
    gsap.to(idle, { autoAlpha: started ? 0 : 1, y: started && d ? -6 : 0, duration: d * 1.4, ease: settle, overwrite: true });
    gsap.to(done, { autoAlpha: started ? 1 : 0, y: started || !d ? 0 : 6, duration: d * 1.4, ease: settle, overwrite: true });
  }, { dependencies: [started], scope: ref });

  const click = () => {
    afterDownload(slug);
    setStarted(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStarted(false), 2400);
  };

  return (
    <a ref={ref} href={`/api/download/${slug}`} download="" onClick={click} className={pill("primary", size)}>
      <span className="grid">
      <span data-label="" className="[grid-area:1/1]">{children}</span>
      <span data-label="" aria-hidden={!started} className="invisible inline-flex items-center justify-center gap-1.5 [grid-area:1/1]">
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
        Download started
      </span>
      </span>
      <span className="sr-only" role="status">{started ? "Download started" : ""}</span>
    </a>
  );
}
