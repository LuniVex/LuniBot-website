import Link from "next/link";

type Kind = "primary" | "secondary" | "inverse";
const kinds: Record<Kind, string> = {
  primary: "bg-blue text-white hover:bg-blue-hover",
  secondary: "border border-blue text-link hover:bg-blue hover:text-white",
  inverse: "bg-bg text-fg hover:opacity-90",
};

export const pill = (kind: Kind = "primary", size: "md" | "lg" = "md", extra = "") =>
  `smooth press inline-flex items-center justify-center gap-2 rounded-ui font-normal ${
    size === "lg" ? "min-h-12 px-6 t-control-lg" : "min-h-9 px-4 t-control"
  } ${kinds[kind]} ${extra}`;

/** Rounded pill buttons, filled blue for the main action. */
export function Pill({ href, kind = "primary", size = "md", download, external, className = "", children }: {
  href: string; kind?: Kind; size?: "md" | "lg"; download?: boolean; external?: boolean; className?: string; children: React.ReactNode;
}) {
  const cls = pill(kind, size, className);
  if (download) return <a href={href} download="" className={cls}>{children}</a>;
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
  // Same-page anchors are plain links so Lenis can glide to them without the router jumping there too.
  if (href.startsWith("#")) return <a href={href} className={cls}>{children}</a>;
  return <Link href={href} className={cls}>{children}</Link>;
}

export { More } from "./More";
