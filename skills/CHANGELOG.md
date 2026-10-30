# Design changelog: skills, alignment, 3D, depth

Each change and the skill rule it follows. Deviations from the brief are listed at the end.

## Skills (Part A)
| Change | Rule |
|---|---|
| Added `skills/` with seven files; `CLAUDE.md` tells any agent to read them all before UI work and to re-read `anti-patterns.md` before each change | — |

## Tokens and anti-patterns
| Change | Rule |
|---|---|
| Palette rebuilt as `--paper`, `--ink`, `--accent`; every grey (`fg-2`, `fg-3`, `line`, `tile`, `bg-alt`) is a `color-mix` tint of ink on paper. Visual values unchanged (tints chosen to reproduce the old hexes) | color-and-tokens: 2 neutrals + 1 accent |
| One radius, 4px (`rounded-ui`, `rounded-tile`, `rounded-panel`), for cards, plates, panels, buttons, inputs, segmented controls, terminal, skip link; 2px for highlights inside 4px controls | color-and-tokens: radii 0–4px; anti-patterns: rounded-everything |
| Pill buttons and pill segmented controls → 4px rectangles | anti-patterns: pill buttons, floating pill navs |
| Header: glass (backdrop blur, translucent fill) → solid paper with a hairline once scrolled | anti-patterns: glassmorphism |
| Nav active state: sliding filled pill → sliding 1px underline (GSAP, `usePill(…, "line")`) | anti-patterns: floating pill navs; motion: transform only |
| Hero terminal drop shadow removed | anti-patterns: drop shadows for depth |
| Terminal title-bar dots: macOS red/yellow/green → neutral hairline circles | anti-patterns: other brands' colours; color-and-tokens |
| Hero, About, 404 and error pages: centred → left-aligned on the grid; empty and "no file" states left-aligned | anti-patterns: centred-everything |

## Alignment (Part B)
Measured with a layout audit at 360, 768, 1440 and 1920 px (left edges against the grid, section padding, cross-card rows).
| Was off | Change | Rule |
|---|---|---|
| Header logo 20px inside the page edge (padding applied twice) | Header uses the same `px-5` + `max-w-page` structure as sections; nav pulled 8px right so the icon glyph, not its hit area, meets the edge | layout-grid: one measure; optical alignment |
| Every section title 24px past the body column (a stray grid gap) | Index column exactly 160px, no gap; the note keeps its own 24px | layout-grid: two left edges |
| Bot page facts row: second column 3.3px off the body column | Facts row uses the index column (160px + 5 columns) from 1024px; 3 columns below | layout-grid: near-misses |
| Facts values overlapped at 768px | Index-column grid and the header split start at 1024px | layout-grid |
| Section padding varied (132/96, 92/64, 80/80, 112/112…) | Every section: 64px mobile / 96px desktop below, rule on top (`pb-16 md:pb-24`); page headers 96/112px top for the fixed header | layout-grid: spacing scale |
| Card padding 32px or 40px depending on card | 32px everywhere (`p-8`) | layout-grid: card padding |
| Bars and action rows drifted between neighbouring cards when taglines had different line counts | Card taglines reserve two lines (`min-h-[2lh]`) | layout-grid: baselines |
| Marks sat 6–11px right of the text edge (their ink starts 6 units into the box) | `<Mark optical />` and matching offsets on 3D stages pull the ink onto the edge | layout-grid: optical alignment |
| Plate radius 6px, terminal 12px, panels 18px, cards 28px | All 4px | color-and-tokens |
| Ad hoc text sizes (13, 14, 15, 17, 19, 21, 40px) in 12 places | Replaced with scale classes; added `t-h3`, `t-body-lg`, `t-figure`, `t-mono`, `t-control(-lg)` | typography: one scale |
| "GPL-3.0" broke at the hyphen in a note | Non-breaking hyphen | typography: no orphans |

## 3D (Part C) — renderer: plain Three.js 0.186
| Change | Rule |
|---|---|
| `components/three/objects.ts`: orthographic camera, paper-coloured faces (`MeshBasicMaterial`, no lights), 1px ink edges, one accent part; loaded by dynamic import only when needed (146 KB gzip chunk) | 3d-and-scroll: look; performance |
| Hero: a terminal as three stacked slabs with an extruded prompt and an accent cursor. ScrollTrigger maps progress through the hero to rotation and to the gaps between slabs (it assembles); the stage is sticky so it stays in frame while the copy and terminal scroll past | 3d-and-scroll: scroll is the clock; pinning |
| Hub featured card and bot page features: the bot's own mark lifted into layers (hairline strokes, baseline set back, extruded accent shape, quiet frame behind), turned by scroll | 3d-and-scroll: one object in view; visual-directions: 3D as focal object |
| `components/ThreeStage.tsx`: static SVG twin in the server HTML; canvas mounts within one viewport of the screen, fades in, draws only while on screen, visible and still easing (0 draws when idle, off screen or hidden); pixel ratio ≤ 2 (≤ 1.5 on small screens); recolours on theme change; disposes on unmount | 3d-and-scroll: performance and fallbacks |
| SVG twin when: reduced motion, low-power hints, no WebGL, lost context, or a software renderer | 3d-and-scroll: fallbacks |
| `components/StackDrawing.tsx`: the hero stack projected with the same maths at the mid-scroll pose, so the swap doesn't jump | 3d-and-scroll: fallbacks |

## Background and depth (Part D)
| Change | Rule |
|---|---|
| One persistent page grid: 48px hairlines in the texture tint (line at 28%), fixed, masked to fade out, drifting at 1/12 of scroll speed (transform, wraps per cell); replaces the old hero-only grid | visual-directions: texture barely there; motion: transform only |
| Dot field behind each 3D object, with 40px of scroll parallax | visual-directions: texture; 3d-and-scroll |

## Moon background fix (2.2.1)
| Was wrong | Change | Rule |
|---|---|---|
| The moon's lit part was filled with `--tile`, the cards' colour: a heavy grey blob that swallowed card edges where they overlapped | Lit shape in `--bg-alt` with a `--line` hairline on its limb and terminator; the dark limb in the texture tint | visual-directions: texture barely there; color-and-tokens |
| Waxing was a shadow disc sliding aside (a two-circle lune, not a phase) | The lit shape is `phasePath(phase)`, updated with the scroll: crescent at the top, full at the bottom | visual-directions: phases drawn exactly |
| Tonight's dial tick was accent blue and turned with the scroll, landing on top of text beside the primary button | Longer tick in `--fg-3` | visual-directions: one accent per view |
| 22 evenly spaced rings filled the screen | 6 orbits, spaced wider with distance | visual-directions: never fill space just because it is empty |

## Cursor loupe
| Change | Rule |
|---|---|
| The cursor's even dot window became a halftone: three dot layers on one fixed 16px grid, in nested soft windows, so dots swell toward the centre like light printed on paper (no glow, no colour) | visual-directions: texture barely there; anti-patterns: no glow, gradients only draw dots or mask |
| A graduated rim (30 ticks, one longer ink index, echoing the moon's dial) follows on `hover`, ahead of the halftone on `drift`, so the light trails behind it | motion: springs; visual-directions: the moon motif |
| The rim rolls with sideways movement exactly as a wheel of its radius would (dx / r), and tightens to 0.72 over links and buttons on `glide` | motion: transform only, springs; hidden on touch and reduced motion |

## Focus reveal and light mode
| Was wrong | Change | Rule |
|---|---|---|
| The halftone loupe read as a stamped dot square, and its ticked rim as a sparkle | Removed. Under the cursor, a soft round window traces the same orbits, dial and moon in `--fg-3`, so the drawing comes into focus; nothing new is added | anti-patterns: moon clichés, starfields; visual-directions: texture barely there |
| The dial's ticks floated loose and read as debris | Ticks stand on their own hairline circle | visual-directions: hairline structure |
| Light mode shaded the moon backwards (lit side grey), so the full moon was a grey blob behind text | `--moon-lit` / `--moon-dark`: in light the lit side is paper and the unlit side is tinted | color-and-tokens |
| Light-mode orbits almost invisible | `--texture-strength` 55% in light, 40% in dark | color-and-tokens: visible in both themes |

## Cards and models
| Was wrong | Change | Rule |
|---|---|---|
| Cards were heavy grey tiles; the featured card's stand-in screenshot left a large empty area | Paper cards framed by a hairline, each with a stage (faint `bg-alt` band, corner registration marks) for the bot as an object; specs as a labelled row; Details on the right of the action row | visual-directions: hairline structure; negative space |
| "Upvoted" filled blue beside the blue Download button: two accents in one card | A standing vote is an ink outline with a filled arrow | visual-directions: one accent per component |
| Empty download months drew a dashed row of 1px stubs | Days with none draw nothing; the row is one line with the bars running between label and total | anti-patterns: nothing there only to look busy |
| The hero slabs landed flat and vanished into a small mark | They land on the card's stage in a three-quarter view and the bot's model rises out of them and stays | 3d-and-scroll: one system in view |
| One 3D object on the site beyond the hero | Bot models (`models.ts`) on bot pages; the How it works box, which opens and lifts out the token as you read the steps, with a static drawing twin (`PackageDrawing`) | 3d-and-scroll: 3D explains the thing beside it; fallbacks |

## Copy
| Change | Rule |
|---|---|
| Hero terminal label "Every bot starts the same way"; footnote "Each bot's page lists anything else it needs, like an API key."; terminal comment shortened to "add your bot token" | anti-patterns: plain, specific copy |

## Deviations from the brief
1. **Not the Discord logo.** The hero object is our own terminal stack. The site says it isn't affiliated with Discord, and Discord's brand guidelines don't allow its logo as decoration; anti-patterns.md now bans it.
2. **"Keep the existing look" vs. the token rules.** The explicit rules won: 4px radii instead of 28px cards and pill buttons, no glass header, no terminal shadow, left-aligned heroes. Palette and type are unchanged.
3. **Pinning uses `position: sticky`,** with ScrollTrigger measuring progress over the same section, instead of a ScrollTrigger pin (no pin-spacer reflow; Lenis scrolls natively, so sticky is exact).
4. **Software-rendered WebGL falls back to the SVG.** Measured: 33ms median / 133ms p95 frames while scrolling on SwiftShader, against a steady 16.7ms on the GPU.
5. **Link previews (`lib/og.tsx`) still use the old coloured app-icon tiles;** they are images for Discord and social embeds, not part of the site's UI.
