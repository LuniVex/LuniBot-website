import { code, list, note, p, steps, table, term, warn, type DocPage } from "../types";

export const hosting: DocPage = {
  slug: "hosting",
  group: "start",
  title: "Running 24/7",
  summary: "Keep a bot online: where to run it, pm2, Docker, systemd, updating to a new version and backing up its data.",
  lead: "A bot is online only while its program runs. These are the ways to keep it running, update it, and keep its data safe.",
  sections: [
    {
      id: "where",
      label: "Where",
      title: "Where to run a bot",
      blocks: [
        p("Any machine that stays on and has Node.js 22.12 or newer can run the bots. The choice is mostly about cost and how often the machine is switched off."),
        table(
          ["Option", "Good for", "Watch out for"],
          [
            ["Your own computer", "Trying a bot out", "The bot goes offline when the computer sleeps or shuts down"],
            ["A home server or Raspberry Pi", "Cheap, always-on hosting; the best option for Music Bot", "Use a 64-bit OS; Node 22 needs an ARMv8 board (Pi 3 or newer)"],
            ["A VPS (cloud server)", "Reliable uptime", "YouTube often blocks cloud IPs, so Music Bot may need cookies"],
            ["A platform host (Railway, Fly.io, Heroku…)", "No server to look after", "Data folders must live on a persistent volume, or they are wiped on every restart"],
          ],
          [],
        ),
        p("Rough resource use: Modmail, DiscMeet and Guard each need well under 200 MB of memory. Music Bot needs about 120 MB plus 20 to 40 MB for each server that is playing music."),
        note("Run **one copy per token**. Two copies with the same token fight over every event and both misbehave."),
      ],
    },
    {
      id: "pm2",
      label: "pm2",
      title: "Keep it running with pm2",
      blocks: [
        p("pm2 is a small process manager for Node.js. It restarts the bot if it crashes and starts it again when the machine reboots. It works on macOS, Linux and Windows."),
        term([
          ["npm install -g pm2"],
          ["pm2 start src/index.js --name modmail", "from the bot's folder"],
          ["pm2 save", "remember the running bots"],
          ["pm2 startup", "then run the command it prints"],
        ], "Set up pm2"),
        table(
          ["Command", "What it does"],
          [
            ["`pm2 list`", "Running bots and their status"],
            ["`pm2 logs modmail`", "Live output of one bot"],
            ["`pm2 restart modmail`", "Restart after changing `.env` or updating"],
            ["`pm2 stop modmail`", "Stop it (it stays stopped after a reboot only if you `pm2 save` again)"],
          ],
          [],
        ),
        p("Use a different `--name` for each bot. Several bots can run on one machine, each from its own folder with its own token."),
      ],
    },
    {
      id: "docker",
      label: "Docker",
      title: "Run it with Docker",
      blocks: [
        p("Modmail, Music Bot and Guard include a `Dockerfile` and a `docker-compose.yml`. Docker bundles the right Node version and the build tools, so nothing else needs installing. DiscMeet has no Docker files; use pm2 for it."),
        term([
          ["docker compose up -d --build", "build and start in the background"],
          ["docker compose logs -f", "follow the output"],
          ["docker compose restart", "restart, e.g. after changing .env"],
          ["docker compose down", "stop"],
        ]),
        table(
          ["Bot", "Where its data is kept"],
          [
            ["Modmail", "`./data` (database) and `./transcripts`, mounted into the container"],
            ["Music Bot", "The `bot-data` Docker volume. Its health check is on `127.0.0.1:8080/healthz`"],
            ["Guard", "`./data` (database, backups, saved attachments)"],
          ],
          [],
        ),
        p("The container reads `.env` from the bot's folder, so create it first, exactly as for a normal start."),
      ],
    },
    {
      id: "systemd",
      label: "systemd",
      title: "Run it as a Linux service",
      blocks: [
        p("On a Linux server you can skip pm2 and let systemd keep the bot running. Create a service file, adjusting the user and paths:"),
        code("/etc/systemd/system/modmail.service", `
[Unit]
Description=Modmail Discord bot
After=network-online.target
Wants=network-online.target

[Service]
User=bots
WorkingDirectory=/home/bots/modmail-1.0.2
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
`),
        term([
          ["sudo systemctl daemon-reload"],
          ["sudo systemctl enable --now modmail", "start now and at every boot"],
          ["journalctl -u modmail -f", "follow the output"],
        ]),
        p("`.env` is read from the working directory, so keep it in the bot's folder."),
      ],
    },
    {
      id: "platforms",
      label: "Platforms",
      title: "Platform hosts",
      blocks: [
        p("Hosts that run a program from a git repository or a folder work too. Three things matter:"),
        list(
          "**Start command:** `node src/index.js`. Music Bot ships a `Procfile` (`worker: node src/index.js`) for hosts that read one. Run it as a worker, not a web service: the bots don't serve web pages.",
          "**Settings:** put each `.env` value into the host's environment variables or config vars instead of uploading `.env`. Real environment variables take priority over the file.",
          "**Storage:** attach a persistent volume and point the bot's data path at it (`DATABASE_PATH`, or `DATA_DIR` for Music Bot and Guard). DiscMeet writes its folders next to its code, so mount the volume at `data/`. Without a volume, tickets, playlists, settings and backups disappear on every restart or deploy.",
        ),
        p("Voice bots (DiscMeet, Music Bot) need outbound UDP for audio. Some hosts block it; the bot then joins the channel but nobody hears anything."),
      ],
    },
    {
      id: "updating",
      label: "Updating",
      title: "Update to a new version",
      blocks: [
        p("A new version comes as a new zip. Your settings and data live outside the code, so updating is a matter of moving them across."),
        steps(
          "Stop the bot (`pm2 stop`, `docker compose down`, or `Ctrl+C`).",
          "Back up its data folder (next section).",
          "Download and check the new zip, and unpack it next to the old folder.",
          "Copy `.env` and the data folders from the old folder into the new one.",
          "Compare the new `.env.example` with your `.env` and add any new settings.",
          "In the new folder run `npm ci`, then start the bot from there (with pm2, delete the old process and start the new path).",
          "When it has run well for a while, delete the old folder.",
        ),
        p("Databases are upgraded automatically on start. Keep the backup until you're sure the new version works."),
      ],
    },
    {
      id: "backups",
      label: "Backups",
      title: "Back up a bot's data",
      blocks: [
        table(
          ["Bot", "Back up", "Holds"],
          [
            ["Modmail", "`data/modmail.db*`, `transcripts/`", "Tickets, messages, snippets, settings, transcripts"],
            ["DiscMeet", "`data/expenses.json`, `notes/`", "Expenses and generated notes. `recordings/` and `cache/` are temporary"],
            ["Music Bot", "`data/bot.sqlite*`", "Server settings, playlists, history, lyrics cache. `.venv-ytdlp/` is rebuilt on start"],
            ["Guard", "the whole `data/` folder", "Settings, incidents, server backups and their images, stored messages"],
          ],
          [0],
        ),
        p("SQLite databases have two companion files while the bot runs (`-wal` and `-shm`). Stop the bot before copying, or copy all three files together."),
        warn("These folders hold private messages, member lists and ban lists. Keep backups somewhere only you can read, and never commit them to git."),
      ],
    },
  ],
};
