import { list, p, qa, term, type DocPage } from "../types";

export const troubleshooting: DocPage = {
  slug: "troubleshooting",
  group: "help",
  title: "Troubleshooting",
  summary: "Fixes for the problems all the bots share: installing, logging in, commands, permissions, voice and settings.",
  lead: "Most problems are one of a handful, and they look the same in every bot. Find the message you see; each bot's guide lists its own extra cases.",
  sections: [
    {
      id: "first",
      label: "First",
      title: "Before anything else",
      blocks: [
        list(
          "**Read the bot's output.** The terminal (or `pm2 logs`, or `docker compose logs`) almost always names the problem.",
          "**Check the Node version** with `node -v`. It must be 22.12 or newer.",
          "**Check you're in the right folder**, the one with `package.json`.",
          "**Restart after every change** to `.env`; it is only read on start.",
          "**Run one copy per token.** A second copy, perhaps forgotten in another terminal or under pm2, makes both misbehave.",
        ),
      ],
    },
    {
      id: "install",
      label: "Install",
      title: "Installing",
      blocks: [
        qa([
          ["“npm: command not found” or “node is not recognized”", "Node.js isn't installed or the terminal was opened before installing it. Install from nodejs.org and open a new terminal."],
          ["“npm ERR! engine” or “Unsupported engine”", "Your Node is older than 22.12. Install the current LTS, delete `node_modules`, and run `npm ci` again."],
          ["A compile error mentioning better-sqlite3 or node-gyp", "Install the build tools for your system ([Getting started](/docs/getting-started#requirements)) and run `npm ci` again, or use Docker."],
          ["“EACCES” or permission errors", "Don't use `sudo npm`. Make sure your user owns the bot's folder. On Linux and macOS: `sudo chown -R $(whoami) .` inside it."],
          ["`npm ci` says there is no package-lock.json", "You're in the wrong folder. `cd` into the one that contains `package.json`."],
        ]),
        term([["rm -rf node_modules"], ["npm ci"]], "Clean reinstall"),
      ],
    },
    {
      id: "login",
      label: "Login",
      title: "Starting and logging in",
      blocks: [
        qa([
          ["“An invalid token was provided” or TokenInvalid", "The token in `.env` is empty, has quotes or spaces, or was reset. Copy a fresh one from the Developer Portal (Bot tab → Reset Token)."],
          ["“Used disallowed intents”", "The bot needs a privileged intent that is off. Turn on Server Members and/or Message Content on the Bot tab, save, and restart. The bot's guide says which."],
          ["The bot starts, then stops with a missing-setting error", "A required value in `.env` is empty. The message names it."],
          ["`.env` seems to be ignored", "It must be named exactly `.env` (not `.env.txt`; Windows may hide the extension) and sit in the bot's folder. Real environment variables override it."],
          ["“EADDRINUSE” or port already in use", "Another program uses the port. For Music Bot set `HEALTH_PORT` to another number."],
        ]),
      ],
    },
    {
      id: "commands",
      label: "Commands",
      title: "Slash commands",
      blocks: [
        qa([
          ["Commands don't appear at all", "The invite must include the `applications.commands` scope. Re-invite with it; you don't need to remove the bot first."],
          ["Commands appear in one server but not another", "Modmail registers only in `GUILD_ID`. Music Bot with `DEV_GUILD_ID` registers only there. Clear it for global commands."],
          ["Commands take a long time to appear", "Global commands (DiscMeet, Music Bot without `DEV_GUILD_ID`) can take up to an hour the first time. Press `Ctrl+R` in Discord to reload."],
          ["Old or duplicate commands", "Reload Discord. If they persist, an old copy of the bot registered them; restart the current one so it registers its own set."],
          ["“The application did not respond”", "The bot is offline, crashed while handling the command, or took longer than 3 seconds. Check its output."],
        ]),
      ],
    },
    {
      id: "permissions",
      label: "Access",
      title: "Permissions",
      blocks: [
        qa([
          ["“Missing Access”", "The bot can't see the channel. Give its role View Channel there; private channels and categories override server-wide permissions."],
          ["“Missing Permissions”", "The bot can see the channel but lacks a permission for the action (sending, creating threads, managing roles…). Compare with the list in the bot's guide."],
          ["It can't manage a role or member", "Bots can only act on roles below their own highest role. Move the bot's role higher in Server Settings → Roles."],
          ["Members can use commands they shouldn't", "Restrict commands per role or channel in Server Settings → Integrations → your bot."],
        ]),
      ],
    },
    {
      id: "voice",
      label: "Voice",
      title: "Voice (DiscMeet and Music Bot)",
      blocks: [
        qa([
          ["It joins but nothing is heard or recorded", "Voice uses outbound UDP. Some hosts, firewalls and corporate networks block it. Try another network or host. Also check the bot isn't server-muted or deafened."],
          ["It can't join a channel", "Give it View Channel, Connect and Speak in that channel, and check the channel isn't full."],
          ["Voice errors right after joining", "Usually an old Node or an outdated voice library. Use Node 22.12+, and update to the latest bot version: Discord has required end-to-end voice encryption since March 2026."],
        ]),
      ],
    },
    {
      id: "help",
      label: "Help",
      title: "Still stuck",
      blocks: [
        p("Ask in the Discord. To get an answer quickly, include:"),
        list(
          "The bot and its version (from the zip name or `package.json`).",
          "Your operating system and `node -v`.",
          "The exact error from the output, with the lines around it.",
          "What you did just before it happened.",
        ),
        p("Leave out your token, API keys, `.env` and anything from the `data/` folder. Nobody needs them to help you."),
      ],
    },
  ],
};
