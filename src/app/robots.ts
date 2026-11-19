import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/siteUrl";
import { DISALLOWED_PATHS } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/datasets", "/docs", "/founding-charter", "/technical-handover"],
        disallow: [...DISALLOWED_PATHS],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
