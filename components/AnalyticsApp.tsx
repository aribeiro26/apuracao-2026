"use client";

import { BotaoAtualizar, BotaoCompartilhar, CaixaVisitantes, GraficoBarras, GraficoPesquisa, nomeDoEstado, useAudiencia } from "@/components/Audiencia";
import { useI18n } from "@/components/LocaleProvider";
import type { ResumoAudiencia } from "@/lib/audiencia";

export function AnalyticsApp({ inicial }: { inicial: ResumoAudiencia }) {
  const { copy, locale } = useI18n();
  const { resumo, setResumo } = useAudiencia(inicial);
  const nome = (uf: string) => nomeDoEstado(uf, locale, copy.foraDoBrasil);
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <a href="#graficos" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--paper)] focus:px-4 focus:py-2">
        {copy.pularParaConteudo}
      </a>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl">{copy.analyticsTitulo}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{copy.audienciaNota}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4">
            <a href="/" className="inline-flex min-h-11 items-center text-sm underline">
              {copy.voltarInicio}
            </a>
            <BotaoCompartilhar />
            <BotaoAtualizar onAtualizado={setResumo} />
          </div>
        </div>
        <CaixaVisitantes resumo={resumo} atalho={false} />
      </header>
      <main id="graficos" className="mt-8 space-y-8">
        <GraficoPesquisa resumo={resumo} />
        <GraficoBarras
          titulo={copy.graficoVisitantes}
          itens={resumo.porEstado.map((item) => ({ nome: nome(item.uf), valor: item.total }))}
        />
        <GraficoBarras
          titulo={copy.graficoAgora}
          itens={resumo.porEstado.filter((item) => item.agora > 0).map((item) => ({ nome: nome(item.uf), valor: item.agora }))}
        />
      </main>
    </div>
  );
}
