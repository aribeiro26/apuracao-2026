import type { Metadata } from "next";
import { headers } from "next/headers";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { MENSAGENS } from "@/lib/i18n";
import { intlLocale } from "@/lib/locale";
import { resolveLocale } from "@/lib/request-locale";
import { resolveTema } from "@/lib/request-tema";
import { SITE } from "@/lib/site";
import "./globals.css";

const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const copy = MENSAGENS[locale];
  const idioma = intlLocale(locale);
  const caminho = `/?hl=${locale}`;
  return {
    metadataBase: new URL(SITE),
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    applicationName: copy.title,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    alternates: {
      canonical: caminho,
      languages: {
        "pt-BR": "/?hl=pt-BR",
        "pt-PT": "/?hl=pt-PT",
        "es-ES": "/?hl=es",
        en: "/?hl=en",
        "x-default": "/?hl=pt-BR",
      },
    },
    openGraph: {
      type: "website",
      url: caminho,
      siteName: copy.title,
      title: copy.metaTitle,
      description: copy.metaDescription,
      locale: idioma.replace("-", "_"),
    },
    twitter: {
      card: "summary_large_image",
      title: copy.metaTitle,
      description: copy.metaDescription,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale();
  const tema = await resolveTema();
  const copy = MENSAGENS[locale];
  const idioma = intlLocale(locale);
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const url = `${SITE}/?hl=${locale}`;
  const dados = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE}/#site`,
        url: SITE,
        name: copy.metaTitle,
        description: copy.metaDescription,
        inLanguage: idioma,
      },
      {
        "@type": "WebPage",
        "@id": `${url}#pagina`,
        url,
        name: copy.metaTitle,
        description: copy.metaDescription,
        isPartOf: { "@id": `${SITE}/#site` },
        inLanguage: idioma,
        datePublished: "2026-10-04",
        about: copy.lead,
      },
    ],
  };
  const json = JSON.stringify(dados).replace(/</g, "\\u003c");
  return (
    <html lang={idioma} className={tema === "escuro" ? "escuro" : undefined}>
      <body className={`${sans.variable} ${serif.variable} font-sans antialiased`}>
        <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: json }} />
        {children}
      </body>
    </html>
  );
}
