import type { MetadataRoute } from "next";

import { nav, site } from "@/data/site";
import { workGroups } from "@/data/photos";

/**
 * Built from the same nav array the header renders, so a page can never be
 * added to the site and forgotten here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...nav.map((item) => ({
      url: `${site.url}${item.href}`,
      lastModified: now,
      changeFrequency: item.href === "/home" ? "monthly" as const : "yearly" as const,
      priority: item.href === "/home" ? 1 : item.href === "/galleries" ? 0.9 : 0.7,
    })),
    ...workGroups.map((group) => ({
      url: `${site.url}/galleries/${group.id}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
