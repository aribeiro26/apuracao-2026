import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/locale";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...LOCALES.map((hl) => ({
      url: `${SITE}/?hl=${hl}`,
      lastModified: "2026-10-09",
      changeFrequency: "hourly" as const,
      priority: hl === "pt-BR" ? 1 : 0.4,
    })),
    { url: `${SITE}/enquete`, lastModified: "2026-10-09", changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE}/monitor`, lastModified: "2026-10-10", changeFrequency: "hourly", priority: 0.6 },
  ];
}
