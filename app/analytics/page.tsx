import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { AnalyticsApp } from "@/components/AnalyticsApp";
import { LocaleProvider } from "@/components/LocaleProvider";
import { lerResumo, type ResumoAudiencia } from "@/lib/audiencia";
import { ipDeVoto } from "@/lib/ip";
import { resolveLocale } from "@/lib/request-locale";
import { resolveTema } from "@/lib/request-tema";

const VAZIO: ResumoAudiencia = { total: 0, agora: 0, porEstado: [], votos: [], minhaEscolha: null };

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Visitantes",
};

export default async function PaginaAnalytics() {
  const locale = await resolveLocale();
  const tema = await resolveTema();
  const jar = await cookies();
  const id = jar.get("visita")?.value;
  let inicial = VAZIO;
  try {
    inicial = await lerResumo(id, ipDeVoto(await headers()));
  } catch {
    inicial = VAZIO;
  }
  return (
    <LocaleProvider initial={locale} temaInicial={tema}>
      <AnalyticsApp inicial={inicial} />
    </LocaleProvider>
  );
}
