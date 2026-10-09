import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { MENSAGENS } from "@/lib/i18n";
import { intlLocale } from "@/lib/locale";
import { resolveLocale } from "@/lib/request-locale";
import "./globals.css";

const sans = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif" });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  return {
    title: MENSAGENS[locale].metaTitle,
    description: MENSAGENS[locale].metaDescription,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale();
  return (
    <html lang={intlLocale(locale)}>
      <body className={`${sans.variable} ${serif.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
