import { h, list, note, p, steps, table, warn, type DocPage } from "../types";

export const safety: DocPage = {
  slug: "safety",
  group: "start",
  title: "Tokens, keys and your data",
  summary: "Keeping the bot token and API keys safe, what each bot stores on your machine, and what leaves it.",
  lead: "Running a bot yourself means you hold its keys and its data. Here is what to protect, what each bot keeps, and what it sends elsewhere.",
  sections: [
    {
      id: "secrets",
      label: "Secrets",
      title: "Protect the token and keys",
      blocks: [
        p("A bot token gives full control of the bot, and the bot can do whatever its permissions allow in your server. An API key, such as DiscMeet's OpenAI key, can run up a bill. Treat both like passwords."),
        list(
          "Keep them only in `.env` or in your host's secret settings.",
          "Never paste them in Discord, in a support request, in a screenshot or in a git repository.",
          "Nobody from LuniBot will ever ask for them.",
          "Give each bot its own token. If one leaks, only that bot is affected.",
        ),
        h("If a token or key leaks"),
        steps(
          "Developer Portal → your application → **Bot** → **Reset Token**. The leaked token stops working at once.",
          "Put the new token in `.env` and restart the bot.",
          "For an OpenAI key: delete it at [platform.openai.com/api-keys](https://platform.openai.com/api-keys), create a new one and check your usage page.",
          "Check your server's audit log for anything the bot did that you didn't expect.",
        ),
      ],
    },
    {
      id: "account",
      label: "Account",
      title: "Secure your Discord account",
      blocks: [
        p("Whoever controls the Developer Portal account can reset the token and take the bot over, so the account itself needs protecting."),
        list(
          "Turn on two-factor authentication: **User Settings → My Account**.",
          "In your server, turn on **Server Settings → Safety Setup → Require 2FA for moderator actions**. Stolen staff accounts are the most common way servers get nuked.",
          "Give each bot only the permissions its guide lists. Guard is the exception: it needs Administrator to protect the server.",
          "Turn off **Public Bot** in the Developer Portal so strangers cannot add your copy to their servers.",
        ),
      ],
    },
    {
      id: "stored",
      label: "Storage",
      title: "What each bot stores",
      blocks: [
        p("Everything a bot stores stays in its own folder on your machine. Nothing is uploaded to LuniBot."),
        table(
          ["Bot", "Stored on your machine"],
          [
            ["Modmail", "Every ticket message in both directions, snippets, settings and HTML transcripts (`data/`, `transcripts/`)"],
            ["DiscMeet", "Audio while a meeting is processed (`recordings/`), the last session for `/resummarize` (`cache/`), notes (`notes/`), expenses (`data/expenses.json`)"],
            ["Music Bot", "Server settings, saved playlists, play history, a lyrics cache and each user's lyrics offset (`data/bot.sqlite`). Audio is streamed and never written to disk"],
            ["Guard", "Settings, incidents, server backups (roles, channels, member roles, bans), the last 50 messages of each channel, and optionally attachments (`data/`)"],
          ],
          [],
        ),
        p("Tell your members what is kept. Modmail members should know staff read their DMs to the bot; Guard servers should know recent messages are stored for restoring channels."),
      ],
    },
    {
      id: "external",
      label: "Network",
      title: "What leaves your machine",
      blocks: [
        table(
          ["Bot", "Sends data to", "What"],
          [
            ["Modmail", "Discord only", "Nothing else"],
            ["DiscMeet", "OpenAI", "Meeting audio for transcription, and the transcript text for the notes. Check OpenAI's data policy before recording sensitive meetings"],
            ["Music Bot", "The music sites you play from", "Search text and links go to YouTube, SoundCloud and the other sources; song titles go to the lyrics providers (LRCLIB, plus Musixmatch and Genius if you add keys); Spotify links are read from Spotify"],
            ["Guard", "GitHub, Discord", "Downloads a public list of phishing domains every 6 hours, and looks up invite codes posted in your server to see where they lead"],
          ],
          [],
        ),
        warn("DiscMeet records voice. Tell everyone in the channel before you run `/join` and get their agreement. Recording laws differ between countries and states."),
      ],
    },
    {
      id: "sharing",
      label: "Sharing",
      title: "Sharing your setup",
      blocks: [
        p("If you share your copy of a bot, for help or a fork, leave these out:"),
        list(
          "`.env` and any file with a token or key in it.",
          "Data folders: `data/`, `transcripts/`, `recordings/`, `notes/`, `cache/`.",
          "Music Bot's `secrets/` folder, which holds YouTube cookies.",
          "Guard backup exports: they contain your member list and ban list.",
        ),
        note("The bots are GPL-3.0. You may change and share them; a shared changed version must stay GPL-3.0 with its source available. Details on the [About page](/about#licensing)."),
      ],
    },
  ],
};

