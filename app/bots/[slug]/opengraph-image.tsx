import { bots, getBot, getUpcoming, upcoming } from "@/lib/bots";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "A LuniBot Discord bot: its logo, name and what it does";
export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = () => [...bots, ...upcoming].map((b) => ({ slug: b.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const bot = getBot(slug) ?? getUpcoming(slug);
  const soon = Boolean(getUpcoming(slug));
  return ogImage({ title: bot ? `${bot.name}${soon ? " · coming soon" : ""}` : "LuniBot", line: bot?.tagline ?? "Discord bots you run yourself.", icon: bot?.icon });
}
