import { code, commands, h, list, note, p, qa, steps, table, term, warn, type DocPage } from "../types";

export const discmeet: DocPage = {
  slug: "discmeet",
  group: "bots",
  bot: "discmeet",
  title: "DiscMeet",
  summary: "Records a voice channel per speaker, transcribes it with OpenAI Whisper and posts structured meeting notes.",
  lead: "Set up DiscMeet with an OpenAI key, record a meeting, get its notes, and use the expense tracker.",
  sections: [
    {
      id: "overview",
      label: "Overview",
      title: "How DiscMeet works",
      blocks: [
        steps(
          "You join a voice channel and run `/join`. The bot joins and records **each speaker separately**, cutting their audio into segments at pauses.",
          "You run `/summarize`. Each segment is sent to OpenAI Whisper for transcription.",
          "The transcripts are merged by time into one timed transcript, and filler words (“um”, “uh”…) are removed.",
          "A GPT model writes a title and structured notes from the transcript.",
          "The notes and the transcript (as a `.txt` file) are posted to your archive channel, with a pinned header.",
        ),
        p("It also includes a small **expense tracker**: each member can log expenses per server, list a month and compare the total against a budget."),
        warn("DiscMeet records voice and sends it to OpenAI. Tell everyone in the channel before you start recording, and check OpenAI's data policy before using it for sensitive meetings. Recording laws differ between countries and states."),
      ],
    },
    {
      id: "requirements",
      label: "Needs",
      title: "What you need",
      blocks: [
        list(
          "Node.js 22.12 or newer (required by the voice library).",
          "A Discord bot token and its **Application ID**.",
          "An **OpenAI API key** with billing set up.",
        ),
        h("Get an OpenAI key"),
        steps(
          "Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys) and create a new secret key. It is shown once: copy it.",
          "Under **Billing**, add a payment method or credit.",
          "Set a **monthly usage limit**, so a long meeting can't surprise you.",
        ),
        p("You pay OpenAI directly for each transcription (per minute of audio) and each set of notes (per token). The default notes model, `gpt-4o-mini`, is one of the cheapest."),
        h("Discord setup"),
        list(
          "On **General Information**, copy the Application ID: this is `CLIENT_ID`.",
          "No privileged intents are needed. DiscMeet only uses the Guilds and Guild Voice States intents.",
          "Invite with View Channels, Send Messages, Embed Links, Attach Files, Read Message History, Connect, Speak, Pin Messages and Set Voice Channel Status.",
        ),
        p("Set Voice Channel Status lets the bot show “Recording” on the channel. Without it, recording still works and a warning is logged."),
      ],
    },
    {
      id: "configure",
      label: "Settings",
      title: "Configure .env",
      blocks: [
        table(
          ["Variable", "Required", "Default", "What it does"],
          [
            ["DISCORD_TOKEN", "yes", "", "The bot token"],
            ["CLIENT_ID", "yes", "", "The Application ID"],
            ["OPENAI_API_KEY", "yes", "", "Your OpenAI key"],
            ["WHISPER_MODEL", "no", "`whisper-1`", "Transcription model"],
            ["SUMMARY_MODEL", "no", "`gpt-4o-mini`", "Model that writes the notes"],
            ["SILENCE_DURATION", "no", "`300`", "Milliseconds of silence that end a speech segment. Higher means fewer, longer segments"],
            ["LOG_CHANNEL_ID", "no", "", "Archive channel for notes and transcripts. Without it, results go to the channel where you ran the command"],
            ["IDLE_STATUS", "no", "`Watching over meetings`", "The bot's status text when it isn't recording"],
            ["DEBUG", "no", "", "Any value prints debug output"],
          ],
        ),
        p("The bot refuses to start if a required value is missing, with “[CONFIG ERROR] Missing required environment variables”."),
        p("For the archive channel, the bot needs View Channel, Send Messages, Embed Links, Attach Files and Pin Messages there. For the voice channel, View Channel, Connect and Speak."),
      ],
    },
    {
      id: "run",
      label: "Run",
      title: "Install, register and run",
      blocks: [
        term([["npm ci"], ["npm run deploy", "register the slash commands (once)"], ["npm start"]]),
        p("DiscMeet registers its commands **globally** and separately from starting. Run `npm run deploy` once, and again only when you add, remove or change a command's options. Global commands can take up to an hour to appear everywhere."),
        p("On start the bot prints its models and the log channel, then `DiscMeet Bot Online`. `Ctrl+C` ends active sessions cleanly, clears the voice channel status and leaves."),
        note("There is no Docker setup for DiscMeet. Use pm2 or systemd to keep it running ([Running 24/7](/docs/hosting))."),
      ],
    },
    {
      id: "using",
      label: "Meetings",
      title: "Record a meeting",
      blocks: [
        steps(
          "Join a voice channel yourself, then run `/join`. The bot joins and the channel status shows that it is recording.",
          "Talk as usual. `/status` shows how long it has been recording and who has spoken.",
          "Run `/summarize` to stop. Transcription and notes can take a minute or more for long meetings.",
          "The notes and transcript appear in the archive channel, and a short confirmation where you ran the command.",
        ),
        p("If you change `SUMMARY_MODEL` or the prompt, `/resummarize` writes new notes from the **last** session without recording again."),
        commands([
          ["/join", "Join your voice channel and start recording."],
          ["/summarize", "Stop recording, transcribe, and post the notes."],
          ["/status", "Current session: duration and speakers."],
          ["/resummarize", "Write the notes again from the cached last session."],
          ["/leave [force]", "Leave the voice channel. Unsaved recordings are discarded; `force:true` skips the confirmation."],
        ]),
        note("Whisper accepts files up to 25 MB. A speaker's segment larger than that is skipped with a warning. A lower `SILENCE_DURATION` gives shorter segments."),
      ],
    },
    {
      id: "expenses",
      label: "Expenses",
      title: "The expense tracker",
      blocks: [
        p("Expenses are kept per member, per server, in `data/expenses.json`. Members only see their own."),
        commands([
          ["/expense add <amount> <category> [description]", "Log an expense."],
          ["/expense list [month]", "A month's expenses. `month` is `YYYY-MM`; default this month."],
          ["/expense edit <id> [amount] [category] [description]", "Change an expense by its number from the list."],
          ["/expense remove <id>", "Delete an expense."],
          ["/expense total [budget] [month]", "The month's total by category against your budget. Passing `budget` sets that month's budget, and it is remembered."],
        ]),
      ],
    },
    {
      id: "data",
      label: "Data",
      title: "Files it writes",
      blocks: [
        table(
          ["Folder", "Holds", "Keep?"],
          [
            ["recordings/", "Audio while a meeting is processed", "Temporary; can be deleted"],
            ["cache/", "The last session, for `/resummarize`", "Temporary"],
            ["notes/", "Generated meeting notes", "Yes, if you want copies off Discord"],
            ["data/", "`expenses.json`", "Yes: back it up"],
          ],
        ),
        p("All four are ignored by git and hold private content. Delete `recordings/` and `cache/` now and then if disk space matters."),
      ],
    },
    {
      id: "troubleshooting",
      label: "Problems",
      title: "Troubleshooting",
      blocks: [
        qa([
          ["“[CONFIG ERROR] Missing required environment variables”", "Fill in `DISCORD_TOKEN`, `CLIENT_ID` and `OPENAI_API_KEY`."],
          ["Commands don't appear", "Run `npm run deploy`, wait up to an hour, check the invite had `applications.commands`, and press `Ctrl+R` in Discord."],
          ["“You must be in a voice channel first!”", "Join a voice channel before `/join`."],
          ["It joins but records nothing", "Check the Connect permission and that nobody is server-muted. Set `DEBUG=1` to see detail. Some hosts block the UDP that voice uses."],
          ["401 or “Incorrect API key”", "The OpenAI key is wrong or the account has no credit."],
          ["429 or quota errors", "You hit an OpenAI rate limit or ran out of credit."],
          ["No “Recording” status on the channel", "Grant Set Voice Channel Status. Recording works without it."],
          ["Nothing in the archive", "`LOG_CHANNEL_ID` is empty or wrong, or the bot can't post or pin there."],
          ["A speaker's transcript is empty", "Their segments were over 25 MB or only silence. Lower `SILENCE_DURATION`."],
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
            ["src/commands/", "join, leave, stop (which defines `/summarize`), status, resummarize, expense"],
            ["src/voice/", "Joining, per-speaker recording, session state"],
            ["src/transcription/whisper.js", "The Whisper call, the 25 MB guard, retries"],
            ["src/processing/summariser.js", "The prompt that writes the notes: format, sections, tone, language"],
            ["src/processing/fillerCleaner.js", "The filler-word list"],
            ["src/utils/archiver.js", "What gets posted to the archive channel"],
            ["src/utils/presence.js", "Status text and the voice channel label"],
            ["src/expense/store.js", "The expense tracker's storage"],
          ],
        ),
        p("To change how notes read, edit the prompt in `summariser.js` and try it with `/resummarize`; no new recording is needed. After adding a command or changing its options, run `npm run deploy`. DiscMeet has no permission system: add checks such as `.setDefaultMemberPermissions(...)` yourself if only some members should record."),
        code("src/commands/ping.js", `
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check that the bot is alive'),
  async execute(interaction, { activeSessions, client }) {
    return interaction.reply({ content: 'Pong!', ephemeral: true });
  },
};
`),
      ],
    },
  ],
};
