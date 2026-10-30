# Anti-patterns (hard bans)

Re-read before every UI change. If a change needs one of these, the change is wrong.

| Ban | Instead |
|---|---|
| Gradients as colour (backgrounds, text, buttons) | Flat tokens. (CSS gradient functions may only *draw hairlines* or *mask* a texture so it fades out.) |
| Glow, bloom, neon, outer glows | Nothing. The accent is flat. |
| Glassmorphism, backdrop blur | Solid paper with a hairline. |
| Drop shadows for depth | Hairline borders; depth comes from layering and parallax. |
| Rounded-everything, radii > 4px on surfaces | 0–4px. Only genuinely round things are circles (avatars, dots, the progress knob). |
| Floating pill navs, pill-shaped buttons | Rectangular 4px controls; nav active state is a hairline underline. |
| Emoji as icons | Drawn SVG marks and glyphs. |
| Stock illustrations, third-party icon sets | Marks in `public/marks/`, drawn to the grid. |
| 3D mascots, chrome/plastic/rainbow 3D, default lit sample scenes | Technical-drawing 3D: paper faces, ink edges, one accent part. |
| Badge clutter (tags, chips, "NEW" pills everywhere) | One quiet metadata line in mono or small grey. |
| Centred-everything | Left-aligned on the grid. Centring only for a single short element inside its own box. |
| Brand colours from other products in the UI (macOS traffic lights, Discord blurple) | Neutral tints. |
| AI-sounding copy: "seamless", "unleash", "elevate", "powerful", "robust", "effortless", "cutting-edge", "dive in", "game-changer", "Whether you're…", em-dash pile-ups, rhetorical questions as headings | Plain, specific sentences that say what happens. |
| Using another company's logo as decoration (e.g. Discord's) | Our own marks; mention Discord by name only. |
| Moon clichés: glowing moons, glowing or coloured stars, night-sky gradients, nebulae, moon emoji or illustrations | The hairline moon: outline plus one flat lit shape, drawn exactly; the one starfield (`Starfield.tsx`): flat ink dots, hairline rays, gentle opacity twinkle |
| Horoscope and fantasy: zodiac signs, astrology copy, "mystical"/"cosmic" wording, runes, glowing orbs, phases assigned without a stated reason | Facts: real phase maths, day numbers, a plain reason for each bot's phase |
