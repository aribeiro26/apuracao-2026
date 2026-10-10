import type { Metadata } from "next";
import { MonitorPainel } from "@/components/MonitorPainel";
import { LocaleProvider } from "@/components/LocaleProvider";
import { acharDiscrepancias, disputasDe, type Ponto } from "@/lib/discrepancia";
import { lerHistorico } from "@/lib/historico";
import { intlLocale } from "@/lib/locale";
import { MONITOR } from "@/lib/monitor-copy";
import { resolveLocale } from "@/lib/request-locale";
import { resolveTema } from "@/lib/request-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  return {
    title: { absolute: MONITOR[locale].titulo },
    description: MONITOR[locale].nota,
    robots: { index: true, follow: true },
  };
}

export default async function PaginaMonitor({
  searchParams,
}: {
  searchParams: Promise<{ cargo?: string; uf?: string; hl?: string }>;
}) {
  const locale = await resolveLocale();
  const tema = await resolveTema();
  const params = await searchParams;
  let pontos: Ponto[] = [];
  let falha = false;
  try {
    pontos = await lerHistorico();
  } catch {
    falha = true;
  }
  const disputas = disputasDe(pontos);
  const pedidoCargo = params.cargo === "governador" || params.cargo === "presidente" ? params.cargo : "";
  const pedidoUf = /^[a-z]{2}$/.test(params.uf ?? "") ? params.uf ?? "" : "";
  const disputa = disputas.find((item) => item.cargo === pedidoCargo && item.uf === pedidoUf) ?? disputas[0] ?? null;
  const hl = params.hl ? `&hl=${encodeURIComponent(params.hl)}` : "";
  return (
    <LocaleProvider initial={locale} temaInicial={tema}>
      <MonitorPainel
        copy={MONITOR[locale]}
        idioma={intlLocale(locale)}
        pontos={pontos}
        disputas={disputas}
        disputa={disputa}
        alertas={acharDiscrepancias(pontos)}
        falha={falha}
        hrefDe={(cargo, uf) => `/monitor?cargo=${cargo}&uf=${uf}${hl}`}
      />
    </LocaleProvider>
  );
}
