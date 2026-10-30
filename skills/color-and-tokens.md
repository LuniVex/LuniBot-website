# Colour and tokens

Defined once in `app/tokens.css`; components use only the Tailwind names below.

## Two neutrals + one accent
| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper` | #ffffff | #000000 | background |
| `--ink` | #1d1d1f | #f5f5f7 | text and hairline source |
| `--accent` | #0071e3 | #0071e3 | the one accent (fills) |

Everything else is a **tint of ink on paper**, so the palette stays two neutrals:
| Derived | Light (ink %) | Dark (ink %) | Tailwind |
|---|---|---|---|
| `--fg-2` secondary text | 64% | 66% | `text-fg-2` |
| `--fg-3` quiet text | 52% | 55% | `text-fg-3` |
| `--line` hairlines | 19% | 27% | `border-line` |
| `--tile` surfaces | 4% | 12% | `bg-tile` |
| `--bg-alt` faint band | 2.5% | 6.5% | `bg-alt` |
| `--accent-text` accent as text/links | accent mixed toward ink for contrast | accent mixed toward paper | `text-link` |

Texture tints: `--texture` = line at 40% (the page grid); the pointer window's dots use the line tint itself. Tuned to be faint but actually visible in both themes.

## Radii
One token: `--radius-ui: 4px` (Tailwind `rounded-ui`). Every surface and control uses it: cards, plates and
screenshots, panels, buttons, inputs, segmented controls and their highlights, code chips, the terminal block,
focus rings. No other radius value exists in the codebase (`rounded-sm/md/lg`, `rounded-[Npx]` and per-component
tokens are not allowed). Data marks (chart bars) and rules are square. Circles only for genuinely round things:
avatars and dots in drawings, the terminal's three title-bar dots, a progress knob.

## States
Hover: one step stronger tint (line → fg-3, tile → line). Focus: 2px accent outline, 3px offset, on every interactive element. Pressed: scale 0.97. Disabled: 50% opacity.

## Never
Hard-coded hex in components (exception: none; the old macOS traffic-light colours are gone), opacity stacks to fake new colours, the accent on more than one element per component.
