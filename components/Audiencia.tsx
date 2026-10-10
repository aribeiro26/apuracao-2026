"use client";

import { useEffect, useRef, useState } from "react";
import { atualizarEnquete, registrarPresenca, votarCandidato } from "@/app/acoes";
import { useI18n } from "@/components/LocaleProvider";
import type { ResumoAudiencia } from "@/lib/audiencia";
import { iniciais, numero, percentual, razao, semAcento } from "@/lib/format";
import { intlLocale, nomeLocale } from "@/lib/locale";
import type { Par } from "@/lib/placar";
import { SITE } from "@/lib/site";
import { nomeLocal } from "@/lib/uf";

const VAZIO: ResumoAudiencia = { total: 0, agora: 0, porEstado: [], votos: [], minhaEscolha: null };

const AZUL = "#1d4e89";
const VERMELHO = "#9f2d2d";

function chaveDe(nome: string, sqcand: string): string {
  const n = semAcento(nome).toLowerCase();
  if (n.includes("flavio")) return "flavio";
  if (n.includes("lula")) return "lula";
  return sqcand.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 32) || "cand";
}

function rotuloDe(nome: string): string {
  const n = semAcento(nome).toLowerCase();
  if (n.includes("flavio")) return "Flávio";
  if (n.includes("lula")) return "Lula";
  return nome.split(" ")[0] || nome;
}

export function useAudiencia(inicial?: ResumoAudiencia) {
  const [resumo, setResumo] = useState<ResumoAudiencia>(inicial ?? VAZIO);
  const [pronto, setPronto] = useState(Boolean(inicial && (inicial.total > 0 || inicial.votos.some((voto) => voto.total > 0))));
  useEffect(() => {
    let ativo = true;
    async function bater() {
      try {
        const json = await registrarPresenca();
        if (ativo && json.ok) {
          setResumo(json.resumo);
          setPronto(true);
        }
      } catch {
        /* a contagem espera o próximo ciclo */
      }
    }
    void bater();
    const id = window.setInterval(() => void bater(), 45_000);
    return () => {
      ativo = false;
      window.clearInterval(id);
    };
  }, []);
  return { resumo, setResumo, pronto };
}

export function CaixaVisitantes({ resumo, atalho = true }: { resumo: ResumoAudiencia; atalho?: boolean }) {
  const { copy, locale } = useI18n();
  const idioma = intlLocale(locale);
  const lista = resumo.porEstado.slice(0, 6);
  return (
    <aside className="w-full max-w-xs rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-3 text-sm shadow-card sm:ml-auto" aria-label={copy.visitantes}>
      <p className="font-medium">{copy.visitantes}</p>
      <p>{copy.jaAcessaram(numero(resumo.total, idioma))}</p>
      <p>{copy.acessandoAgora(numero(resumo.agora, idioma))}</p>
      <ul className="mt-2 space-y-1 text-[var(--muted)]">
        {lista.map((item) => (
          <li key={item.uf} className="flex justify-between gap-3">
            <span>{item.uf === "fora" ? copy.foraDoBrasil : nomeLocal(item.uf, locale)}</span>
            <span className="tabular-nums">
              {numero(item.total, idioma)} · {copy.agoraCurto(numero(item.agora, idioma))}
            </span>
          </li>
        ))}
      </ul>
      {atalho ? (
        <a href="/analytics#votos" className="mt-2 inline-flex min-h-11 items-center text-sm underline">
          {copy.verGraficos}
        </a>
      ) : null}
    </aside>
  );
}

export function BotoesVoto({
  par,
  resumo,
  onContado,
}: {
  par: Par | null;
  resumo: ResumoAudiencia;
  onContado?: (resumo: ResumoAudiencia) => void;
}) {
  const { copy } = useI18n();
  const [escolhaLocal, setEscolhaLocal] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const escolha = resumo.minhaEscolha || escolhaLocal;
  const lados = par
    ? [
        { chave: chaveDe(par.azul.nome, par.azul.sqcand), nome: rotuloDe(par.azul.nome), cor: AZUL },
        { chave: chaveDe(par.vermelho.nome, par.vermelho.sqcand), nome: rotuloDe(par.vermelho.nome), cor: VERMELHO },
      ]
    : [
        { chave: "flavio", nome: "Flávio", cor: AZUL },
        { chave: "lula", nome: "Lula", cor: VERMELHO },
      ];

  async function votar(chave: string, nome: string) {
    if (escolha || ocupado) return;
    setOcupado(true);
    try {
      const json = await votarCandidato(chave, nome);
      if (json.ok) {
        setEscolhaLocal(json.resumo.minhaEscolha || chave);
        onContado?.(json.resumo);
        window.location.assign("/analytics#votos");
      }
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="mt-4 max-w-xl">
      <div className="flex flex-wrap gap-2">
        {lados.map((lado) => {
          const meu = escolha === lado.chave;
          return (
            <button
              key={lado.chave}
              type="button"
              onClick={() => void votar(lado.chave, lado.nome)}
              disabled={Boolean(escolha) || ocupado}
              aria-pressed={meu}
              className="min-h-11 rounded-full px-4 text-sm font-medium text-white disabled:opacity-70"
              style={{ background: lado.cor }}
            >
              {meu ? copy.votoFeito(lado.nome) : copy.votoBotao(lado.nome)}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">{copy.votoNota}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-4">
        <BotaoCompartilhar />
        <a href="/analytics#votos" className="inline-flex min-h-11 items-center text-sm underline">
          {copy.graficoVotos}
        </a>
        <a href="/monitor" className="inline-flex min-h-11 items-center text-sm underline">
          {copy.monitor}
        </a>
      </div>
    </div>
  );
}

function ladosDe(par: Par | null) {
  return par
    ? [
        { chave: chaveDe(par.azul.nome, par.azul.sqcand), nome: rotuloDe(par.azul.nome), cor: AZUL, fotos: par.azul.fotos },
        { chave: chaveDe(par.vermelho.nome, par.vermelho.sqcand), nome: rotuloDe(par.vermelho.nome), cor: VERMELHO, fotos: par.vermelho.fotos },
      ]
    : [
        { chave: "flavio", nome: "Flávio", cor: AZUL, fotos: [] as string[] },
        { chave: "lula", nome: "Lula", cor: VERMELHO, fotos: [] as string[] },
      ];
}

export function BotaoAtualizar({ onAtualizado }: { onAtualizado: (resumo: ResumoAudiencia) => void }) {
  const { copy } = useI18n();
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState("");
  const espera = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (espera.current != null) window.clearTimeout(espera.current);
    };
  }, []);

  async function atualizar() {
    if (ocupado) return;
    setOcupado(true);
    setAviso("");
    try {
      const json = await atualizarEnquete();
      if (!json.ok) {
        setAviso(copy.atualizarFalhou);
        return;
      }
      onAtualizado(json.resumo);
      setAviso(copy.atualizado);
      if (espera.current != null) window.clearTimeout(espera.current);
      espera.current = window.setTimeout(() => setAviso(""), 2500);
    } catch {
      setAviso(copy.atualizarFalhou);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        className="min-h-11 rounded-full bg-[var(--acao)] px-4 text-sm font-medium text-white disabled:opacity-70"
        onClick={() => void atualizar()}
        disabled={ocupado}
        aria-busy={ocupado}
      >
        {ocupado ? copy.atualizando : copy.atualizar}
      </button>
      {aviso ? (
        <span className="mt-1 text-sm text-[var(--muted)]" role="status">
          {aviso}
        </span>
      ) : null}
    </span>
  );
}

export function BotaoCompartilhar() {
  const { copy } = useI18n();
  const [aviso, setAviso] = useState("");

  async function compartilhar() {
    const url = `${SITE}/enquete`;
    if (typeof navigator.share === "function") {
      // O iPhone e o WhatsApp juntam title, text e url. Três campos iguais viram três cópias.
      // O Facebook ignora url e só publica o texto, então nele o link vai no texto.
      const facebook = /FBAN|FBAV/i.test(navigator.userAgent);
      const dados: ShareData = facebook ? { text: url } : { url };
      try {
        await navigator.share(dados);
        return;
      } catch (erro) {
        if (erro instanceof DOMException && erro.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setAviso(copy.linkCopiado);
    } catch {
      setAviso(url);
    }
  }

  return (
    <span className="inline-flex flex-col">
      <button type="button" className="min-h-11 rounded-full bg-[var(--acao)] px-4 text-sm font-medium text-white" onClick={() => void compartilhar()}>
        {copy.compartilharEnquete}
      </button>
      {aviso ? <span className="mt-1 text-sm text-[var(--muted)]">{aviso}</span> : null}
    </span>
  );
}

export function EnqueteTela({
  aberta,
  par,
  resumo,
  pronto,
  onContado,
  onFechar,
}: {
  aberta: boolean;
  par: Par | null;
  resumo: ResumoAudiencia;
  pronto: boolean;
  onContado?: (resumo: ResumoAudiencia) => void;
  onFechar: () => void;
}) {
  const { copy } = useI18n();
  const [escolhaLocal, setEscolhaLocal] = useState<string | null>(null);
  const [resumoLocal, setResumoLocal] = useState<ResumoAudiencia | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const escolha = resumo.minhaEscolha || escolhaLocal;
  const visivel = resumoLocal ?? resumo;
  const lados = ladosDe(par);

  useEffect(() => {
    if (!aberta) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function tecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", tecla);
    };
  }, [aberta, onFechar]);

  if (!aberta) return null;

  async function votar(chave: string, nome: string) {
    if (escolha || ocupado) return;
    setOcupado(true);
    try {
      const json = await votarCandidato(chave, nome);
      if (json.ok) {
        setEscolhaLocal(json.resumo.minhaEscolha || chave);
        setResumoLocal(json.resumo);
        onContado?.(json.resumo);
      }
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)] p-4" role="dialog" aria-modal="true" aria-label={copy.enqueteToque}>
      <div className="flex items-center justify-between gap-3">
        <BotaoCompartilhar />
        <a href="/monitor" className="inline-flex min-h-11 items-center text-sm underline">
          {copy.monitor}
        </a>
        <button type="button" className="min-h-11 px-2 text-sm underline" onClick={onFechar}>
          {copy.fechar}
        </button>
      </div>
      {escolha ? (
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center">
          <GraficoPesquisa resumo={visivel} />
          <div className="mt-4 flex flex-wrap items-center gap-x-4">
            <BotaoAtualizar
              onAtualizado={(novo) => {
                setResumoLocal(novo);
                onContado?.(novo);
              }}
            />
            <button type="button" className="min-h-11 text-sm underline" onClick={onFechar}>
              {copy.enqueteSeguir}
            </button>
            <a href="/monitor" className="inline-flex min-h-11 items-center text-sm underline">
              {copy.monitor}
            </a>
          </div>
        </div>
      ) : !pronto ? (
        <p className="m-auto text-sm text-[var(--muted)]">{copy.carregando}</p>
      ) : (
        <>
          <h2 className="text-center font-serif text-3xl sm:text-4xl">{copy.enqueteToque}</h2>
          <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 gap-3">
            {lados.map((lado) => (
              <button
                key={lado.chave}
                type="button"
                disabled={!pronto || ocupado}
                className="flex min-h-0 flex-col overflow-hidden rounded-3xl p-3 text-white disabled:opacity-70"
                style={{ background: lado.cor }}
                onClick={() => void votar(lado.chave, lado.nome)}
              >
                <FotoGrande nome={lado.nome} fotos={lado.fotos} />
                <span className="mt-3 text-2xl font-semibold">{lado.nome}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-[var(--muted)]">{copy.votoNota}</p>
        </>
      )}
    </div>
  );
}

function FotoGrande({ nome, fotos }: { nome: string; fotos: string[] }) {
  const [indice, setIndice] = useState(0);
  const candidata = fotos[indice];
  const src = candidata?.startsWith("https://resultados.tse.jus.br/") ? candidata : "";
  if (!src) {
    return (
      <span className="grid min-h-0 flex-1 place-items-center rounded-2xl bg-white/15 text-5xl font-semibold">
        {iniciais(nome)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="min-h-0 w-full flex-1 rounded-2xl object-cover"
      onError={() => setIndice((atual) => atual + 1)}
    />
  );
}

export function GraficoPesquisa({ resumo }: { resumo: ResumoAudiencia }) {
  const { copy, locale } = useI18n();
  const idioma = intlLocale(locale);
  const soma = resumo.votos.reduce((total, voto) => total + voto.total, 0);
  return (
    <GraficoBarras
      id="votos"
      titulo={copy.graficoVotos}
      nota={`${copy.votosNoBotao(numero(soma, idioma))}. ${copy.votoNota}`}
      itens={resumo.votos.map((voto) => {
        const parte = razao(voto.total, soma);
        return {
          nome: voto.nome,
          valor: voto.total,
          rotulo: `${numero(voto.total, idioma)} · ${percentual(parte, 1, idioma)}`,
          cor: voto.chave === "flavio" ? AZUL : voto.chave === "lula" ? VERMELHO : undefined,
          largura: parte,
        };
      })}
    />
  );
}

export function nomeDoEstado(uf: string, locale: "pt-BR" | "pt-PT" | "es" | "en", fora: string): string {
  if (uf === "fora") return fora;
  return nomeLocal(uf, locale) || nomeLocale(locale);
}

export function GraficoBarras({
  titulo,
  itens,
  id,
  nota,
}: {
  titulo: string;
  itens: { nome: string; valor: number; rotulo?: string; cor?: string; largura?: number }[];
  id?: string;
  nota?: string;
}) {
  const maior = Math.max(1, ...itens.map((item) => item.valor));
  return (
    <section id={id} className="scroll-mt-6 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4" aria-label={titulo}>
      <h2 className="font-serif text-2xl">{titulo}</h2>
      {nota ? <p className="mt-1 text-sm text-[var(--muted)]">{nota}</p> : null}
      {itens.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">0</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {itens.map((item) => (
            <li key={item.nome}>
              <div className="flex justify-between gap-3 text-sm">
                <span>{item.nome}</span>
                <span className="tabular-nums">{item.rotulo ?? item.valor}</span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-[var(--track)]" role="img" aria-label={`${item.nome}: ${item.rotulo ?? item.valor}`}>
                <div
                  className="h-full bg-[var(--acao)]"
                  style={{
                    width: (item.largura ?? (item.valor / maior) * 100) === 0 ? "0%" : `${Math.max(2, item.largura ?? (item.valor / maior) * 100)}%`,
                    background: item.cor,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
