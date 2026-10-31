import { code, commands, h, list, note, p, qa, steps, table, term, type DocPage } from "../types";

export const modmail: DocPage = {
  slug: "modmail",
  group: "bots",
  bot: "modmail",
  title: "Modmail",
  summary: "Members DM the bot; each conversation becomes a ticket thread that staff reply in, claim and close.",
  lead: "Set up Modmail, learn how a ticket moves from a DM to an archived transcript, and change how it behaves.",
  sections: [
    {
      id: "overview",
      label: "Overview",
      title: "How Modmail works",
      blocks: [
        p("Members send the bot a direct message. Each conversation becomes a **thread in one tickets channel**, where staff talk to the member without sharing their own accounts. Everything the member writes appears in the thread; everything staff write in the thread goes back to the member by DM."),
        steps(
          "A member DMs the bot. The bot asks for a subject: the first line becomes the subject, any further lines the description.",
          "A thread named `[OPEN - UNCLAIMED] ticket-<user id>-a` appears in the tickets channel with an opening summary.",
          "Staff reply by typing in the thread, or with `/reply` to reply anonymously.",
          "A staff member runs `/claim` to show they are handling it. The thread is renamed to `[OPEN - CLAIMED]`.",
          "`/close` ends the ticket. An HTML transcript is posted to the private archive channel and the member is told the ticket is closed.",
        ),
        p("Edits and deletions are relayed both ways, and attachments are passed through. Closed tickets can be found again with `/logs`."),
        note("Modmail serves **one server**: the one in `GUILD_ID`. To run it in a second server, run a second copy with its own token and folder."),
      ],
    },
    {
      id: "prepare",
      label: "Server",
      title: "Prepare your server",
      blocks: [
        p("Before configuring the bot, create these in Discord and copy their IDs ([how](/docs/getting-started#ids)):"),
        table(
          ["What", "Purpose", "Bot needs there"],
          [
            ["Tickets channel", "One text channel where every ticket thread is created. Staff must see it.", "View Channel, Send Messages, Create Public Threads, Send Messages in Threads"],
            ["Archive channel", "A **private** text channel for transcripts.", "View Channel, Send Messages, Attach Files, Embed Links"],
            ["Staff role", "The role allowed to use the staff commands. The server owner always has access.", "—"],
          ],
          [],
        ),
        p("Turn on the **Server Members** and **Message Content** intents in the Developer Portal; both are required. Invite the bot with the permissions listed in [Getting started](/docs/getting-started#invite)."),
      ],
    },
    {
      id: "configure",
      label: "Settings",
      title: "Configure .env",
      blocks: [
        table(
          ["Variable", "Required", "What it is"],
          [
            ["DISCORD_TOKEN", "yes", "The bot token"],
            ["GUILD_ID", "yes", "Your server's ID"],
            ["TICKETS_CHANNEL_ID", "yes", "The tickets channel"],
            ["ARCHIVE_CHANNEL_ID", "yes", "The private archive channel"],
            ["STAFF_ROLE_ID", "yes", "The staff role"],
            ["DATABASE_PATH", "no", "Absolute path to the database file. Default: `data/modmail.db`"],
          ],
        ),
        code(".env", `
DISCORD_TOKEN=your-token
GUILD_ID=123456789012345678
TICKETS_CHANNEL_ID=223456789012345678
ARCHIVE_CHANNEL_ID=323456789012345678
STAFF_ROLE_ID=423456789012345678
DATABASE_PATH=
`),
        note("Modmail does not check `.env` when it starts. A wrong ID shows up later as an error such as “Tickets channel not found. Check TICKETS_CHANNEL_ID in .env.”"),
      ],
    },
    {
      id: "run",
      label: "Run",
      title: "Install and run",
      blocks: [
        term([["npm ci"], ["npm start"]]),
        p("On a successful start the output ends with:"),
        code("Output", `
[Ready] Logged in as Modmail#0000
[Commands] Registering 9 slash command(s)...
[Commands] Slash commands registered successfully.
[Ready] Modmail bot is online and ready.
`),
        p("Commands are registered in your server on every start, so they appear immediately. The database and its tables are created on the first run."),
        p("With Docker, run `docker compose up -d --build`. The database stays in `./data` and transcripts in `./transcripts`. For pm2 and other options, see [Running 24/7](/docs/hosting)."),
        h("Test the whole flow"),
        steps(
          "From a second account that is not staff, DM the bot and answer with a subject.",
          "Check that a thread appeared in the tickets channel.",
          "Reply in the thread and check the DM arrives; reply by DM and check it appears in the thread.",
          "Run `/claim`, then `/unclaim`.",
          "Run `/close reason:test` and check the transcript in the archive channel.",
          "Find the ticket with `/logs user` and `/logs search`.",
        ),
      ],
    },
    {
      id: "commands",
      label: "Commands",
      title: "Commands",
      blocks: [
        p("All commands except `/help` need the staff role (or being the server owner). Ticket commands only work inside a ticket thread."),
        commands([
          ["/reply <message> [anonymous]", "Send a reply to the member. With `anonymous:true` the member doesn't see who wrote it."],
          ["/claim", "Mark the ticket as yours. Renames the thread to `[OPEN - CLAIMED]`."],
          ["/unclaim", "Put the ticket back in the queue and ping the staff role."],
          ["/close [reason]", "Close the ticket, tell the member, and post the transcript to the archive channel."],
          ["/closeall", "Emergency: force-close every open ticket in the database."],
          ["/logs user <target>", "A member's past tickets, a page at a time."],
          ["/logs search <query>", "Search the text of closed tickets."],
          ["/snippet add <name> <content> [anonymous]", "Save a canned response."],
          ["/snippet use <name>", "Send a saved response in the current ticket."],
          ["/snippet list", "Show saved responses."],
          ["/snippet remove <name>", "Delete a saved response."],
          ["/config color <hex>", "The colour of the bot's embeds."],
          ["/config activity <text>", "The bot's status text."],
          ["/config emoji <emoji>", "The reaction the bot adds to confirm a relayed message."],
          ["/config view", "Show the current settings."],
          ["/help", "List commands. It leaves out `/claim`, `/unclaim` and `/closeall`, which still work."],
        ]),
        note("Discord rate-limits thread renames to 2 per 10 minutes. Claiming, unclaiming and claiming again quickly can fail; wait a few minutes and try again."),
      ],
    },
    {
      id: "data",
      label: "Data",
      title: "Data and backups",
      blocks: [
        p("All state is in two places in the bot's folder:"),
        list(
          "`data/modmail.db` (plus `-wal` and `-shm` while running): tickets, every relayed message, snippets, settings.",
          "`transcripts/`: the HTML transcripts, also posted to the archive channel.",
        ),
        p("Stop the bot before copying the database, or copy all three files together. These hold private conversations: keep them private and out of git."),
        p("Tell your members that messages to the bot are read by staff and stored."),
      ],
    },
    {
      id: "troubleshooting",
      label: "Problems",
      title: "Troubleshooting",
      blocks: [
        qa([
          ["“Used disallowed intents”", "Turn on Server Members and Message Content in the Developer Portal (**Bot** tab), save, and restart."],
          ["Slash commands don't appear", "Check the invite included `applications.commands`, that `GUILD_ID` is your server, and look for “[Commands] Failed to register” in the output. Press `Ctrl+R` in Discord."],
          ["“Missing Access” when a ticket is created", "The bot can't see the tickets channel, or lacks Create Public Threads or Send Messages in Threads there."],
          ["“Tickets channel not found”", "`TICKETS_CHANNEL_ID` is wrong, or the bot cannot see the channel."],
          ["The bot ignores DMs", "The member may block DMs from server members, or the Message Content intent is off."],
          ["“You do not have permission”", "The staff member doesn't have the role in `STAFF_ROLE_ID`."],
          ["No transcript in the archive", "Check `ARCHIVE_CHANNEL_ID` and that the bot has Attach Files there."],
          ["`npm ci` fails on better-sqlite3", "Install the build tools from [Getting started](/docs/getting-started#requirements), or use Docker."],
        ]),
      ],
    },
    {
      id: "modify",
      label: "Code",
      title: "Changing the code",
      blocks: [
        table(
          ["Path", "What's there"],
          [
            ["src/index.js", "Creates the client, declares intents, loads every event file"],
            ["src/commands/", "One slash command per file, loaded automatically"],
            ["src/events/", "One Discord event per file"],
            ["src/handlers/ticketManager.js", "Creating and closing tickets, thread names, auto-archive time"],
            ["src/handlers/messageBridge.js", "Relaying messages, edits, deletes and attachments"],
            ["src/handlers/transcriptGenerator.js", "How transcripts look"],
            ["src/handlers/permissions.js", "Who may run which command"],
            ["src/database/schema.js", "Tables, default settings and migrations"],
            ["src/utils/constants.js", "Colours and default emoji"],
          ],
        ),
        h("Add a command"),
        p("Create a file in `src/commands/` that exports `data` (a `SlashCommandBuilder`) and `execute`, then restart: the loader registers it. Wrap staff-only commands with `hasPermission(interaction.member, 'name')`, which allows the owner, then the staff role, then per-user and per-role overrides stored in the `permissions` table."),
        code("src/commands/ping.js", `
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check that the bot is alive'),
  async execute(interaction) {
    return interaction.reply({ content: 'Pong!', ephemeral: true });
  },
};
`),
        p("Keep the credit header at the top of each file. To change the database, add a migration at the end of `initialize()` in `schema.js` rather than editing existing tables, and back up the database first."),
      ],
    },
  ],
};
