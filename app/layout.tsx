import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { MENSAGENS } from "@/lib/i18n";
import { intlLocale } from "@/lib/locale";
import { resolveLocale } from "@/lib/request-locale";
import { resolveTema } from "@/lib/request-tema";
import "./globals.css";

const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  return {
    title: MENSAGENS[locale].metaTitle,
    description: MENSAGENS[locale].metaDescription,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale();
  const tema = await resolveTema();
  return (
    <html lang={intlLocale(locale)} className={tema === "escuro" ? "escuro" : undefined}>
      <body className={`${sans.variable} ${serif.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
