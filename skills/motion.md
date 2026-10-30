# Motion

The site should feel like an object with weight, not a sequence of tweens. Anything the user touches runs on
**springs**; things that simply arrive use **one of two eases**. Nothing else is allowed: no GSAP default
ease, no `power*`, `expo`, `sine`, `back`, `elastic`, `steps` or `linear` easing in components, and no CSS
transitions on transforms.

## The two eases (`lib/motion.ts`)
| Name | Definition | Use | Why |
|---|---|---|---|
| `arrive` | cubic-bezier(0.28, 0.11, 0.32, 1) (also CSS `--ease`) | Things appearing: reveals, page entrances, fades, plate wipes, mark strokes, colour changes, counters | A slow first few frames then a long, soft landing, like something set down gently. It never overshoots, so text and numbers never wobble. |
| `settle` | the step response of a spring (response 0.55s, damping 0.82) sampled into a CustomEase; duration = the time that spring takes to rest (≈0.9s) | The few moves that must be tweens: Flip card moves, bars growing, the download label swap, accent shapes landing | Leaves immediately and lands with ~1% follow-through: the motion of a spring, for places where a live spring can't run (Flip). |

GSAP's default is set to `arrive`, so a forgotten ease still speaks the language.

## Springs (`lib/spring.ts`)
Defined like Apple's: `response` (seconds per swing) and `damping` (1 = no overshoot). They run on GSAP's ticker
and keep their velocity when the target changes, so every interaction can be interrupted and eases back
with the momentum it had.
| Spring | response | damping | Use | Feel |
|---|---|---|---|---|
| `press` | 0.16s | 0.9 | Button/card goes down | Instant, firm, no wobble |
| `release` | 0.34s | 0.6 | Button/card comes back; vote arrow; theme icon turn | A touch of give (~4% past rest) |
| `hover` | 0.50s | 0.90 | Card lift, hairline fade-in, background window fade | Eases in with weight, settles without bounce |
| `glide` | 0.48s | 0.82 | Sliding highlights (filters, chart range, nav underline), link chevrons | Travels, then settles with the faintest follow-through |
| `drift` | 1.40s | 1.0 | Background grid and dot window after pointer and scroll | Slow and heavy, trails behind |

Press depth: 0.965 for controls; surfaces set their own with `data-press` (cards: 0.985).

## Timing
- **Cascade, never a uniform tick.** Groups use `cascade(each)`: each gap is a little shorter than the last
  (the group gathers pace) and irregular by up to ±14%, deterministic per index. Rise distances vary ±15%
  per element (`riseFor`). Page entrances 0.11s, lists 0.1s, mark strokes 0.09s, plates 0.14s, bars 0.022s.
- **Hover colour changes** (CSS `.smooth`): respond in 180ms, let go over 420ms, on `arrive`.
- **Typing:** quick runs inside words, a beat after spaces and punctuation, a little irregularity; the resting
  cursor breathes (opacity 1 → 0.15 on `arrive`) instead of blinking on/off.
- **Durations:** reveals 1.05–1.1s, rising 18–22px · page fade 0.4s · fades out 0.22–0.45s (leaving is quicker than arriving).

## Scroll
- **One loop.** Lenis is ticked by `gsap.ticker` (`autoRaf: false`), `lenis.on("scroll", ScrollTrigger.update)`,
  `lagSmoothing(0)`. Springs, the background and the 3D all run on the same ticker. Never a second rAF loop.
- **Lenis tuned to glide:** `lerp 0.075` (more carry than the 0.1 default), `wheelMultiplier 0.85` (a
  mouse notch doesn't lurch), `syncTouch: false` (touch keeps the device's own momentum, which is the most
  natural on phones).
- **Attached, not pinned:** scroll-linked things trail slightly. The 3D eases toward its scroll pose
  (time-based, ≈12% per frame at 60fps); the background follows on `drift`. Linear mapping is allowed only
  inside a ScrollTrigger *scrub*, where the scrub lag supplies the easing.

## The lunar spine
- The background moon's phase follows the page's moments (`data-moment`), not raw progress: it holds through
  a section and sweeps to the next phase while that section's head goes from 92% to 62% of the screen
  (`SWEEP`, components/Moment.tsx), on the `drift` spring.
- Over the same stretch the head's rule draws in (scaleX) and its glyph's terminator sweeps, scrubbed
  (`scrub: 0.6`), so both reverse on the way back up.
- Orbits sit at six depths and lean/drift by their own amounts. The theme toggle's phase moves on `glide`.
- Reduced motion: no sweeps (rules drawn, glyphs at their phase), the background still, its phase set to the
  section you're in.

## Rules
- **Transform and opacity only** (plus clip-path for plate wipes and drawSVG for mark strokes). Sliding
  highlights move with x and scaleX of a fixed 100px element, never width.
- Reveals use `fromTo` with explicit end values (a delayed `from()` can lock elements invisible) and `once: true`.
- Hover: springs, never quickTo. Reordering and filtering: GSAP Flip with `settle`, nothing unmounted.
- Page transition: `app/template.tsx`; the wrapper animates opacity only and clears it.

## Reduced motion
`prefers-reduced-motion: reduce` → no Lenis, springs jump to their targets, no press scale, no background
movement (static grid), 3D replaced by its SVG, typing shown finished, reveals fade only.

## Cleanup
Everything is created inside `useGSAP`, so it is reverted (and its ScrollTriggers killed) on unmount.
After each route change: `lenis.resize()` and `ScrollTrigger.refresh()`. Same-page hash links go through
Lenis; cross-page hash targets are jumped to after the route renders.
