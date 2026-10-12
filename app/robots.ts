import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    // O Chama Festa (www.festalugar.com.br/chama-festa) é outro app servido
    // neste domínio; o robots.txt só existe na raiz, então o mapa dele vai aqui.
    sitemap: [`${SITE}/sitemap.xml`, "https://www.festalugar.com.br/chama-festa/sitemap.xml"],
    host: SITE,
  };
}
