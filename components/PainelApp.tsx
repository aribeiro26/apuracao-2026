"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { carregarPainel, lerLoteMunicipios, lerMunicipio, municipiosDoEstado } from "@/app/acoes";
import { Apresentador } from "@/components/Apresentador";
import { CandidatoCard } from "@/components/CandidatoCard";
import { GraficoEstados, MapaBrasil, MensagemPlacar, MosaicoMunicipios, primeiroNome, textoDaFrente } from "@/components/DisputaVisual";
import { BotaoDoar } from "@/components/Doar";
import { BotaoTema, SeletorIdioma, useI18n } from "@/components/LocaleProvider";
import { somarCidades, type Candidato, type CidadeApurada, type Modo, type Resultado } from "@/lib/conta";
import { contarLados, parDaDisputa, quemLidera, vencedorLocal } from "@/lib/placar";
import { rastreioVisivel } from "@/lib/texto";
import { numero, percentual, razao } from "@/lib/format";
import { intlLocale } from "@/lib/locale";
import { UFS, UFS_PRESIDENTE, nomeLocal } from "@/lib/uf";

type Visao = "tudo" | "presidente" | "governador";
type CargoLocal = "presidente" | "governador";

type Painel = {
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
  rastreio: string;
  pronta: boolean;
};

type Aviso = { codigo: string; rastreio: string };

const VAZIA: Varredura = { cidades: [], total: 0, modo: "aguardando", turno: 1, erro: null, rastreio: "", pronta: false };
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
  const [erroPainel, setErroPainel] = useState<Aviso | null>(null);
  const [atualizadoCliente, setAtualizadoCliente] = useState<string>("");
  const [soSegundo, setSoSegundo] = useState(true);
  const [municipios, setMunicipios] = useState<{ codigo: string; nome: string; capital: boolean }[]>([]);
  const [busca, setBusca] = useState("");
  const [presidenteUf, setPresidenteUf] = useState<Varredura>(VAZIA);
  const [governadorUf, setGovernadorUf] = useState<Varredura>(VAZIA);
  const [cidadePresidente, setCidadePresidente] = useState<Resultado | null>(null);
  const [cidadeGovernador, setCidadeGovernador] = useState<Resultado | null>(null);
  const [erroLocal, setErroLocal] = useState<Aviso | null>(null);

  const aoVivo = painel?.presidente.modo === "ao-vivo" || painel?.governadores.some((item) => item.modo === "ao-vivo");

  useEffect(() => {
    let ativo = true;
    let timer = 0;
    async function carregar() {
      try {
        const json = await carregarPainel();
        if (!ativo) return;
        if (!json.ok) {
          setErroPainel({ codigo: json.erro === "limite" ? "limite" : "rede", rastreio: json.rastreio });
          timer = window.setTimeout(carregar, 60_000);
          return;
        }
        setPainel(json);
        setErroPainel(null);
        setAtualizadoCliente(new Date().toLocaleTimeString(idioma, { hour: "2-digit", minute: "2-digit" }));
        const vivo = json.presidente.modo === "ao-vivo" || json.governadores.some((item) => item.modo === "ao-vivo");
        timer = window.setTimeout(carregar, vivo ? 20_000 : 60_000);
      } catch {
        if (!ativo) return;
        setErroPainel({ codigo: "rede", rastreio: "" });
        timer = window.setTimeout(carregar, 60_000);
      }
    }
    void carregar();
    return () => {
      ativo = false;
      window.clearTimeout(timer);
    };
  }, [idioma]);

  useEffect(() => {
    if (!uf || uf === "zz") {
      setMunicipios([]);
      return;
    }
    let ativo = true;
    void municipiosDoEstado(uf)
      .then((json) => {
        if (ativo && json.ok) setMunicipios(json.municipios);
        else if (ativo) setMunicipios([]);
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
      const json = await lerMunicipio(cargo, uf, mun);
      if (controle.signal.aborted) return;
      if (!json.ok) {
        setErroLocal({ codigo: json.erro === "limite" ? "limite" : "municipio", rastreio: json.rastreio });
        return;
      }
      if (!json.cidade.ok || !json.cidade.totais || !json.cidade.candidatos) {
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
        if (controle.signal.aborted) return;
        setErroLocal({ codigo: "municipio", rastreio: "" });
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
  const nacional = painel?.somaEstados.candidatos.length ? painel.somaEstados : painel?.presidente ?? null;
  const falas = useMemo(() => {
    if (!nacional) return [];
    const par = parDaDisputa(nacional.candidatos);
    if (!par) return [copy.semDisputa];
    const lider = quemLidera(par);
    const contagem = contarLados(par, painel?.unidades ?? []);
    const apurado = razao(nacional.totais.secoesApuradas, nacional.totais.secoesTotal);
    const frases = [
      textoDaFrente(par, nacional, copy, idioma),
      copy.estadosNaFrente(primeiroNome(par.azul.nome), contagem.azul),
      copy.estadosNaFrente(primeiroNome(par.vermelho.nome), contagem.vermelho),
    ];
    if (lider) frases.push(apurado >= 99.5 ? copy.opiniaoFecha(primeiroNome(lider.nome)) : copy.opiniaoAberta(primeiroNome(lider.nome)));
    if (uf && presidenteUf.cidades.length) {
      const azuis = presidenteUf.cidades.filter((cidade) => vencedorLocal(par, cidade.candidatos) === "azul").length;
      const vermelhos = presidenteUf.cidades.filter((cidade) => vencedorLocal(par, cidade.candidatos) === "vermelho").length;
      frases.push(copy.municipioDele(primeiroNome(par.azul.nome), azuis));
      frases.push(copy.municipioDele(primeiroNome(par.vermelho.nome), vermelhos));
    }
    return frases;
  }, [nacional, painel?.unidades, copy, idioma, uf, presidenteUf.cidades]);

  const urnas = useMemo(() => {
    if (!painel) return null;
    if (mun && visao !== "governador" && cidadePresidente) {
      return { apuradas: cidadePresidente.totais.secoesApuradas, total: cidadePresidente.totais.secoesTotal };
    }
    if (mun && visao === "governador" && cidadeGovernador) {
      return { apuradas: cidadeGovernador.totais.secoesApuradas, total: cidadeGovernador.totais.secoesTotal };
    }
    if (uf && uf !== "zz") {
      const varredura = visao === "governador" ? governadorUf : presidenteUf;
      const oficiais = varredura.cidades.filter((cidade) => cidade.ok && cidade.totais);
      if (varredura.pronta && oficiais.length) {
        return {
          apuradas: oficiais.reduce((soma, cidade) => soma + (cidade.totais?.secoesApuradas ?? 0), 0),
          total: oficiais.reduce((soma, cidade) => soma + (cidade.totais?.secoesTotal ?? 0), 0),
        };
      }
      const arquivo = visao === "governador"
        ? painel.governadores.find((item) => item.uf === uf)
        : painel.unidades.find((item) => item.uf === uf);
      if (arquivo) return { apuradas: arquivo.totais.secoesApuradas, total: arquivo.totais.secoesTotal };
    }
    return { apuradas: painel.somaEstados.totais.secoesApuradas, total: painel.somaEstados.totais.secoesTotal };
  }, [painel, mun, uf, visao, cidadePresidente, cidadeGovernador, governadorUf, presidenteUf]);

  return (
    <>
    <BarraUrnas apuradas={urnas?.apuradas ?? 0} total={urnas?.total ?? 0} />
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--green)]">{copy.kicker}</p>
          <h1 className="mt-1 font-serif text-4xl leading-none sm:text-5xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">{copy.lead}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SeletorIdioma />
          <BotaoTema />
          <BotaoDoar />
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm">
            <span className={`pulso h-2.5 w-2.5 rounded-full ${aoVivo ? "animate-pulse bg-[var(--green)]" : "bg-[var(--mark)]"}`} />
            {aoVivo ? copy.live : copy.waiting}
            {atualizadoCliente ? ` · ${copy.readAt(atualizadoCliente)}` : ""}
          </p>
        </div>
      </header>

      <Contagem />

      <div className="sticky top-12 z-20 -mx-4 mt-6 border-y border-[var(--line)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
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

      {erroPainel && (
        <AvisoErro texto={erroPainel.codigo === "limite" ? copy.erroLimite : copy.erroRede} rastreio={erroPainel.rastreio} />
      )}
      {erroLocal && (
        <AvisoErro texto={erroLocal.codigo === "limite" ? copy.erroLimite : copy.erroMunicipio} rastreio={erroLocal.rastreio} />
      )}

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
              <Disputa resultado={nacional ?? painel.presidente} />
              {nacional && <MensagemPlacar resultado={nacional} copy={copy} idioma={idioma} />}
              <div className="grid gap-8 lg:grid-cols-2">
                <MapaBrasil unidades={painel.unidades} resultado={nacional} copy={copy} locale={locale} idioma={idioma} onEscolher={(sigla) => navegar({ uf: sigla, visao: "presidente" })} />
                <GraficoEstados unidades={painel.unidades} resultado={nacional} copy={copy} locale={locale} idioma={idioma} onEscolher={(sigla) => navegar({ uf: sigla, visao: "presidente" })} />
              </div>
              <p className="text-sm text-[var(--muted)]">{copy.verMunicipios}</p>
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
        </div>
      )}

      {painel && uf && !mun && (
        <div className="mt-8 space-y-10">
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
          {uf !== "zz" && visao !== "governador" && (
            <MosaicoMunicipios
              cidades={presidenteUf.cidades}
              referencia={uf === "br" ? painel.presidente : painel.unidades.find((item) => item.uf === uf) ?? null}
              copy={copy}
              idioma={idioma}
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
              <Cabecalho titulo={copy.presidenteEm(cidadePresidente.nomeUf)} modo={cidadePresidente.modo} />
              <Disputa resultado={cidadePresidente} />
            </section>
          )}
          {cidadeGovernador && visao !== "presidente" && (
            <section className="space-y-4">
              <Cabecalho titulo={copy.governadorEm(cidadeGovernador.nomeUf)} modo={cidadeGovernador.modo} />
              <Disputa resultado={cidadeGovernador} />
            </section>
          )}
        </div>
      )}

      <footer className="mt-12 border-t border-[var(--line)] pt-4 text-sm text-[var(--muted)]">
        {copy.rodape}
      </footer>
      <Apresentador linhas={falas} />
    </div>
    </>
  );
}

function BarraUrnas({ apuradas, total }: { apuradas: number; total: number }) {
  const { copy, locale } = useI18n();
  const idioma = intlLocale(locale);
  const pct = total > 0 ? (apuradas / total) * 100 : 0;
  const texto = copy.urnas(percentual(pct, 1, idioma));
  return (
    <div className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2 sm:px-6">
        <div
          className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--track)]"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={texto}
        >
          <div className="h-full bg-[var(--acao)]" style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        <p className="shrink-0 text-sm font-medium tabular-nums">{texto}</p>
      </div>
    </div>
  );
}

function AvisoErro({ texto, rastreio }: { texto: string; rastreio: string }) {
  const { copy } = useI18n();
  const id = rastreioVisivel(rastreio);
  return (
    <p className="mt-4 rounded-2xl bg-[var(--danger-bg)] px-4 py-3 text-sm">
      {texto}
      {id ? <span className="mt-1 block font-mono text-xs">{copy.rastreio(id)}</span> : null}
    </p>
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
      if (signal.aborted) return;
      const json = await lerLoteMunicipios(cargo, uf, offset);
      if (signal.aborted) return;
      if (!json.ok) {
        definir({ cidades, total, modo, turno, erro: json.erro === "limite" ? "limite" : "soma", rastreio: json.rastreio, pronta: false });
        return;
      }
      total = json.total as number;
      modo = json.modo as Modo;
      turno = json.turno as 1 | 2;
      cidades.push(...(json.cidades as CidadeApurada[]));
      definir({ cidades: [...cidades], total, modo, turno, erro: null, rastreio: "", pronta: cidades.length >= total });
      if (!json.cidades?.length) break;
    }
  } catch {
    if (signal.aborted) return;
    definir({ cidades, total, modo, turno, erro: "soma", rastreio: "", pronta: false });
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
                <span className="min-w-0 truncate">
                  {cand.nome}
                  {cand.partido ? ` · ${cand.partido}` : ""}
                  {cand.numero ? ` · ${cand.numero}` : ""}
                </span>
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
            <span className="truncate">
              {cand.nome}
              {cand.partido ? ` · ${cand.partido}` : ""}
            </span>
            <span className="tabular-nums">{percentual(razao(cand.votos, resultado.totais.votosValidos), 2, idioma)}</span>
          </span>
        ))}
      </span>
    </span>
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
      {varredura.erro && (
        <AvisoErro texto={varredura.erro === "limite" ? copy.erroLimite : copy.erroSoma} rastreio={varredura.rastreio} />
      )}
      {resultado ? <Disputa resultado={resultado} /> : <p className="text-sm text-[var(--muted)]">{copy.aindaNao}</p>}
      {falhas > 0 && <p className="text-sm">{copy.falhas(falhas)}</p>}
    </section>
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
