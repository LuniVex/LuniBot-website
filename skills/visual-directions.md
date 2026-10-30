# Visual directions

**The rule the site obeys:** _Ink on paper with one blue accent, held together by 1px hairlines on one shared grid, with generous empty space, under one quiet moon; anything else (motion, texture, 3D) must earn its place by explaining something._

## The language
- **Monochrome + one accent.** Two neutrals (paper, ink) and their tints, plus the blue accent. The accent marks the one thing that matters in a view: today's bar, the current line, a required argument, the primary button. Never more than one accent idea per component.
- **Hairline structure.** Sections, lists, tables and frames are divided by 1px rules in the line tint. Rules carry the architecture; surfaces (tinted tiles) are used sparingly, for things you can act on.
- **Negative space is a material.** Sections breathe (96px between them on desktop). Never fill space just because it is empty.
- **One grid.** Everything starts on the page edge or on the body column (see `layout-grid.md`). Nothing floats.
- **3D is a focal object, not decoration.** At most one 3D object in view at a time. It is drawn like a technical drawing: paper-coloured faces, ink hairline edges, one accent part. It moves only with scroll, explains the thing beside it, and has a static SVG twin.
- **Texture is barely there.** A 48px hairline grid or a dot field at 2–4% contrast, behind content, never on top. If it reads as noise, remove it.
- **Marks, not icons.** Bot identities are drawn on a 48-unit grid with the same hairline stroke and one solid accent shape (`public/marks/`).

## The system: LuniVex's moon
LuniVex (luna) is the moon, and the moon is the organising idea of the whole site, not a section: every page
reads as one astronomical drawing (phase cycle, orbit, dial, engraving lines) that happens to contain bots.
It always uses the same language as everything else: a hairline disc, its lit part as one flat shape,
drawn exactly from real phase maths (`lib/moon.ts`), nothing else.
- **A page is half a lunation.** It opens on a young crescent (`OPENING`) and each numbered section is a
  *moment* one equal step further (`momentPhase`), so the last section is the full moon. Section heads carry
  their phase glyph and day ("D08 · Quarter"); the background moon follows the moments.
- **Boundaries are terminator crossings:** the rule draws in and the glyph sweeps to its phase, scrubbed by
  scroll and reversible. Never a fade.
- **Mark:** the LuniVex crescent (`components/Moon.tsx`) beside the name in the header and footer, on the
  theme toggle, and as the favicon.
- **Background:** one moon behind every page with hairline orbits and a 30-tick lunar dial. It waxes from a
  crescent at the top of a page to full at the bottom, drawn exactly with `phasePath` and edged with a
  hairline. Dark mode: the lit side is the faintest tint (`bg-alt`, below the cards' `tile`). Light mode is an
  engraving: the lit side is paper and the unlit side takes the tint. The dial's ticks stand on their own
  hairline circle; its one longer ink tick is tonight's real phase. The background never uses the accent.
- **Cursor:** no object follows the pointer. Inside a soft round window around it, the same orbits, dial
  and moon are traced again in a stronger tint, so the drawing comes into focus where you look.
- **Engraving:** fine 45° hatch (`.hatch`) shades what is unlit or set back: the moon's dark side, card
  stages, and the linework revealed under the cursor. Light theme = an engraved plate; dark theme = night
  sky, where the hatch all but disappears. Always hairline, never a busy pattern.
- **Bot phases:** each bot has a phase (data/bots.json `lunar`) by one rule: how much of its work stays on
  your own machine (full: all of it; new: not released). Shown as a badge; the bot page gives the reason.
- **Night sky:** behind the moon, a starfield (`components/Starfield.tsx`): flat ink dots at three depths that
  drift with scroll, lean to the pointer and twinkle gently, a few bright stars with hairline rays, faint
  star-chart lines between them. Dark theme: a starry night. Light theme: the same sky as a printed star chart.
- **One diagram:** mark, favicon and theme toggle are the same moon + orbit + index tick.
- **Fact, not flavour:** the footer shows tonight's actual phase. Phases are drawn exactly
  (`phasePath`); lunation times come from Meeus. If a detail reads like a horoscope or a fantasy game, cut it.

## Checklist before shipping a view
1. Can you name the single accent element? If there are two, remove one.
2. Does every left edge land on the page edge or the body column?
3. Is there a rule between sections, and the same gap above every rule?
4. Would the view still read in pure greyscale? (It must.)
5. Is anything there only to look busy? Remove it.
