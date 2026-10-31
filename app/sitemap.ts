import type { MetadataRoute } from "next";
import { bots, siteUrl, upcoming } from "@/lib/bots";
import { docs } from "@/lib/docs";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, priority: 1 },
    { url: `${siteUrl}/about`, priority: 0.5 },
    ...bots.map((b) => ({ url: `${siteUrl}/bots/${b.slug}`, lastModified: b.updated, priority: 0.8 })),
    ...upcoming.map((b) => ({ url: `${siteUrl}/bots/${b.slug}`, priority: 0.6 })),
    { url: `${siteUrl}/docs`, priority: 0.6 },
    ...docs.map((d) => ({ url: `${siteUrl}/docs/${d.slug}`, priority: 0.5 })),
  ];
}
