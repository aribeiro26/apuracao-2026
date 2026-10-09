"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CandidatoCard } from "@/components/CandidatoCard";
import { BotaoDoar } from "@/components/Doar";
import { SeletorIdioma, useI18n } from "@/components/LocaleProvider";
import { comparar, somarCidades, type Candidato, type CidadeApurada, type Modo, type Resultado } from "@/lib/conta";
import { numero, percentual, razao } from "@/lib/format";
import { intlLocale } from "@/lib/locale";
import { UFS, UFS_PRESIDENTE, nomeLocal } from "@/lib/uf";

type Visao = "tudo" | "presidente" | "governador";
type CargoLocal = "presidente" | "governador";

type Painel = {
  aviso: string;
  presidente: Resultado;
  somaEstados: Resultado;
  unidades: Resultado[];
  governadores: Resultado[];
};

type Varredura = {
  cidades: CidadeApurada[];
  total: number;
  modo: Modo;
  turno: 1 | 2;
  erro: string | null;
  pronta: boolean;
};

const VAZIA: Varredura = { cidades: [], total: 0, modo: "aguardando", turno: 1, erro: null, pronta: false };
const ALVO_APURACAO = "2026-10-25T17:00:00-03:00";

export function PainelApp() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { copy, locale } = useI18n();
  const idioma = intlLocale(locale);
  const visao = visaoDe(params.get("visao"));
  const uf = (params.get("uf") ?? "").toLowerCase();
  const mun = params.get("mun") ?? "";

  const [painel, setPainel] = useState<Painel | null>(null);
  const [erroPainel, setErroPainel] = useState<string | null>(null);
  const [atualizadoCliente, setAtualizadoCliente] = useState<string>("");
  const [soSegundo, setSoSegundo] = useState(true);
  const [municipios, setMunicipios] = useState<{ codigo: string; nome: string; capital: boolean }[]>([]);
  const [busca, setBusca] = useState("");
  const [presidenteUf, setPresidenteUf] = useState<Varredura>(VAZIA);
  const [governadorUf, setGovernadorUf] = useState<Varredura>(VAZIA);
  const [cidadePresidente, setCidadePresidente] = useState<Resultado | null>(null);
  const [cidadeGovernador, setCidadeGovernador] = useState<Resultado | null>(null);
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  const aoVivo = painel?.presidente.modo === "ao-vivo" || painel?.governadores.some((item) => item.modo === "ao-vivo");

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const resposta = await fetch("/api/painel", { cache: "no-store" });
        const json = await resposta.json();
        if (!resposta.ok) throw new Error(json.erro || "rede");
        if (!ativo) return;
        setPainel(json as Painel);
        setErroPainel(null);
        setAtualizadoCliente(new Date().toLocaleTimeString(idioma, { hour: "2-digit", minute: "2-digit" }));
      } catch {
        if (ativo) setErroPainel("rede");
      }
    }
    void carregar();
    const id = setInterval(carregar, aoVivo ? 20000 : 60000);
    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, [aoVivo, idioma]);

  useEffect(() => {
    if (!uf || uf === "zz") {
      setMunicipios([]);
      return;
    }
    let ativo = true;
    void fetch(`/api/municipios?cargo=presidente&uf=${uf}`)
      .then((resposta) => resposta.json())
      .then((json) => {
        if (ativo && Array.isArray(json.municipios)) setMunicipios(json.municipios);
      })
      .catch(() => {
        if (ativo) setMunicipios([]);
      });
    return () => {
      ativo = false;
    };
  }, [uf]);

  useEffect(() => {
    if (!uf || mun) return;
    const controle = new AbortController();
    const querPresidente = visao !== "governador";
    const querGovernador = visao !== "presidente" && uf !== "zz";
    if (querPresidente) void varrer("presidente", uf, controle.signal, setPresidenteUf);
    else setPresidenteUf(VAZIA);
    if (querGovernador) void varrer("governador", uf, controle.signal, setGovernadorUf);
    else setGovernadorUf(VAZIA);
    return () => controle.abort();
  }, [uf, mun, visao, aoVivo]);

  useEffect(() => {
    if (!uf || !mun) {
      setCidadePresidente(null);
      setCidadeGovernador(null);
      return;
    }
    const controle = new AbortController();
    setErroLocal(null);
    async function ler(cargo: CargoLocal, definir: (valor: Resultado | null) => void) {
      const resposta = await fetch(`/api/municipio?cargo=${cargo}&uf=${uf}&codigo=${mun}`, {
        signal: controle.signal,
        cache: "no-store",
      });
      const json = await resposta.json();
      if (!resposta.ok) throw new Error("municipio");
      if (!json.cidade?.ok) {
        definir(null);
        return;
      }
      definir({
        cargo,
        uf,
        nomeUf: json.cidade.nome,
        modo: json.modo,
        turno: json.turno,
        codigoEleicao: "",
        codigoPrimeiroTurno: "",
        atualizadoEm: json.atualizadoEm ?? "",
        url: "",
        totais: json.cidade.totais,
        candidatos: json.cidade.candidatos,
      });
    }
    void (async () => {
      try {
        if (visao !== "governador") await ler("presidente", setCidadePresidente);
        if (visao !== "presidente" && uf !== "zz") await ler("governador", setCidadeGovernador);
      } catch (erro) {
        if (!controle.signal.aborted) setErroLocal("municipio");
      }
    })();
    return () => controle.abort();
  }, [uf, mun, visao, aoVivo]);

  function navegar(proximo: { visao?: Visao; uf?: string; mun?: string }) {
    const consulta = new URLSearchParams(params.toString());
    const vista = proximo.visao ?? visao;
    const estado = proximo.uf ?? uf;
    const cidade = proximo.mun ?? (proximo.uf != null && proximo.uf !== uf ? "" : mun);
    if (vista === "tudo") consulta.delete("visao");
    else consulta.set("visao", vista);
    if (!estado) consulta.delete("uf");
    else consulta.set("uf", estado);
    if (!cidade || !estado) consulta.delete("mun");
    else consulta.set("mun", cidade);
    const texto = consulta.toString();
    router.replace(texto ? `${pathname}?${texto}` : pathname, { scroll: false });
  }

  const governadoresVisiveis = useMemo(() => {
    const lista = painel?.governadores ?? [];
    return lista
      .filter((item) => (soSegundo ? item.modo !== "definido" : true))
      .sort((a, b) => nomeLocal(a.uf, locale).localeCompare(nomeLocal(b.uf, locale), idioma));
  }, [painel, soSegundo, locale, idioma]);

  const cidadesFiltradas = useMemo(() => {
    const base = presidenteUf.cidades.length ? presidenteUf.cidades : governadorUf.cidades;
    const termo = busca.trim().toLocaleLowerCase(idioma);
    return base
      .filter((cidade) => !termo || cidade.nome.toLocaleLowerCase(idioma).includes(termo))
      .sort((a, b) => (b.totais?.votosValidos ?? 0) - (a.totais?.votosValidos ?? 0));
  }, [busca, presidenteUf.cidades, governadorUf.cidades]);

  const opcoesUf = visao === "governador" ? UFS : UFS_PRESIDENTE;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--green)]">{copy.kicker}</p>
          <h1 className="mt-1 font-serif text-4xl leading-none sm:text-5xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">{copy.lead}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SeletorIdioma />
          <BotaoDoar />
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm">
            <span className={`pulso h-2.5 w-2.5 rounded-full ${aoVivo ? "animate-pulse bg-[var(--green)]" : "bg-[var(--mark)]"}`} />
            {aoVivo ? copy.live : copy.waiting}
            {atualizadoCliente ? ` · ${copy.readAt(atualizadoCliente)}` : ""}
          </p>
        </div>
      </header>

      <Contagem />
      <ComoFunciona />

      <div className="sticky top-0 z-20 -mx-4 mt-6 border-y border-[var(--line)] bg-[#efe6d8]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="grid gap-3 md:grid-cols-[auto_1fr_1fr]">
          <div className="flex rounded-full bg-[var(--paper)] p-1">
            {(["tudo", "presidente", "governador"] as Visao[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => navegar({ visao: item })}
                className={`min-h-11 rounded-full px-3 text-sm ${visao === item ? "bg-[var(--ink)] text-[var(--paper)]" : ""}`}
              >
                {item === "tudo" ? copy.tudo : item === "presidente" ? copy.presidente : copy.governador}
              </button>
            ))}
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">{copy.estado}</span>
            <select
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-3"
              value={uf}
              onChange={(evento) => navegar({ uf: evento.target.value, mun: "" })}
            >
              <option value="">{copy.brasilInteiro}</option>
              {opcoesUf.map((item) => (
                <option key={item.sigla} value={item.sigla}>
                  {nomeLocal(item.sigla, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">{copy.municipio}</span>
            <select
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-3 disabled:opacity-50"
              value={mun}
              disabled={!uf || uf === "zz"}
              onChange={(evento) => navegar({ mun: evento.target.value })}
            >
              <option value="">{uf === "zz" ? copy.exteriorSemMunicipio : uf ? copy.todosMunicipios : copy.escolhaEstado}</option>
              {municipios.map((item) => (
                <option key={item.codigo} value={item.codigo}>
                  {item.nome}
                  {item.capital ? ` · ${copy.capital}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {erroPainel && <p className="mt-4 rounded-2xl bg-[#fff1f2] px-4 py-3 text-sm">{copy.erroRede}</p>}
      {erroLocal && <p className="mt-4 rounded-2xl bg-[#fff1f2] px-4 py-3 text-sm">{copy.erroMunicipio}</p>}

      {!painel && !erroPainel && <p className="mt-8 text-[var(--muted)]">{copy.lendo}</p>}

      {painel && !uf && (
        <div className="mt-8 space-y-10">
          {visao !== "governador" && (
            <section className="space-y-4">
              <Cabecalho
                titulo={copy.presidenteBrasil}
                modo={painel.presidente.modo}
                detalhe={painel.presidente.atualizadoEm ? copy.arquivoNacional(painel.presidente.atualizadoEm) : undefined}
              />
              <Disputa resultado={painel.somaEstados.candidatos.length ? painel.somaEstados : painel.presidente} />
              <Conferencia
                titulo={copy.comoTotal}
                texto={copy.comoTotalTexto}
                soma={painel.somaEstados}
                oficial={painel.presidente}
                completo
              />
              <EstadosPresidente unidades={painel.unidades} onEscolher={(sigla) => navegar({ uf: sigla, visao: "presidente" })} />
            </section>
          )}

          {visao !== "presidente" && (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <Cabecalho titulo={copy.governadores} modo={governadoresVisiveis.some((item) => item.modo === "ao-vivo") ? "ao-vivo" : "aguardando"} />
                <button type="button" className="min-h-11 self-start text-sm underline" onClick={() => setSoSegundo((valor) => !valor)}>
                  {soSegundo ? copy.mostrarTodos : copy.mostrarSoSegundo}
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {governadoresVisiveis.map((item) => (
                  <button
                    key={item.uf}
                    type="button"
                    onClick={() => navegar({ uf: item.uf, visao: "governador" })}
                    className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4 text-left shadow-card"
                  >
                    <MiniEstado resultado={item} />
                  </button>
                ))}
              </div>
            </section>
          )}
          <p className="text-sm text-[var(--muted)]">{copy.aviso}</p>
        </div>
      )}

      {painel && uf && !mun && (
        <div className="mt-8 space-y-10">
          <p className="text-sm text-[var(--muted)]">
            {copy.somaLotes(nomeLocal(uf, locale))}
          </p>
          {visao !== "governador" && (
            <SomaEstado
              titulo={copy.presidenteEm(nomeLocal(uf, locale))}
              varredura={presidenteUf}
              oficial={uf === "br" ? painel.presidente : painel.unidades.find((item) => item.uf === uf) ?? null}
            />
          )}
          {visao !== "presidente" && uf !== "zz" && (
            <SomaEstado
              titulo={copy.governadorEm(nomeLocal(uf, locale))}
              varredura={governadorUf}
              oficial={painel.governadores.find((item) => item.uf === uf) ?? null}
            />
          )}
          {uf !== "zz" && (
            <section>
              <label className="block text-sm">
                <span className="mb-1 block text-[var(--muted)]">{copy.buscarSoma}</span>
                <input
                  value={busca}
                  onChange={(evento) => setBusca(evento.target.value)}
                  placeholder={copy.placeholderCidade}
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-3"
                />
              </label>
              <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper)]">
                {cidadesFiltradas.slice(0, 40).map((cidade) => (
                  <li key={cidade.codigo}>
                    <button type="button" className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => navegar({ mun: cidade.codigo })}>
                      <span>
                        {cidade.nome}
                        {cidade.capital ? ` · ${copy.capital}` : ""}
                        {!cidade.ok ? ` · ${copy.semArquivo}` : ""}
                      </span>
                      <span className="shrink-0 text-sm text-[var(--muted)]">{numero(cidade.totais?.votosValidos ?? 0, idioma)} {copy.validosCurtos}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {cidadesFiltradas.length > 40 && <p className="mt-2 text-sm text-[var(--muted)]">{copy.mostrando40}</p>}
            </section>
          )}
        </div>
      )}

      {painel && uf && mun && (
        <div className="mt-8 space-y-10">
          <button type="button" className="min-h-11 text-sm underline" onClick={() => navegar({ mun: "" })}>
            {copy.voltarSoma(nomeLocal(uf, locale))}
          </button>
          {cidadePresidente && visao !== "governador" && (
            <section className="space-y-4">
              <Cabecalho titulo={copy.presidenteEm(cidadePresidente.nomeUf)} modo={cidadePresidente.modo} detalhe={copy.municipioEntra} />
              <Disputa resultado={cidadePresidente} />
            </section>
          )}
          {cidadeGovernador && visao !== "presidente" && (
            <section className="space-y-4">
              <Cabecalho titulo={copy.governadorEm(cidadeGovernador.nomeUf)} modo={cidadeGovernador.modo} detalhe={copy.municipioEntra} />
              <Disputa resultado={cidadeGovernador} />
            </section>
          )}
        </div>
      )}

      <footer className="mt-12 border-t border-[var(--line)] pt-4 text-sm text-[var(--muted)]">
        {copy.rodape}
      </footer>
    </div>
  );
}

function visaoDe(valor: string | null): Visao {
  if (valor === "presidente" || valor === "governador") return valor;
  return "tudo";
}

async function varrer(
  cargo: CargoLocal,
  uf: string,
  signal: AbortSignal,
  definir: (valor: Varredura) => void,
) {
  const cidades: CidadeApurada[] = [];
  let total = 0;
  let modo: Modo = "aguardando";
  let turno: 1 | 2 = 1;
  try {
    for (let offset = 0; offset <= total; offset += 8) {
      const resposta = await fetch(`/api/lote?cargo=${cargo}&uf=${uf}&offset=${offset}&limit=8`, { signal, cache: "no-store" });
      const json = await resposta.json();
      if (!resposta.ok) throw new Error("soma");
      total = json.total as number;
      modo = json.modo as Modo;
      turno = json.turno as 1 | 2;
      cidades.push(...(json.cidades as CidadeApurada[]));
      definir({ cidades: [...cidades], total, modo, turno, erro: null, pronta: cidades.length >= total });
      if (!json.cidades?.length) break;
    }
  } catch (erro) {
    if (signal.aborted) return;
    definir({ cidades, total, modo, turno, erro: "soma", pronta: false });
  }
}

function destacar(resultado: Resultado): Candidato[] {
  const seguem = resultado.candidatos.filter((cand) => cand.fase === "segundo-turno");
  if (seguem.length >= 1 && resultado.modo !== "definido") return seguem.slice(0, 2);
  return resultado.candidatos.slice(0, 2);
}

function Disputa({ resultado }: { resultado: Resultado }) {
  const { copy, locale } = useI18n();
  const idioma = intlLocale(locale);
  const principais = destacar(resultado);
  const grupo = principais.reduce((soma, cand) => soma + cand.votos, 0);
  const compararEntre = resultado.modo === "aguardando" && grupo > 0 && grupo < resultado.totais.votosValidos;
  const apurado = razao(resultado.totais.secoesApuradas, resultado.totais.secoesTotal);
  const demais = resultado.candidatos.filter((cand) => !principais.some((item) => item.sqcand === cand.sqcand));
  return (
    <div className="space-y-4">
      <div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--paper)]">
          <div className="h-full bg-[var(--green)]" style={{ width: `${Math.min(100, apurado)}%` }} />
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {copy.secoes(percentual(apurado, 2, idioma), numero(resultado.totais.secoesApuradas, idioma), numero(resultado.totais.secoesTotal, idioma))}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {principais.map((cand) => (
          <CandidatoCard
            key={cand.sqcand}
            candidato={cand}
            votosValidos={resultado.totais.votosValidos}
            votosDoGrupo={grupo}
            mostrarComparacao={compararEntre}
          />
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat rotulo={copy.votosValidos} valor={numero(resultado.totais.votosValidos, idioma)} nota={copy.notaValidos} />
        <Stat rotulo={copy.brancos} valor={numero(resultado.totais.brancos, idioma)} nota={percentual(razao(resultado.totais.brancos, resultado.totais.comparecimento), 2, idioma)} />
        <Stat rotulo={copy.nulos} valor={numero(resultado.totais.nulos, idioma)} nota={percentual(razao(resultado.totais.nulos, resultado.totais.comparecimento), 2, idioma)} />
        <Stat rotulo={copy.abstencao} valor={numero(resultado.totais.abstencao, idioma)} nota={percentual(razao(resultado.totais.abstencao, resultado.totais.eleitorado), 2, idioma)} />
      </dl>
      {demais.length > 0 && (
        <details className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm">
          <summary className="cursor-pointer">{copy.outrosCandidatos(demais.length)}</summary>
          <ul className="mt-3 space-y-1">
            {demais.map((cand) => (
              <li key={cand.sqcand} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">{cand.nome} · {cand.partido}</span>
                <span className="shrink-0 tabular-nums">{percentual(razao(cand.votos, resultado.totais.votosValidos), 2, idioma)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function Stat({ rotulo, valor, nota }: { rotulo: string; valor: string; nota: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-3">
      <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">{rotulo}</dt>
      <dd className="mt-1 font-serif text-2xl tabular-nums">{valor}</dd>
      <dd className="mt-1 text-xs text-[var(--muted)]">{nota}</dd>
    </div>
  );
}

function Cabecalho({ titulo, modo, detalhe }: { titulo: string; modo: Modo; detalhe?: string }) {
  const { copy } = useI18n();
  const texto = modo === "ao-vivo" ? copy.modoAoVivo : modo === "aguardando" ? copy.modoAguardando : copy.modoDefinido;
  return (
    <div>
      <h2 className="font-serif text-3xl">{titulo}</h2>
      <p className="text-sm text-[var(--muted)]">
        {texto}
        {detalhe ? ` · ${detalhe}` : ""}
      </p>
    </div>
  );
}

function Conferencia({
  titulo,
  texto,
  soma,
  oficial,
  completo,
}: {
  titulo: string;
  texto: string;
  soma: Resultado;
  oficial: Resultado;
  completo: boolean;
}) {
  const { copy, locale } = useI18n();
  const idioma = intlLocale(locale);
  const diff = comparar(soma, oficial);
  const candidatos = diff.candidatos.filter((item) => item.delta !== 0);
  const bate = completo && diff.votosValidos === 0 && candidatos.length === 0;
  return (
    <aside className="rounded-3xl border border-dashed border-[var(--green)] bg-[var(--green-soft)] p-4 text-sm">
      <h3 className="font-serif text-xl text-[var(--green)]">{titulo}</h3>
      <p className="mt-1 text-[var(--ink)]">{texto}</p>
      <p className="mt-2">
        {copy.soma}: {numero(soma.totais.votosValidos, idioma)} {copy.votosValidosFrase}. {copy.oficial}: {numero(oficial.totais.votosValidos, idioma)}.
      </p>
      {bate && <p className="mt-1 font-medium">{copy.contasFecham}</p>}
      {!bate && completo && <p className="mt-1">{copy.diferenca(numero(diff.votosValidos, idioma), candidatos.length)}</p>}
    </aside>
  );
}

function MiniEstado({ resultado }: { resultado: Resultado }) {
  const { copy, locale } = useI18n();
  const idioma = intlLocale(locale);
  const dupla = destacar(resultado);
  return (
    <span className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-serif text-xl">{nomeLocal(resultado.uf, locale)}</span>
        <span className="text-xs text-[var(--muted)]">{percentual(razao(resultado.totais.secoesApuradas, resultado.totais.secoesTotal), 0, idioma)} {copy.apurado}</span>
      </span>
      <span className="mt-2 block text-sm text-[var(--muted)]">
        {resultado.modo === "definido" ? copy.definido1 : resultado.modo === "ao-vivo" ? copy.segundoTurno : copy.vaiSegundo}
      </span>
      <span className="mt-2 block space-y-1 text-sm">
        {dupla.map((cand) => (
          <span key={cand.sqcand} className="flex justify-between gap-2">
            <span className="truncate">{cand.nome}</span>
            <span className="tabular-nums">{percentual(razao(cand.votos, resultado.totais.votosValidos), 2, idioma)}</span>
          </span>
        ))}
      </span>
    </span>
  );
}

function EstadosPresidente({ unidades, onEscolher }: { unidades: Resultado[]; onEscolher: (uf: string) => void }) {
  const { copy, locale } = useI18n();
  const idioma = intlLocale(locale);
  const lista = [...unidades].sort((a, b) => nomeLocal(a.uf, locale).localeCompare(nomeLocal(b.uf, locale), idioma));
  return (
    <div>
      <h3 className="font-serif text-2xl">{copy.presidenteCadaEstado}</h3>
      <p className="mb-3 text-sm text-[var(--muted)]">{copy.presidenteCadaEstadoNota}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((item) => (
          <button key={item.uf} type="button" onClick={() => onEscolher(item.uf)} className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4 text-left shadow-card">
            <MiniEstado resultado={item} />
          </button>
        ))}
      </div>
    </div>
  );
}

function SomaEstado({ titulo, varredura, oficial }: { titulo: string; varredura: Varredura; oficial: Resultado | null }) {
  const { copy } = useI18n();
  const soma = somarCidades("presidente", oficial?.uf ?? "", varredura.cidades, { modo: varredura.modo, turno: varredura.turno });
  const resultado = soma && oficial ? { ...soma, cargo: oficial.cargo, modo: varredura.modo, turno: varredura.turno, nomeUf: oficial.nomeUf } : null;
  const falhas = varredura.cidades.filter((cidade) => !cidade.ok).length;
  return (
    <section className="space-y-4">
      <Cabecalho
        titulo={titulo}
        modo={varredura.modo}
        detalhe={varredura.total ? copy.lidosDe(varredura.cidades.length, varredura.total) : copy.comecandoLeitura}
      />
      {varredura.erro && <p className="text-sm">{copy.erroSoma}</p>}
      {resultado ? <Disputa resultado={resultado} /> : <p className="text-sm text-[var(--muted)]">{copy.aindaNao}</p>}
      {resultado && oficial && (
        <Conferencia
          titulo={copy.conferenciaEstado}
          texto={copy.conferenciaEstadoTexto}
          soma={resultado}
          oficial={oficial}
          completo={varredura.pronta && falhas === 0}
        />
      )}
      {falhas > 0 && <p className="text-sm">{copy.falhas(falhas)}</p>}
    </section>
  );
}

function ComoFunciona() {
  const { copy } = useI18n();
  const passos = copy.steps;
  return (
    <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {passos.map(([titulo, texto]) => (
        <li key={titulo} className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4">
          <p className="font-serif text-lg">{titulo}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{texto}</p>
        </li>
      ))}
    </ol>
  );
}

function Contagem() {
  const { copy } = useI18n();
  const [texto, setTexto] = useState<string | null>(null);
  useEffect(() => {
    function atualizar() {
      const falta = new Date(ALVO_APURACAO).getTime() - Date.now();
      if (falta <= 0) {
        setTexto(copy.countdownPast);
        return;
      }
      const dias = Math.floor(falta / 86400000);
      const horas = Math.floor((falta % 86400000) / 3600000);
      setTexto(copy.countdownFuture(dias, horas));
    }
    atualizar();
    const id = setInterval(atualizar, 60000);
    return () => clearInterval(id);
  }, [copy]);
  if (!texto) return null;
  return <p className="mt-4 rounded-2xl bg-[var(--paper)] px-4 py-3 text-sm">{texto}</p>;
}
