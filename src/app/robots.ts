import type { MetadataRoute } from "next";
import { SITE_URL } from "@/utils/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/.well-known/vercel/flags",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
