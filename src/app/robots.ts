import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/.well-known/vercel/flags",
    },
    sitemap: "https://f1.edselserrano.com/sitemap.xml",
  };
}
