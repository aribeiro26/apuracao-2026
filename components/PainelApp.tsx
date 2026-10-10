"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { carregarPainel, lerLoteMunicipios, lerMunicipio, municipiosDoEstado } from "@/app/acoes";
import { Apresentador } from "@/components/Apresentador";
import { usePresenca } from "@/components/Presenca";
import { BotoesVoto, CaixaVisitantes, EnqueteTela, useAudiencia } from "@/components/Audiencia";
import { DataTurno } from "@/components/DataTurno";
import { Perguntas } from "@/components/Perguntas";
import { Vitoria } from "@/components/Vitoria";
import { CandidatoCard } from "@/components/CandidatoCard";
import { GraficoEstados, MapaBrasil, MensagemPlacar, MosaicoMunicipios, primeiroNome, textoDaFrente } from "@/components/DisputaVisual";
import { BotaoDoar } from "@/components/Doar";
import { BotaoTema, SeletorIdioma, useI18n } from "@/components/LocaleProvider";
import { somarCidades, type Candidato, type CidadeApurada, type Modo, type Resultado } from "@/lib/conta";
import { cenarioDaDisputa, contarLados, eleitosDaApuracao, parDaDisputa, quemLidera, vencedorLocal, type EleitoLista } from "@/lib/placar";
import { montarPerguntas } from "@/lib/perguntas-apresentador";
import { rastreioVisivel } from "@/lib/texto";
import { iniciais, numero, percentual, razao } from "@/lib/format";
import { intlLocale, LOCALES, nomeLocale } from "@/lib/locale";
import { diasParaEleicao, faseEleicao } from "@/lib/eleicao";
import { UFS, UFS_PRESIDENTE, nomeLocal } from "@/lib/uf";

type Visao = "tudo" | "presidente" | "governador" | "eleitos";
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
    if (!uf || mun || visao === "eleitos") return;
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
    if (!uf || !mun || visao === "eleitos") {
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
    const cenario = cenarioDaDisputa(par, nacional);
    if (cenario.tipo === "eleito") frases.unshift(copy.cenarioEleito(primeiroNome(cenario.nome)));
    else if (lider) frases.push(apurado >= 99.5 ? copy.opiniaoFecha(primeiroNome(lider.nome)) : copy.opiniaoAberta(primeiroNome(lider.nome)));
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

  const { resumo, setResumo, pronto } = useAudiencia();
  const fecharEnquete = useCallback(() => {
    if (pathname === "/enquete") {
      router.replace("/", { scroll: false });
      return;
    }
    const consulta = new URLSearchParams(params.toString());
    consulta.delete("enquete");
    const texto = consulta.toString();
    router.replace(texto ? `${pathname}?${texto}` : pathname, { scroll: false });
  }, [params, pathname, router]);
  const placa = useMemo(() => {
    if (!painel) return null;
    if (visao === "governador") {
      if (!uf || uf === "zz") return null;
      if (mun && cidadeGovernador) return cidadeGovernador;
      return placaLocal(painel.governadores.find((item) => item.uf === uf) ?? null, governadorUf, "governador");
    }
    if (mun && cidadePresidente) return cidadePresidente;
    if (uf && uf !== "zz") return placaLocal(painel.unidades.find((item) => item.uf === uf) ?? null, presidenteUf, "presidente");
    return nacional;
  }, [painel, visao, uf, mun, cidadeGovernador, cidadePresidente, governadorUf, presidenteUf, nacional]);

  const perguntas = useMemo(() => {
    const alvo = placa && parDaDisputa(placa.candidatos) ? placa : nacional;
    const nomeCidade = municipios.find((item) => item.codigo === mun)?.nome;
    const lugarNome = nomeCidade || alvo?.nomeUf || "";
    const lugar = alvo ? (alvo.cargo === "governador" ? copy.governadorEm(lugarNome) : copy.presidenteEm(lugarNome)) : "";
    return montarPerguntas({
      copy,
      idioma,
      lugar,
      resultado: alvo,
      unidades: painel?.unidades ?? [],
      cidades: visao === "governador" ? governadorUf.cidades : presidenteUf.cidades,
      eleitos: painel ? eleitosDaApuracao([painel.presidente, ...painel.governadores]) : [],
    });
  }, [placa, nacional, municipios, mun, copy, idioma, visao, governadorUf.cidades, presidenteUf.cidades, painel]);

  return (
    <>
    <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--paper)] focus:px-4 focus:py-2">
      {copy.pularParaConteudo}
    </a>
    <EnqueteTela
      aberta={pathname === "/enquete" || params.get("enquete") === "1"}
      par={nacional ? parDaDisputa(nacional.candidatos) : null}
      resumo={resumo}
      pronto={pronto}
      onContado={setResumo}
      onFechar={fecharEnquete}
    />
    <Vitoria resultado={placa} />
    <BarraUrnas apuradas={urnas?.apuradas ?? 0} total={urnas?.total ?? 0} />
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6">
      <main id="conteudo">
      <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--green)]">{copy.kicker}</p>
          <h1 className="mt-1 font-serif text-4xl leading-none sm:text-5xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">{copy.lead}</p>
          <BotoesVoto par={nacional ? parDaDisputa(nacional.candidatos) : null} resumo={resumo} onContado={setResumo} />
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <CaixaVisitantes resumo={resumo} />
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <SeletorIdioma />
          <BotaoTema />
          <BotaoDoar />
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm" role="status">
            <span className={`pulso h-2.5 w-2.5 rounded-full ${aoVivo ? "animate-pulse bg-[var(--green)]" : "bg-[var(--mark)]"}`} aria-hidden="true" />
            {aoVivo ? copy.live : copy.waiting}
            {atualizadoCliente ? ` · ${copy.readAt(atualizadoCliente)}` : ""}
          </p>
          </div>
        </div>
      </header>

      <DataTurno />
      <Perguntas resultado={placa ?? nacional} />

      <nav className="sticky top-16 z-20 -mx-4 mt-6 border-y border-[var(--line)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6" aria-label={copy.filtroVisao}>
        <div className="grid gap-3 md:grid-cols-[auto_1fr_1fr]">
          <div className="flex flex-wrap rounded-full bg-[var(--paper)] p-1" role="group" aria-label={copy.filtroVisao}>
            {(["tudo", "presidente", "governador", "eleitos"] as Visao[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={visao === item}
                onClick={() => navegar(item === "eleitos" ? { visao: "eleitos", uf: "", mun: "" } : { visao: item })}
                className={`min-h-11 rounded-full px-3 text-sm ${visao === item ? "bg-[var(--ink)] text-[var(--paper)]" : ""}`}
              >
                {rotuloVisao(item, copy)}
              </button>
            ))}
          </div>
          <label className="block text-sm" htmlFor="filtro-estado">
            <span className="mb-1 block text-[var(--muted)]">{copy.estado}</span>
            <select
              id="filtro-estado"
              aria-label={copy.estado}
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
          <label className="block text-sm" htmlFor="filtro-municipio">
            <span className="mb-1 block text-[var(--muted)]">{copy.municipio}</span>
            <select
              id="filtro-municipio"
              aria-label={copy.municipio}
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
      </nav>

      {erroPainel && (
        <AvisoErro texto={erroPainel.codigo === "limite" ? copy.erroLimite : copy.erroRede} rastreio={erroPainel.rastreio} />
      )}
      {erroLocal && (
        <AvisoErro texto={erroLocal.codigo === "limite" ? copy.erroLimite : copy.erroMunicipio} rastreio={erroLocal.rastreio} />
      )}

      {!painel && !erroPainel && <p className="mt-8 text-[var(--muted)]" role="status">{copy.lendo}</p>}

      {painel && visao === "eleitos" && (
        <div className="mt-8">
          <ListaEleitos
            painel={painel}
            onAbrir={(item) =>
              navegar({
                visao: item.resultado.cargo,
                uf: item.resultado.cargo === "presidente" || item.resultado.uf === "br" ? "" : item.resultado.uf,
                mun: "",
              })
            }
          />
        </div>
      )}

      {painel && !uf && visao !== "eleitos" && (
        <div className="mt-8 space-y-10">
          {visao === "tudo" && (
            <ListaEleitos
              painel={painel}
              onAbrir={(item) =>
                navegar({
                  visao: item.resultado.cargo,
                  uf: item.resultado.cargo === "presidente" || item.resultado.uf === "br" ? "" : item.resultado.uf,
                  mun: "",
                })
              }
            />
          )}
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
                <button type="button" className="min-h-11 self-start text-sm underline" aria-pressed={!soSegundo} onClick={() => setSoSegundo((valor) => !valor)}>
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

      {painel && uf && !mun && visao !== "eleitos" && (
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
              <label className="block text-sm" htmlFor="busca-cidade">
                <span className="mb-1 block text-[var(--muted)]">{copy.buscarSoma}</span>
                <input
                  id="busca-cidade"
                  type="search"
                  aria-label={copy.buscarSoma}
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

      {painel && uf && mun && visao !== "eleitos" && (
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

      </main>
      <footer className="mt-12 border-t border-[var(--line)] pt-4 text-sm text-[var(--muted)]">
        <p>{copy.rodape}</p>
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1" aria-label={copy.idioma}>
          {LOCALES.map((item) => (
            <a key={item} href={`/?hl=${item}`} hrefLang={intlLocale(item)} lang={intlLocale(item)} aria-current={locale === item ? "true" : undefined}>
              {nomeLocale(item)}
            </a>
          ))}
          <a href="/monitor">Monitor</a>
        </nav>
      </footer>
      <MarcaPresenca />
      <Apresentador linhas={falas} perguntas={perguntas} />
    </div>
    </>
  );
}

function placaLocal(oficial: Resultado | null, varredura: Varredura, cargo: CargoLocal): Resultado | null {
  if (!oficial) return null;
  if (!varredura.pronta) return oficial;
  const soma = somarCidades(cargo, oficial.uf, varredura.cidades, { modo: varredura.modo, turno: varredura.turno });
  if (!soma) return oficial;
  return { ...soma, cargo: oficial.cargo, modo: varredura.modo, turno: varredura.turno, nomeUf: oficial.nomeUf };
}

function BarraUrnas({ apuradas, total }: { apuradas: number; total: number }) {
  const { copy, locale } = useI18n();
  const idioma = intlLocale(locale);
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setAgora(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const pct = total > 0 ? (apuradas / total) * 100 : 0;
  const texto = copy.urnas(percentual(pct, 1, idioma));
  const fase = faseEleicao(agora);
  const dias = diasParaEleicao(agora);
  const contador =
    fase === "antes" ? (
      <>
        <span className="font-serif text-2xl tabular-nums leading-none">{dias}</span> {copy.sufixoDias(dias)}
      </>
    ) : fase === "hoje" ? (
      copy.eleicaoHoje
    ) : fase === "aberta" ? (
      copy.votacaoAberta
    ) : (
      copy.votacaoEncerrou
    );
  return (
    <div className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:px-6">
        <p className="text-sm font-medium" role="status">
          {contador}
        </p>
        <p className="shrink-0 text-sm font-medium tabular-nums">{texto}</p>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 pb-2 sm:px-6">
        <div
          className="h-2.5 overflow-hidden rounded-full bg-[var(--track)]"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={texto}
        >
          <div className="h-full bg-[var(--acao)]" style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      </div>
    </div>
  );
}

function AvisoErro({ texto, rastreio }: { texto: string; rastreio: string }) {
  const { copy } = useI18n();
  const id = rastreioVisivel(rastreio);
  return (
    <p className="mt-4 rounded-2xl bg-[var(--danger-bg)] px-4 py-3 text-sm" role="alert">
      {texto}
      {id ? <span className="mt-1 block font-mono text-xs">{copy.rastreio(id)}</span> : null}
    </p>
  );
}

function visaoDe(valor: string | null): Visao {
  if (valor === "presidente" || valor === "governador" || valor === "eleitos") return valor;
  return "tudo";
}

function rotuloVisao(item: Visao, copy: { tudo: string; presidente: string; governador: string; eleitos: string }): string {
  if (item === "presidente") return copy.presidente;
  if (item === "governador") return copy.governador;
  if (item === "eleitos") return copy.eleitos;
  return copy.tudo;
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

function ListaEleitos({ painel, onAbrir }: { painel: Painel; onAbrir: (item: EleitoLista) => void }) {
  const { copy, locale } = useI18n();
  const idioma = intlLocale(locale);
  const [turno, setTurno] = useState<0 | 1 | 2>(0);
  const todos = useMemo(
    () => eleitosDaApuracao([painel.presidente, ...painel.governadores]),
    [painel],
  );
  const visiveis = useMemo(() => {
    const base = turno === 0 ? todos : todos.filter((item) => item.turno === turno);
    return base.slice().sort((a, b) => {
      if (a.resultado.cargo !== b.resultado.cargo) return a.resultado.cargo === "presidente" ? -1 : 1;
      const lugar = (item: EleitoLista) => (item.resultado.cargo === "presidente" ? "" : nomeLocal(item.resultado.uf, locale));
      return lugar(a).localeCompare(lugar(b), idioma);
    });
  }, [todos, turno, locale, idioma]);
  const filtros = [
    { id: 0 as const, rotulo: copy.filtroTodosTurnos },
    { id: 1 as const, rotulo: copy.turno1 },
    { id: 2 as const, rotulo: copy.turno2 },
  ];
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl">{copy.eleitosTitulo}</h2>
          <p className="text-sm text-[var(--muted)]">{copy.eleitosConta(visiveis.length)}</p>
        </div>
        <div className="flex flex-wrap rounded-full bg-[var(--paper)] p-1" role="group" aria-label={copy.filtroTurno}>
          {filtros.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={turno === item.id}
              onClick={() => setTurno(item.id)}
              className={`min-h-11 rounded-full px-3 text-sm ${turno === item.id ? "bg-[var(--ink)] text-[var(--paper)]" : ""}`}
            >
              {item.rotulo}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-[var(--muted)]">{copy.eleitosNota}</p>
      {visiveis.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{copy.eleitosVazio}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((item) => {
            const lugar = item.resultado.cargo === "presidente" ? copy.brasilInteiro : nomeLocal(item.resultado.uf, locale);
            const cargo = item.resultado.cargo === "presidente" ? copy.presidente : copy.governador;
            return (
              <li key={`${item.resultado.cargo}:${item.resultado.uf}:${item.candidato.sqcand}`}>
                <button
                  type="button"
                  onClick={() => onAbrir(item)}
                  className="flex w-full items-center gap-3 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4 text-left shadow-card"
                >
                  <FotoEleito nome={item.candidato.nome} fotos={item.candidato.fotos} />
                  <span className="min-w-0">
                    <span className="block truncate font-serif text-xl leading-tight">{item.candidato.nome}</span>
                    <span className="mt-1 block truncate text-sm text-[var(--muted)]">
                      {cargo} · {lugar} · {item.turno === 2 ? copy.turno2 : copy.turno1}
                    </span>
                    <span className="mt-1 block text-sm tabular-nums">
                      {percentual(razao(item.candidato.votos, item.resultado.totais.votosValidos), 2, idioma)}
                      {" · "}
                      {numero(item.candidato.votos, idioma)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function FotoEleito({ nome, fotos }: { nome: string; fotos: string[] }) {
  const { copy } = useI18n();
  const [indice, setIndice] = useState(0);
  const candidato = fotos[indice];
  const src = candidato?.startsWith("https://resultados.tse.jus.br/") ? candidato : "";
  if (!src) {
    return (
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--track)] text-sm font-semibold">
        {iniciais(nome)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={copy.fotoAlt(nome)}
      width={56}
      height={56}
      className="h-14 w-14 shrink-0 rounded-full object-cover"
      onError={() => setIndice((atual) => atual + 1)}
    />
  );
}

function MarcaPresenca() {
  const { marcar } = usePresenca();
  useLayoutEffect(() => {
    marcar(true);
    return () => marcar(false);
  }, [marcar]);
  return null;
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


