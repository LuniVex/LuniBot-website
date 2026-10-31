import { docs, getDoc } from "@/lib/docs";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "A LuniBot docs page";
export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = () => docs.map((d) => ({ slug: d.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const doc = getDoc((await params).slug);
  return ogImage({ title: doc ? `${doc.title} · Docs` : "LuniBot docs", line: doc?.summary ?? "Guides for every bot." });
}
