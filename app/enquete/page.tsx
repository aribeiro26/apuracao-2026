import type { Metadata } from "next";

export const maxDuration = 60;
import { Suspense } from "react";
import { Carregando } from "@/components/Carregando";
import { LocaleProvider } from "@/components/LocaleProvider";
import { PainelApp } from "@/components/PainelApp";
import { MENSAGENS } from "@/lib/i18n";
import { intlLocale } from "@/lib/locale";
import { resolveLocale } from "@/lib/request-locale";
import { resolveTema } from "@/lib/request-tema";
import { SITE } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const copy = MENSAGENS[locale];
  const url = `${SITE}/enquete`;
  const imagem = `${SITE}/opengraph-image`;
  return {
    title: { absolute: copy.compartilharEnquete },
    description: copy.compartilharTexto,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: copy.title,
      locale: intlLocale(locale).replace("-", "_"),
      title: copy.compartilharEnquete,
      description: copy.compartilharTexto,
      images: [
        {
          url: imagem,
          secureUrl: imagem,
          width: 1200,
          height: 630,
          alt: copy.compartilharEnquete,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.compartilharEnquete,
      description: copy.compartilharTexto,
      images: [imagem],
    },
  };
}

export default async function PaginaEnquete() {
  const locale = await resolveLocale();
  const tema = await resolveTema();
  return (
    <LocaleProvider initial={locale} temaInicial={tema}>
      <Suspense fallback={<Carregando />}>
        <PainelApp />
      </Suspense>
    </LocaleProvider>
  );
}
