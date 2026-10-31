/**
 * App-style icon for each bot: a rounded square in the bot's colour with its logo drawn in white.
 * Logos are solid shapes drawn on a 24-unit grid, so they stay crisp and readable at every size.
 * Driven by the `icon` field in bots.json; unknown names fall back to the bot's first letter.
 */
const icons: Record<string, { color: string; glyph: (tile: string) => React.ReactNode }> = {
  // Modmail: a chat bubble with an envelope fold cut into it (Discord DMs that become support mail).
  "mail-bubble": {
    color: "#1f6feb",
    glyph: (tile) => (
      <>
        <path fill="currentColor" d="M6.5 4.5h11a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6.2l-4.1 3.1c-.5.4-1.2 0-1.2-.6v-2.5h.5a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3z" />
        <path d="m7.2 8.6 4.8 3.6 4.8-3.6" stroke={tile} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    ),
  },
  // DiscMeet: voice bars turning into lines of text (a recorded meeting becoming notes).
  "voice-notes": {
    color: "#e8590c",
    glyph: () => (
      <>
        <g fill="currentColor">
          <rect x="3.4" y="9.25" width="2.1" height="5.5" rx="1.05" />
          <rect x="6.7" y="6" width="2.1" height="12" rx="1.05" />
          <rect x="10" y="8" width="2.1" height="8" rx="1.05" />
        </g>
        <path d="M15.2 8.2h5.4M15.2 12h5.4M15.2 15.8h3.4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      </>
    ),
  },
  // Music Bot: a pair of beamed notes beside lines of lyrics (songs with synced lyrics).
  "music-lyrics": {
    color: "#7c3aed",
    glyph: () => (
      <>
        <path fill="currentColor" d="M5.4 6.4 13.2 4.7c.6-.1 1.1.3 1.1.9v9.3a2.6 2.6 0 1 1-1.8-2.5V8.4L7.2 9.6v7.1a2.6 2.6 0 1 1-1.8-2.5V7.3c0-.4.3-.8.7-.9z" />
        <path d="M16.9 8.2h3.7M16.9 12h3.7M16.9 15.8h2.3" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      </>
    ),
  },
  // Guard: a shield with a keyhole cut into it (a server kept locked against nukes).
  shield: {
    color: "#0f766e",
    glyph: (tile) => (
      <>
        <path fill="currentColor" d="M12 2.8 19.5 5.4v5.6c0 4.6-3.1 7.9-7.5 9.9-4.4-2-7.5-5.3-7.5-9.9V5.4z" />
        <path fill={tile} d="M12 7.6a1.9 1.9 0 0 1 .95 3.55V14h-1.9v-2.85A1.9 1.9 0 0 1 12 7.6z" />
      </>
    ),
  },
};

/** The bot's colour, for accents that should match its icon. */
export const iconColor = (icon: string) => icons[icon]?.color ?? "#6e6e73";

/** The logo's SVG contents (24×24 viewBox), or null for an unknown icon. Also used by the link-preview images. */
export const iconGlyph = (icon: string) => icons[icon]?.glyph(iconColor(icon)) ?? null;
