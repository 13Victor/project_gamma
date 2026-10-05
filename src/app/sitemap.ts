import type { MetadataRoute } from "next";
import { getPlayableChampions } from "@/lib/champions";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/clasico", "/como-jugar"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  const championRoutes = getPlayableChampions().map((champion) => ({
    url: `${SITE_URL}/campeones/${champion.id}`,
  }));

  return [...staticRoutes, ...championRoutes];
}
