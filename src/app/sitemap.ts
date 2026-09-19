import type { MetadataRoute } from "next";

import { nav, site } from "@/data/site";

/**
 * Built from the same nav array the header renders, so a page can never be
 * added to the site and forgotten here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return nav.map((item) => ({
    url: `${site.url}${item.href}`,
    lastModified: now,
    changeFrequency: item.href === "/home" ? "monthly" : "yearly",
    priority: item.href === "/home" ? 1 : item.href === "/work" ? 0.9 : 0.7,
  }));
}
