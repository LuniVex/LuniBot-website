import { qa, type DocPage } from "../types";

export const faq: DocPage = {
  slug: "faq",
  group: "help",
  title: "Questions",
  summary: "Cost, coding knowledge, running several bots or servers, customising the bot's name, and where updates come from.",
  lead: "Short answers to what people ask most before and after setting up a bot.",
  sections: [
    {
      id: "general",
      label: "General",
      title: "Before you start",
      blocks: [
        qa([
          ["Are the bots free?", "Yes. There is no premium tier, no member limit and nothing locked. DiscMeet uses OpenAI, which bills you directly for what you use."],
          ["Do I need to know how to code?", "No. You need to be able to run a few commands in a terminal and fill in a settings file; the guides walk through every step. Knowing JavaScript helps only if you want to change the bot."],
          ["Why do I have to run it myself?", "So the bot's data stays with you, nothing depends on someone else's server staying up, and nobody can put features behind a paywall later. The cost is that the bot is only online while your machine is."],
          ["Which operating systems work?", "Windows, macOS and Linux, anywhere Node.js 22.12+ runs. That includes a Raspberry Pi 3 or newer with a 64-bit OS."],
          ["Why Node.js 22.12 specifically?", "Discord's voice library, which supports the end-to-end encryption Discord now requires, needs it. All bots share the same minimum so one Node install covers them all."],
        ]),
      ],
    },
    {
      id: "running",
      label: "Running",
      title: "Running bots",
      blocks: [
        qa([
          ["Can I run several bots on one machine?", "Yes. Give each its own folder, its own Discord application and token, and, with pm2, its own `--name`."],
          ["Can one copy serve several servers?", "DiscMeet, Music Bot and Guard: yes, invite them anywhere. Modmail: no, it serves the one server in `GUILD_ID`; run a second copy for a second server."],
          ["Can I change the bot's name and avatar?", "Yes, for free: Developer Portal → your application. The name on General Information and the Bot tab, the avatar on the Bot tab. You own the application."],
          ["Can other people add my bot to their servers?", "Only if **Public Bot** is on in the Developer Portal. Turn it off to keep your copy to yourself."],
          ["How much does hosting cost?", "Nothing on a computer you already have. A small VPS or a Raspberry Pi is enough for all four bots together."],
        ]),
      ],
    },
    {
      id: "updates",
      label: "Updates",
      title: "Updates and changes",
      blocks: [
        qa([
          ["How do I know a new version is out?", "The bot pages show the current version and the date of the latest update. Announcements go in the Discord."],
          ["Will updating lose my data?", "No, as long as you copy `.env` and the data folders into the new version. See [updating](/docs/hosting#updating)."],
          ["May I change the code?", "Yes. The bots are GPL-3.0: change them as you like. If you share a changed version, it must stay GPL-3.0 with its source available. Please keep the credit lines in the files."],
          ["Can I suggest a bot or a feature?", "Yes, in the Discord. That's where the next bots come from."],
        ]),
      ],
    },
  ],
};
