import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "monthly" as const },
    { path: "/speisekarte", priority: 0.9, changeFrequency: "monthly" as const },
    {
      path: "/veranstaltungen",
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },
    { path: "/galerie", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/kontakt", priority: 0.8, changeFrequency: "yearly" as const },
  ];

  return routes.map((r) => ({
    url: `${siteConfig.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
