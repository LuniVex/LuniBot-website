# Typography

## Faces
San Francisco on Apple devices, self-hosted Inter Variable elsewhere (`--font-sans`); `--font-mono` for anything a machine reads or counts: commands, file names, checksums, index numbers, metadata labels, chart labels.

## One scale (classes in `app/globals.css`)
| Class | Size | Leading | Use |
|---|---|---|---|
| `t-hero` | clamp(44px → 80px) | 1.05 | one per page, the H1 |
| `t-section` | clamp(36px → 56px) | 1.07 | section titles, featured bot name |
| `t-tile` | clamp(28px → 40px) | 1.1 | card titles |
| `t-lead` | clamp(19px → 28px) | 1.3 | intros, taglines on large cards, descriptions |
| `t-h3` | 21px | 1.25 | panel headings |
| `t-body-lg` | 19px | 1.45 | card taglines, about text |
| body | 17px | 1.47 | default |
| `t-small` | 14px | 1.43 | metadata, captions |
| `t-tiny` | 12px | 1.33 | chart labels, terminal title |
| `t-figure` | 40px | 1 | big numbers in stats |
| `t-mono` | 14px mono | 1.5 | commands, file names, code |
| `t-control` / `t-control-lg` | 15px / 17px | 1.33 / 1.3 | text inside buttons, inputs and segmented controls |
Nothing outside this table; no ad hoc `text-[NNpx]` in components.

## Rules
- Headings tight (1.05–1.1), body comfortable (1.43–1.47). Never stack two leadings in one block.
- Line length: body and lead 45–75 characters (`max-w-[60ch]` body, `max-w-[38ch]` lead, `max-w-[30ch]` card taglines).
- No orphans: headings use `text-wrap: balance`, paragraphs `text-wrap: pretty`; product names and versions never break (`GPL‑3.0` uses a non-breaking hyphen in running copy).
- Numbers that change or compare are `tabular-nums`.
- Sentence case everywhere. No all-caps except the 3-letter UTC/SHA style abbreviations.
