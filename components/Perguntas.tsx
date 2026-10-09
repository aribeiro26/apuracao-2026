"use client";

import { useEffect, useState } from "react";
import { lerReportagens } from "@/app/acoes";
import { useI18n } from "@/components/LocaleProvider";
import type { Resultado } from "@/lib/conta";
import { parDaDisputa } from "@/lib/placar";
import { disputaPresidencial, sementeDe, type Reportagem, type TipoReportagem } from "@/lib/reportagens-semente";

export function Perguntas({ resultado }: { resultado: Resultado | null }) {
  const { copy, locale } = useI18n();
  const par = resultado ? parDaDisputa(resultado.candidatos) : null;
  const nomesChave = par ? `${par.azul.nome}\n${par.vermelho.nome}` : "";
  const [tipo, setTipo] = useState<TipoReportagem>("fez");
  const [itens, setItens] = useState<Reportagem[]>([]);
  const [buscando, setBuscando] = useState(true);
  const [falhou, setFalhou] = useState(false);
  const opcoes: { id: TipoReportagem; rotulo: string }[] = [
    { id: "fez", rotulo: copy.faqFez },
    { id: "acusado", rotulo: copy.faqAcusacao },
    { id: "fake", rotulo: copy.faqFake },
    { id: "deixou", rotulo: copy.faqDeixou },
  ];

  useEffect(() => {
    const nomes = nomesChave ? nomesChave.split("\n") : [];
    const base = disputaPresidencial(nomes) ? sementeDe(tipo, locale) : [];
    setItens(base);
    setBuscando(true);
    setFalhou(false);
    let vivo = true;
    lerReportagens(tipo, nomes, locale).then((json) => {
      if (!vivo) return;
      if (json.ok) {
        if (json.itens.length > 0) setItens(json.itens);
        setBuscando(false);
        return;
      }
      setBuscando(false);
      setFalhou(base.length === 0);
    });
    return () => {
      vivo = false;
    };
  }, [tipo, locale, nomesChave]);

  return (
    <section className="mt-4 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4 sm:p-5" aria-labelledby="perguntas-titulo">
      <h2 id="perguntas-titulo" className="font-serif text-2xl">{copy.faqTitulo}</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">{copy.faqNota}</p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={copy.faqEscolha}>
        {opcoes.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={tipo === item.id}
            onClick={() => setTipo(item.id)}
            className={`min-h-11 rounded-full px-3 text-left text-sm ${tipo === item.id ? "bg-[var(--ink)] text-[var(--paper)]" : "border border-[var(--line)]"}`}
          >
            {item.rotulo}
          </button>
        ))}
      </div>
      <div className="mt-4" role="status" aria-live="polite">
        {itens.length > 0 ? (
          <ul className="space-y-3">
            {itens.map((item) => (
              <li key={item.url} className="rounded-2xl bg-[var(--bg)] px-4 py-3">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline decoration-[var(--line)] underline-offset-4">
                  {item.titulo}
                </a>
                <p className="mt-1 text-xs text-[var(--muted)]">{item.veiculo}</p>
                <p className="mt-2 text-sm leading-relaxed">{item.resumo}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-[var(--bg)] px-4 py-3 text-sm leading-relaxed">{falhou ? copy.faqFalhou : copy.faqVazio}</p>
        )}
        {buscando && <p className="mt-3 text-sm text-[var(--muted)]">{copy.faqAtualizando}</p>}
      </div>
    </section>
  );
}
