import type { MetadataRoute } from "next";

import { site } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin page lists other people's contact details. It is also
      // noindex in its own metadata — this just keeps crawlers away entirely.
      disallow: ["/api/", "/admin"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
