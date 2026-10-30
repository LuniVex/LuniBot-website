# Layout grid

## The grid
- **Measure:** content is `max-w-page` (980px) wide, centred in the viewport, with 20px (`px-5`) side padding on every section *and* on the header. Every container is built the same way: `<section class="px-5"><div class="mx-auto max-w-page">`.
- **Two left edges only:** the page edge (x = 0 of the measure) and the **body column** at 160px (`md:pl-40`, exported as `body` from `components/Sections.tsx`). Section index labels sit in the 160px margin column; everything else starts on one of the two edges. Below `md`, both edges are the page edge.
- **Columns inside the body:** 2 equal columns with a 40px gap (`gap-x-10`), or the asymmetric hero split `5fr / 4fr`.

## Spacing scale (4px base)
`4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 96 · 128` (Tailwind 1, 2, 3, 4, 6, 8, 10, 12, 16, 24, 32). Nothing off the scale.
- Between sections: 64px mobile / 96px desktop (`pb-16 md:pb-24`), and every section starts with its hairline rule.
- Section rule → title: 20px (`pt-5`). Title → content: 40px (`mt-10`).
- Card padding: 32px all sides (`p-8`), every card. Action row: 24px above its hairline (`pt-6`).

## Optical alignment
- Marks are drawn on a 48-unit grid whose ink starts at x = 6; when a mark sits on a left edge, pull it left by `6/48 × size` (`<Mark optical />`) so the ink, not the box, aligns with the text.
- Fully rounded or circular shapes overshoot by ~1px; don't compensate on controls (4px corners), do on circles.

## Baselines
- Rows that mix sizes (index + title + note, label + value, icon + text) use `items-baseline`, never `items-center`.
- Text paired with an icon: icon is 1em, vertically centred with `translate-y` tuned to the cap height (not the box).
- Metadata lines in a row of cards get fixed line counts (`min-h-[2lh]` for two-line taglines) so bars, metadata and action rows line up across cards.
