import type { MetadataRoute } from "next";
import { getRaces } from "@/services/races";

const BASE_URL = "https://f1.edselserrano.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let sessions: Array<{ session_key: string; date_start: Date }> = [];

  try {
    sessions = await getRaces({});
  } catch {
    sessions = [];
  }

  const sessionEntries: MetadataRoute.Sitemap = sessions.map((s) => ({
    url: `${BASE_URL}/session/${s.session_key}`,
    lastModified: new Date(s.date_start),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...sessionEntries,
  ];
}
