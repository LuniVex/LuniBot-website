"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/bots";
import { usePill } from "./Motion";
import { Crescent } from "./Moon";
import { ThemeToggle } from "./Theme";

const nav = [{ href: "/", label: "Bots" }, { href: "/about", label: "About" }];

/** Frosted, translucent bar that stays at the top. It is clear at the top of the page and frosts over once you scroll. */
export function Header() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const check = () => setScrolled(scrollY > 8);
    check();
    addEventListener("scroll", check, { passive: true });
    return () => removeEventListener("scroll", check);
  }, []);
  const current = (href: string) => (href === "/" ? path === "/" || path.startsWith("/bots") : path.startsWith(href));
  const { box, pill } = usePill(nav.find((l) => current(l.href))?.href, "line");
  return (
    <header className={`smooth sticky top-0 z-50 -mb-13 border-b px-5 ${scrolled ? "border-line bg-bg" : "border-transparent bg-bg/0"}`}>
      <div className="mx-auto flex h-13 max-w-page items-center justify-between">
        <Link href="/" className="t-body-lg flex items-center gap-2 font-semibold tracking-[-0.02em]"><Crescent size={18} className="text-fg" />{site.name}</Link>
        <nav aria-label="Main" className="-mr-2 flex items-center gap-1">
          <div ref={box} className="group/pill relative mr-3 flex items-center gap-5">
          <span ref={pill} aria-hidden="true" className="invisible absolute left-0 top-0 bg-fg" />
          {nav.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href) ? "page" : undefined}
              className="smooth t-small relative py-1.5 text-fg-2 decoration-1 underline-offset-[7px] hover:text-fg aria-[current=page]:text-fg aria-[current=page]:underline group-data-ready/pill:aria-[current=page]:no-underline">
              <span className="relative">{l.label}</span>
            </Link>
          ))}
          </div>
          <a href={`https://github.com/${site.githubOwner}`} target="_blank" rel="noopener noreferrer" aria-label={`${site.githubOwner} on GitHub`}
            className="smooth press grid size-9 place-items-center rounded-ui text-fg-2 hover:bg-tile hover:text-fg">
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-[17px] fill-current">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
