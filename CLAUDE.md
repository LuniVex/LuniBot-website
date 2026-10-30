# LuniBot v2

Showcase and download site for LuniVex's self-hosted Discord bots.

This is Next.js 16 (App Router). Before using an API you're unsure of, read the matching guide in `node_modules/next/dist/docs/`.

## Design skills (read before any UI work)

The site's design system lives in `skills/`. Read all seven before writing or changing UI, and re-read `skills/anti-patterns.md` before each change:

1. `skills/visual-directions.md` — the visual language and the one rule the site obeys
2. `skills/3d-and-scroll.md` — scroll-driven 3D (Three.js), look, performance, fallbacks
3. `skills/motion.md` — GSAP + Lenis, easing, reduced motion, cleanup
4. `skills/anti-patterns.md` — hard bans
5. `skills/layout-grid.md` — the grid, spacing scale, optical and baseline alignment
6. `skills/typography.md` — the type scale and text rules
7. `skills/color-and-tokens.md` — 2 neutrals + 1 accent, radii, states
