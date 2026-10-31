import { code, list, note, p, steps, table, term, warn, type DocPage } from "../types";

export const gettingStarted: DocPage = {
  slug: "getting-started",
  group: "start",
  title: "Getting started",
  summary: "Everything the bots have in common: what to install, creating the Discord bot, the .env file, and the first start.",
  lead: "From a downloaded zip to a bot answering in your server. Every bot follows these steps; its own guide adds the parts that differ.",
  sections: [
    {
      id: "how-it-works",
      label: "Overview",
      title: "How the bots work",
      blocks: [
        p("Each LuniBot bot is a Node.js program that **runs on your own computer or server**. You download its source code, give it a bot token from Discord, start it, and invite it to your server. Nothing runs on our machines for you: there is no account to create and nothing to pay for."),
        p("Discord connects your running copy to your server. While the program runs, the bot is online; when you stop it, the bot goes offline. To keep a bot online all the time, run it on a machine that stays on (see [Running 24/7](/docs/hosting))."),
        table(
          ["Bot", "What it does", "Extra things it needs"],
          [
            ["[Modmail](/docs/modmail)", "Turns DMs to the bot into staff ticket threads", "Two channels and a staff role"],
            ["[DiscMeet](/docs/discmeet)", "Records voice meetings and writes notes", "An OpenAI API key (paid by usage)"],
            ["[Music Bot](/docs/music-bot)", "Plays music from YouTube, SoundCloud, Spotify links and more", "Python 3.10+ (it installs yt-dlp itself)"],
            ["[Guard](/docs/guard)", "Stops nukes and raids, backs up and restores the server", "Administrator permission; not released yet"],
          ],
          [],
        ),
      ],
    },
    {
      id: "requirements",
      label: "Install",
      title: "What to install",
      blocks: [
        p("All bots need **Node.js 22.12 or newer** and npm, which comes with Node. Version 22.12 is the minimum because Discord's voice encryption library requires it, and the bots share one baseline. The current LTS, Node 24, is recommended."),
        steps(
          "Download Node.js from [nodejs.org](https://nodejs.org) (the LTS button) and install it.",
          "Open a terminal: Terminal on macOS, PowerShell or Command Prompt on Windows, your usual shell on Linux.",
          "Check the versions. `node -v` must print v22.12 or higher.",
        ),
        term([["node -v", "v22.12.0 or newer"], ["npm -v"]]),
        p("Some bots use `better-sqlite3`, a database library with a native part. npm normally downloads a ready-made copy. If the install stops with a compile error, install the build tools for your system and run the install again:"),
        table(
          ["System", "Build tools"],
          [
            ["macOS", "`xcode-select --install`"],
            ["Windows", "Visual Studio Build Tools with “Desktop development with C++”, plus Python 3"],
            ["Debian, Ubuntu", "`sudo apt install build-essential python3`"],
          ],
          [],
        ),
        p("A text editor helps for the `.env` file. Any editor works; VS Code shows hidden files such as `.env` without extra steps."),
      ],
    },
    {
      id: "download",
      label: "Download",
      title: "Download and check the zip",
      blocks: [
        p("Download the zip from the bot's page on this site and unpack it. Each zip holds one folder named after the bot and its version, for example `modmail-1.0.2`. It contains source code, a `README.md`, a `SETUP.txt` guide, the `LICENSE`, and a `.env.example`. There are no installers, no compiled programs and no secrets."),
        p("Each bot page shows the zip's **SHA-256 checksum**. Compare it with the file you downloaded before you run anything. If the two differ, don't run the bot, and tell us in the Discord."),
        term([["shasum -a 256 modmail-1.0.2.zip", "macOS and Linux"], ["certutil -hashfile modmail-1.0.2.zip SHA256", "Windows"]], "Check a download"),
        p("Then open a terminal inside the unpacked folder, the one that holds `package.json`. Every command in these guides runs from there."),
        term([["cd modmail-1.0.2"]]),
      ],
    },
    {
      id: "application",
      label: "Discord",
      title: "Create the Discord bot",
      blocks: [
        p("Each bot you run needs its own Discord application and token. You create them once in the Discord Developer Portal."),
        steps(
          "Go to [discord.com/developers/applications](https://discord.com/developers/applications) and choose **New Application**. Give it the name you want members to see.",
          "Optional: on **General Information**, set an avatar and a description. Copy the **Application ID** if the bot's guide asks for it.",
          "Open the **Bot** tab and choose **Reset Token**. Copy the token: it is shown once. This is `DISCORD_TOKEN`.",
          "Still on the **Bot** tab, turn on the privileged intents the bot needs (table below) and choose **Save Changes**.",
          "Turn off **Public Bot** if you don't want anyone else adding your copy to their server.",
        ),
        warn("The token is the bot's password. Anyone who has it controls the bot. Never post it, commit it, put it in a screenshot or send it to anyone who asks. If it leaks, choose **Reset Token** at once; the old one stops working."),
        table(
          ["Bot", "Server Members intent", "Message Content intent"],
          [
            ["Modmail", "Required", "Required"],
            ["DiscMeet", "Not needed", "Not needed"],
            ["Music Bot", "Not needed", "Optional (only for the music channel)"],
            ["Guard", "Required", "Required"],
          ],
          [],
        ),
        p("If a required intent is off, the bot stops at login with an error such as “Used disallowed intents”."),
      ],
    },
    {
      id: "invite",
      label: "Invite",
      title: "Invite the bot to your server",
      blocks: [
        p("You need the **Manage Server** permission on the server. In the Developer Portal open **OAuth2 → URL Generator**:"),
        steps(
          "Under **Scopes**, tick `bot` and `applications.commands`. Without the second one, slash commands never appear.",
          "Under **Bot Permissions**, tick the permissions from the bot's guide.",
          "Copy the generated URL at the bottom, open it in a browser, choose your server and authorise.",
        ),
        table(
          ["Bot", "Permissions to tick"],
          [
            ["Modmail", "View Channels, Send Messages, Send Messages in Threads, Create Public Threads, Manage Threads, Embed Links, Attach Files, Read Message History, Add Reactions"],
            ["DiscMeet", "View Channels, Send Messages, Embed Links, Attach Files, Read Message History, Connect, Speak, Pin Messages, Set Voice Channel Status"],
            ["Music Bot", "View Channels, Send Messages, Embed Links, Read Message History, Add Reactions, Connect, Speak (permission integer `3230784`)"],
            ["Guard", "Administrator"],
          ],
          [],
        ),
        p("Channel permissions can override these. If a channel is private, give the bot's role access to it as well."),
      ],
    },
    {
      id: "ids",
      label: "IDs",
      title: "Copy IDs from Discord",
      blocks: [
        p("Some bots need the ID of your server, a channel or a role. IDs are long numbers, and Discord only shows them in **Developer Mode**."),
        steps(
          "In Discord, open **User Settings → Advanced** and turn on **Developer Mode**.",
          "Right-click the server icon and choose **Copy Server ID**.",
          "Right-click a channel and choose **Copy Channel ID**.",
          "For a role: **Server Settings → Roles**, right-click the role, **Copy Role ID**.",
        ),
      ],
    },
    {
      id: "env",
      label: "Settings",
      title: "The .env file",
      blocks: [
        p("Each bot reads its token and settings from a file called `.env` in its folder. The zip ships an example with every setting explained; copy it and fill it in."),
        term([["cp .env.example .env", "macOS and Linux"], ["copy .env.example .env", "Windows Command Prompt"]]),
        p("Names starting with a dot are hidden by default. In Finder press `Cmd+Shift+.`, on Linux `Ctrl+H`, and in a terminal use `ls -a`."),
        code(".env", `
DISCORD_TOKEN=MTI3NjQ...your-token-here
GUILD_ID=123456789012345678
`),
        list(
          "One setting per line, `NAME=value`.",
          "No quotes and no spaces around `=`.",
          "Leave optional settings empty to use their default.",
          "Lines starting with `#` are comments.",
          "Never share `.env`, never commit it to git and never put it in a zip you send. The bots' `.gitignore` already excludes it.",
        ),
      ],
    },
    {
      id: "start",
      label: "Start",
      title: "Install and start",
      blocks: [
        p("From the bot's folder, install its dependencies once, then start it:"),
        term([["npm ci", "installs exactly the versions in package-lock.json"], ["npm start"]]),
        p("The terminal prints what the bot is doing. Each bot ends its startup with a line confirming it logged in, followed by a credit line. Leave the terminal open: closing it stops the bot. Press `Ctrl+C` to stop it on purpose."),
        p("`npm run dev` starts the bot in a mode that restarts it whenever you change a file, which is handy when you edit the code."),
        table(
          ["Bot", "How slash commands are registered"],
          [
            ["Modmail", "In your server (`GUILD_ID`) on every start. They appear at once."],
            ["DiscMeet", "Globally, with `npm run deploy`. Run it once, and again after changing a command's options. Can take up to an hour to show."],
            ["Music Bot", "On every start. Globally by default; set `DEV_GUILD_ID` to register them instantly in one server."],
            ["Guard", "In every server it is in, on every start and when it joins. They appear at once."],
          ],
          [],
        ),
        note("If commands don't appear, press `Ctrl+R` in Discord to reload it, check that the invite included `applications.commands`, and read the bot's startup output for an error."),
      ],
    },
    {
      id: "next",
      label: "Next",
      title: "Where to go next",
      blocks: [
        list(
          "Follow the guide for your bot: [Modmail](/docs/modmail), [DiscMeet](/docs/discmeet), [Music Bot](/docs/music-bot) or [Guard](/docs/guard).",
          "Keep it online: [Running 24/7](/docs/hosting).",
          "Know what is stored and where: [Tokens, keys and your data](/docs/safety).",
          "Something went wrong: [Troubleshooting](/docs/troubleshooting).",
        ),
        p("Each zip also contains `SETUP.txt`, a plain-text version of its guide that works offline, with a section on changing the code."),
      ],
    },
  ],
};
