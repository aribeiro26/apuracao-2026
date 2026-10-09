import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { MENSAGENS } from "@/lib/i18n";
import { intlLocale } from "@/lib/locale";
import { resolveLocale } from "@/lib/request-locale";
import { resolveTema } from "@/lib/request-tema";
import "./globals.css";

const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

export const viewport: Viewport = {
  themeColor: "#0f6b4c",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  return {
    title: MENSAGENS[locale].metaTitle,
    description: MENSAGENS[locale].metaDescription,
    applicationName: "Apuração 2026",
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: "Apuração 2026", statusBarStyle: "default" },
    icons: {
      icon: [
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
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
