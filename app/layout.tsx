import "@fontsource-variable/inter/wght.css";
import "lenis/dist/lenis.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Backdrop } from "@/components/Backdrop";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SmoothScroll } from "@/components/Motion";
import { ThemeProvider } from "@/components/Theme";
import { preview, site, siteUrl } from "@/lib/bots";

const description = "Discord bots you download and run yourself. Free, no account, source code included.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...preview("/", `${site.name}: Discord bots you run yourself`, description),
  title: { default: `${site.name}: Discord bots you run yourself`, template: `%s · ${site.name}` },
};

export const viewport: Viewport = {
  // Also the colour of the stripe on Discord link embeds. Discord ignores pure #000000, so this is #010101 (looks identical).
  themeColor: "#010101",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Hides entrance content until the page transition brings it in (see components/Motion.tsx). Skipped for reduced motion. */}
        <script dangerouslySetInnerHTML={{ __html: `if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("motion")` }} />
        {/* Reloads start at the top: the browser must not restore an old scroll position behind Lenis's back. */}
        <script dangerouslySetInnerHTML={{ __html: `history.scrollRestoration="manual";if(!location.hash)scrollTo(0,0)` }} />
      </head>
      <body>
        <ThemeProvider>
          <SmoothScroll>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-ui focus:bg-blue focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
            <Backdrop />
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
