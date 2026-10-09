"use client";

import type { CidadeApurada, Resultado } from "@/lib/conta";
import { numero, percentual } from "@/lib/format";
import { MAPA_BRASIL } from "@/lib/mapa-brasil";
import { cenarioDaDisputa, parDaDisputa, vencedorLocal, type Par } from "@/lib/placar";
import { nomeLocal } from "@/lib/uf";
import type { Copy } from "@/lib/i18n";

const COR = { azul: "#1d4e89", vermelho: "#9f2d2d", neutro: "var(--map-neutro)" };

export function MensagemPlacar({ resultado, copy, idioma }: { resultado: Resultado; copy: Copy; idioma: string }) {
  const par = parDaDisputa(resultado.candidatos);
  if (!par) return <p className="text-sm text-[var(--muted)]">{copy.semDisputa}</p>;
  const texto = textoDaFrente(par, resultado, copy, idioma);
  return <p className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-base font-medium">{texto}</p>;
}

export function textoDaFrente(par: Par, resultado: Resultado, copy: Copy, idioma: string): string {
  if (par.azul.votos === par.vermelho.votos) return copy.empatePlacar;
  const lider = par.azul.votos > par.vermelho.votos ? par.azul : par.vermelho;
  const outro = lider === par.azul ? par.vermelho : par.azul;
  const falta = numero(lider.votos - outro.votos + 1, idioma);
  const dois = par.azul.votos + par.vermelho.votos;
  const fechada = dois >= resultado.totais.votosValidos * 0.98;
  if (fechada && lider.votos > resultado.totais.votosValidos / 2) return copy.maioriaSimples(primeiroNome(lider.nome));
  return `${copy.naFrente(primeiroNome(lider.nome), numero(lider.votos - outro.votos, idioma))} ${copy.paraPassar(primeiroNome(outro.nome), falta)}`;
}

export function MapaBrasil({
  unidades,
  resultado,
  copy,
  locale,
  idioma,
  onEscolher,
}: {
  unidades: Resultado[];
  resultado: Resultado | null;
  copy: Copy;
  locale: "pt-BR" | "pt-PT" | "es" | "en";
  idioma: string;
  onEscolher: (uf: string) => void;
}) {
  const par = parDaDisputa(unidades[0]?.candidatos ?? unidades.find((item) => parDaDisputa(item.candidatos))?.candidatos ?? []);
  const nacional = new Map(unidades.map((item) => [item.uf, item]));
  return (
    <section>
      <h3 className="text-lg font-semibold tracking-tight">{copy.mapaTitulo}</h3>
      <Legenda par={par} resultado={resultado} copy={copy} idioma={idioma} />
      <svg viewBox="0 0 400 430" className="mt-3 h-auto w-full" role="group" aria-label={copy.mapaTitulo}>
        {Object.entries(MAPA_BRASIL).map(([sigla, d]) => {
          const unidade = nacional.get(sigla);
          const lado = par && unidade ? vencedorLocal(par, unidade.candidatos) : "neutro";
          const nome = nomeLocal(sigla, locale);
          return (
            <path
              key={sigla}
              d={d}
              fill={COR[lado]}
              stroke="#ffffff"
              strokeWidth={0.8}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={copy.abrirLugar(nome)}
              onClick={() => onEscolher(sigla)}
              onKeyDown={(evento) => {
                if (evento.key === "Enter" || evento.key === " ") {
                  evento.preventDefault();
                  onEscolher(sigla);
                }
              }}
            >
              <title>{nome}</title>
            </path>
          );
        })}
      </svg>
    </section>
  );
}

export function GraficoEstados({
  unidades,
  resultado,
  copy,
  locale,
  idioma,
  onEscolher,
}: {
  unidades: Resultado[];
  resultado: Resultado | null;
  copy: Copy;
  locale: "pt-BR" | "pt-PT" | "es" | "en";
  idioma: string;
  onEscolher: (uf: string) => void;
}) {
  const parBase = unidades.map((item) => parDaDisputa(item.candidatos)).find(Boolean) ?? null;
  const linhas = unidades
    .filter((item) => item.uf !== "zz")
    .map((item) => {
      const par = parDaDisputa(item.candidatos) ?? parBase;
      const azul = par ? item.candidatos.find((cand) => cand.sqcand === par.azul.sqcand) : undefined;
      const vermelho = par ? item.candidatos.find((cand) => cand.sqcand === par.vermelho.sqcand) : undefined;
      const total = (azul?.votos ?? 0) + (vermelho?.votos ?? 0);
      return { uf: item.uf, azul: azul?.votos ?? 0, vermelho: vermelho?.votos ?? 0, total, par };
    })
    .sort((a, b) => nomeLocal(a.uf, locale).localeCompare(nomeLocal(b.uf, locale), idioma));
  const par = parBase;
  return (
    <section>
      <h3 className="text-lg font-semibold tracking-tight">{copy.graficoTitulo}</h3>
      <Legenda par={par} resultado={resultado} copy={copy} idioma={idioma} />
      <ul className="mt-3 max-h-[32rem] space-y-2 overflow-auto pr-1">
        {linhas.map((linha) => {
          const fatiaAzul = linha.total ? (linha.azul / linha.total) * 100 : 0;
          const fatiaVermelho = linha.total ? 100 - fatiaAzul : 0;
          return (
            <li key={linha.uf}>
              <button type="button" className="w-full text-left" onClick={() => onEscolher(linha.uf)}>
                <span className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{nomeLocal(linha.uf, locale)}</span>
                  <span className="tabular-nums text-[var(--muted)]">
                    {percentual(fatiaAzul, 0, idioma)} · {percentual(fatiaVermelho, 0, idioma)}
                  </span>
                </span>
                <span className="mt-1 flex h-2 overflow-hidden rounded-full bg-[var(--line)]">
                  <span className="h-full" style={{ width: `${fatiaAzul}%`, background: COR.azul }} />
                  <span className="h-full" style={{ width: `${fatiaVermelho}%`, background: COR.vermelho }} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function MosaicoMunicipios({
  cidades,
  referencia,
  copy,
  idioma,
}: {
  cidades: CidadeApurada[];
  referencia: Resultado | null;
  copy: Copy;
  idioma: string;
}) {
  const par = parDaDisputa(referencia?.candidatos ?? []) ?? parDaDisputa(cidades.find((cidade) => cidade.candidatos)?.candidatos ?? []);
  return (
    <section>
      <h3 className="text-lg font-semibold tracking-tight">{copy.municipiosTitulo}</h3>
      <Legenda par={par} resultado={referencia} copy={copy} idioma={idioma} />
      <div className="mt-3 flex max-h-64 flex-wrap gap-1 overflow-auto" role="img" aria-label={copy.municipiosTitulo}>
        {cidades.map((cidade) => {
          const lado = par ? vencedorLocal(par, cidade.candidatos) : "neutro";
          return <span key={cidade.codigo} title={cidade.nome} aria-hidden="true" className="h-3 w-3 rounded-sm" style={{ background: COR[lado] }} />;
        })}
      </div>
    </section>
  );
}

function Legenda({ par, resultado, copy, idioma }: { par: Par | null; resultado: Resultado | null; copy: Copy; idioma: string }) {
  if (!par) return null;
  const analise = resultado ? textoCenario(par, resultado, copy, idioma) : "";
  return (
    <div className="mt-2 space-y-1 text-sm text-[var(--muted)]">
      <p className="flex flex-wrap gap-4">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: COR.azul }} aria-hidden="true" />
          {primeiroNome(par.azul.nome)}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: COR.vermelho }} aria-hidden="true" />
          {primeiroNome(par.vermelho.nome)}
        </span>
      </p>
      {analise ? <p>{analise}</p> : null}
    </div>
  );
}

function textoCenario(par: Par, resultado: Resultado, copy: Copy, idioma: string): string {
  const cenario = cenarioDaDisputa(par, resultado);
  if (cenario.tipo === "segue") return copy.cenarioSegue;
  if (cenario.tipo === "empate") return copy.cenarioEmpate;
  if (cenario.tipo === "eleito") return copy.cenarioEleito(primeiroNome(cenario.nome));
  if (cenario.faltam == null) return copy.cenarioAbertoSemConta(primeiroNome(cenario.nome));
  return copy.cenarioAberto(primeiroNome(cenario.nome), numero(cenario.faltam, idioma));
}

export function primeiroNome(nome: string): string {
  return nome.split(" ")[0] || nome;
}
