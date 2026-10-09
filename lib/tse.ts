import { faseDe, somarResultados, type Candidato, type Cargo, type CidadeApurada, type Modo, type MunicipioRef, type Resultado, type Totais } from "./conta";
import { titlePt } from "./format";
import { soDigitos, textoPlano } from "./texto";
import { EXTERIOR, UFS, UFS_PRESIDENTE, nomeUf, ufValida } from "./uf";

export type { Candidato, Cargo, CidadeApurada, Diferenca, Fase, Modo, MunicipioRef, Resultado, Totais } from "./conta";
export { comparar, somarCidades, somarResultados } from "./conta";

export const BASE = "https://resultados.tse.jus.br/oficial";
export const CONFIG_URL = `${BASE}/comum/config/ele-c.json`;
const CICLO = "ele2026";
const USER_AGENT =
  "apuracao-segundo-turno/1.0 (+painel civico educacional; cache curto; sem raspar o Brasil inteiro)";

type Alvo = {
  codigo: string;
  turno: 1 | 2;
  nome: string;
  data: string;
};

type ParEleicao = { primeiro: Alvo; segundo: Alvo | null; segundoListado: boolean };

type EleC = {
  pl?: {
    c?: string;
    dt?: string;
    e?: {
      cd?: string;
      cdt2?: string;
      nm?: string;
      t?: string;
      abr?: { cp?: { cd?: string }[] }[];
    }[];
  }[];
};

type RawCand = {
  n?: string;
  sqcand?: string;
  nm?: string;
  nmu?: string;
  st?: string;
  vap?: string;
  pvap?: string;
  vs?: { tp?: string; nm?: string; nmu?: string }[];
};

type RawResultado = {
  t?: string;
  dg?: string;
  hg?: string;
  carg?: {
    cd?: string;
    agr?: {
      com?: string;
      par?: { sg?: string; cand?: RawCand[] }[];
    }[];
  }[];
  s?: { ts?: string; st?: string };
  e?: { te?: string; c?: string; a?: string };
  v?: { vv?: string; vb?: string; tvn?: string };
};

export class NaoPublicado extends Error {}
export class PedidoInvalido extends Error {}

const CARGO_CODIGO: Record<Cargo, number> = { presidente: 1, governador: 3 };

export function validarUf(uf: string, cargo: Cargo): string {
  const sigla = uf.trim().toLowerCase();
  if (!ufValida(sigla)) throw new PedidoInvalido("Estado inválido.");
  if (cargo === "governador" && sigla === EXTERIOR.sigla) {
    throw new PedidoInvalido("Não há eleição para governador no exterior.");
  }
  if (!UFS.some((item) => item.sigla === sigla) && sigla !== EXTERIOR.sigla) {
    throw new PedidoInvalido("Estado inválido.");
  }
  return sigla;
}

function inteiro(valor: unknown): number {
  if (valor == null || valor === "") return 0;
  const numero = Number(String(valor).replace(/\./g, ""));
  return Number.isFinite(numero) ? numero : 0;
}

function percentualTse(valor: unknown): number {
  if (valor == null || valor === "") return 0;
  const numero = Number(String(valor).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(numero) ? numero : 0;
}

function rotulo(valor: unknown, vazio = ""): string {
  const limpo = textoPlano(valor, 80);
  if (!limpo) return vazio;
  return titlePt(limpo);
}

function urlsFoto(codigo: string, codigoPrimeiro: string, pasta: string, sqcand: string): string[] {
  if (!/^\d{1,8}$/.test(codigo) || !/^\d{1,8}$/.test(codigoPrimeiro)) return [];
  if (!/^[a-z]{2}$/.test(pasta)) return [];
  if (!/^\d{1,12}$/.test(sqcand)) return [];
  const montar = (eleicao: string, uf: string) =>
    `${BASE}/${CICLO}/${eleicao}/fotos/${uf}/${sqcand}.jpeg`;
  const pastas = pasta === "br" ? ["br"] : [pasta, "br"];
  const codigos = codigo === codigoPrimeiro ? [codigo] : [codigo, codigoPrimeiro];
  const urls: string[] = [];
  for (const eleicao of codigos) {
    for (const uf of pastas) urls.push(montar(eleicao, uf));
  }
  return urls;
}

function totaisDe(raw: RawResultado): Totais {
  const eleitorado = inteiro(raw.e?.te);
  const comparecimento = inteiro(raw.e?.c);
  const abstencaoInformada = inteiro(raw.e?.a);
  return {
    eleitorado,
    comparecimento,
    abstencao: abstencaoInformada || Math.max(0, eleitorado - comparecimento),
    votosValidos: inteiro(raw.v?.vv),
    brancos: inteiro(raw.v?.vb),
    nulos: inteiro(raw.v?.tvn),
    secoesTotal: inteiro(raw.s?.ts),
    secoesApuradas: inteiro(raw.s?.st),
  };
}

function candidatosDe(
  raw: RawResultado,
  cargo: Cargo,
  uf: string,
  codigo: string,
  codigoPrimeiro: string,
): Candidato[] {
  const codigoCargo = String(CARGO_CODIGO[cargo]);
  const pasta = cargo === "presidente" ? "br" : uf;
  const lista: Candidato[] = [];
  for (const bloco of raw.carg ?? []) {
    if (String(bloco.cd) !== codigoCargo) continue;
    for (const grupo of bloco.agr ?? []) {
      for (const partido of grupo.par ?? []) {
        for (const cand of partido.cand ?? []) {
          const vice = (cand.vs ?? []).find((pessoa) => pessoa.tp === "v");
          const sqcand = soDigitos(cand.sqcand, 12);
          const nomeVice = vice ? rotulo(vice.nmu || vice.nm) : "";
          lista.push({
            sqcand,
            nome: rotulo(cand.nmu || cand.nm, "Candidato"),
            nomeCompleto: cand.nmu && cand.nm ? rotulo(cand.nm) : null,
            numero: soDigitos(cand.n, 6),
            partido: textoPlano(partido.sg, 24).toUpperCase(),
            vice: nomeVice || null,
            votos: inteiro(cand.vap),
            pctTse: percentualTse(cand.pvap),
            situacao: textoPlano(cand.st, 40),
            fase: faseDe(textoPlano(cand.st, 40)),
            fotos: sqcand ? urlsFoto(codigo, codigoPrimeiro, pasta, sqcand) : [],
          });
        }
      }
    }
  }
  lista.sort((a, b) => b.votos - a.votos);
  return lista;
}

function modoDe(turno: 1 | 2, candidatos: Candidato[]): Modo {
  if (turno === 2) return "ao-vivo";
  const segue = candidatos.some((cand) => cand.fase === "segundo-turno");
  const eleito = candidatos.some((cand) => cand.fase === "eleito");
  if (segue && !eleito) return "aguardando";
  return "definido";
}

async function baixarJson<T>(url: string, segundos: number): Promise<T> {
  const resposta = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    next: { revalidate: segundos },
  });
  if (resposta.status === 404) throw new NaoPublicado(url);
  if ((resposta.status === 429 || resposta.status >= 500) && segundos > 0) {
    const nova = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      cache: "no-store",
    });
    if (nova.status === 404) throw new NaoPublicado(url);
    if (!nova.ok) throw new Error(`TSE respondeu ${nova.status}`);
    return (await nova.json()) as T;
  }
  if (!resposta.ok) throw new Error(`TSE respondeu ${resposta.status}`);
  return (await resposta.json()) as T;
}

export async function mapPool<T, R>(
  itens: T[],
  limite: number,
  fn: (item: T, indice: number) => Promise<R>,
): Promise<R[]> {
  const saida = new Array<R>(itens.length);
  let proximo = 0;
  async function trabalhador() {
    for (;;) {
      const atual = proximo;
      proximo += 1;
      if (atual >= itens.length) return;
      saida[atual] = await fn(itens[atual], atual);
    }
  }
  const trabalhadores = Math.max(1, Math.min(limite, itens.length));
  await Promise.all(Array.from({ length: trabalhadores }, () => trabalhador()));
  return saida;
}

function eleicoesDoCargo(cfg: EleC, cargo: Cargo): ParEleicao {
  const codigo = CARGO_CODIGO[cargo];
  const encontradas: Alvo[] = [];
  let segundoInferido: Alvo | null = null;
  for (const pleito of cfg.pl ?? []) {
    if (!pleito.dt?.endsWith("2026")) continue;
    for (const eleicao of pleito.e ?? []) {
      const nome = eleicao.nm ?? "";
      if (!nome.toLowerCase().includes("ordin")) continue;
      const cargos = new Set<number>();
      for (const abr of eleicao.abr ?? []) {
        for (const cp of abr.cp ?? []) cargos.add(Number(cp.cd));
      }
      if (!cargos.has(codigo) || !eleicao.cd) continue;
      const alvo: Alvo = {
        codigo: eleicao.cd,
        turno: Number(eleicao.t) === 2 ? 2 : 1,
        nome,
        data: pleito.dt,
      };
      encontradas.push(alvo);
      if (alvo.turno === 1 && eleicao.cdt2) {
        segundoInferido = {
          codigo: eleicao.cdt2,
          turno: 2,
          nome: nome.replace("1º Turno", "2º Turno").replace("1° Turno", "2º Turno"),
          data: "25/10/2026",
        };
      }
    }
  }
  const primeiro = encontradas.find((item) => item.turno === 1);
  if (!primeiro) {
    throw new NaoPublicado("O TSE não listou a eleição de 2026 no arquivo de configuração.");
  }
  const segundoDireto = encontradas.find((item) => item.turno === 2) ?? null;
  return { primeiro, segundo: segundoDireto ?? segundoInferido, segundoListado: Boolean(segundoDireto) };
}

async function configuracao(): Promise<EleC> {
  return baixarJson<EleC>(CONFIG_URL, 300);
}

export async function alvos(cargo: Cargo): Promise<ParEleicao> {
  return eleicoesDoCargo(await configuracao(), cargo);
}

function urlAgregado(codigo: string, cargo: Cargo, uf: string): string {
  const numero = CARGO_CODIGO[cargo];
  return `${BASE}/${CICLO}/${codigo}/dados/${uf}/${uf}-c${String(numero).padStart(4, "0")}-e${codigo.padStart(6, "0")}-u.json`;
}

function urlDaCidade(codigo: string, cargo: Cargo, uf: string, codigoMunicipio: string): string {
  const numero = CARGO_CODIGO[cargo];
  return `${BASE}/${CICLO}/${codigo}/dados/${uf}/${uf}${codigoMunicipio}-c${String(numero).padStart(4, "0")}-e${codigo.padStart(6, "0")}-u.json`;
}

async function lerArquivo(
  alvo: Alvo,
  primeiro: Alvo,
  cargo: Cargo,
  uf: string,
  url: string,
): Promise<Resultado> {
  const raw = await baixarJson<RawResultado>(url, 20);
  const candidatos = candidatosDe(raw, cargo, uf, alvo.codigo, primeiro.codigo);
  const turnoArquivo: 1 | 2 = raw.t === "2" || alvo.turno === 2 ? 2 : 1;
  return {
    cargo,
    uf,
    nomeUf: uf === "br" ? "Brasil" : nomeUf(uf),
    modo: modoDe(turnoArquivo, candidatos),
    turno: turnoArquivo,
    codigoEleicao: alvo.codigo,
    codigoPrimeiroTurno: primeiro.codigo,
    atualizadoEm: textoPlano(`${raw.dg ?? ""} ${raw.hg ?? ""}`, 40),
    url,
    totais: totaisDe(raw),
    candidatos,
  };
}

export async function obterResultado(cargo: Cargo, uf: string): Promise<Resultado> {
  const sigla = uf === "br" ? "br" : validarUf(uf, cargo);
  const par = await alvos(cargo);
  if (par.segundo && par.segundoListado) {
    try {
      return await lerArquivo(par.segundo, par.primeiro, cargo, sigla, urlAgregado(par.segundo.codigo, cargo, sigla));
    } catch (erro) {
      if (!(erro instanceof NaoPublicado)) throw erro;
    }
  }
  return lerArquivo(par.primeiro, par.primeiro, cargo, sigla, urlAgregado(par.primeiro.codigo, cargo, sigla));
}

export async function listarMunicipios(cargo: Cargo, uf: string): Promise<MunicipioRef[]> {
  const sigla = validarUf(uf, cargo);
  const par = await alvos(cargo);
  const codigos = [par.primeiro.codigo];
  if (cargo === "governador") {
    const federal = await alvos("presidente");
    codigos.push(federal.primeiro.codigo);
  }
  let ultimoErro: unknown;
  for (const codigo of codigos) {
    const url = `${BASE}/${CICLO}/${codigo}/config/mun-e${codigo.padStart(6, "0")}-cm.json`;
    try {
      const cfg = await baixarJson<{ abr?: { cd?: string; mu?: { cd?: string; cdi?: string; nm?: string; c?: string }[] }[] }>(url, 3600);
      const bloco = (cfg.abr ?? []).find((item) => item.cd?.toLowerCase() === sigla);
      if (!bloco) continue;
      return (bloco.mu ?? [])
        .filter((mu) => /^\d{5}$/.test(mu.cd ?? "") && mu.nm)
        .map((mu) => ({
          codigo: mu.cd as string,
          ibge: soDigitos(mu.cdi, 8),
          nome: rotulo(mu.nm, "Município"),
          capital: (mu.c ?? "").toLowerCase() === "s",
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    } catch (erro) {
      ultimoErro = erro;
    }
  }
  throw ultimoErro instanceof Error ? ultimoErro : new NaoPublicado("Lista de municípios indisponível.");
}

async function codigoDaLeitura(cargo: Cargo, uf: string): Promise<{ ativo: Alvo; primeiro: Alvo }> {
  const par = await alvos(cargo);
  if (par.segundo && par.segundoListado) {
    try {
      await baixarJson(urlAgregado(par.segundo.codigo, cargo, uf), 20);
      return { ativo: par.segundo, primeiro: par.primeiro };
    } catch (erro) {
      if (!(erro instanceof NaoPublicado)) throw erro;
    }
  }
  return { ativo: par.primeiro, primeiro: par.primeiro };
}

export async function lerCidade(cargo: Cargo, uf: string, codigoMunicipio: string): Promise<CidadeApurada> {
  const sigla = validarUf(uf, cargo);
  if (!/^\d{5}$/.test(codigoMunicipio)) throw new PedidoInvalido("Município inválido.");
  const municipios = await listarMunicipios(cargo, sigla);
  const municipio = municipios.find((item) => item.codigo === codigoMunicipio);
  if (!municipio) throw new PedidoInvalido("Município não encontrado nesse estado.");
  const { ativo, primeiro } = await codigoDaLeitura(cargo, sigla);
  const url = urlDaCidade(ativo.codigo, cargo, sigla, codigoMunicipio);
  try {
    const resultado = await lerArquivo(ativo, primeiro, cargo, sigla, url);
    return { ...municipio, ok: true, atualizadoEm: resultado.atualizadoEm, totais: resultado.totais, candidatos: resultado.candidatos };
  } catch (erro) {
    if (!(erro instanceof NaoPublicado)) throw erro;
    return { ...municipio, ok: false, atualizadoEm: null, totais: null, candidatos: null };
  }
}

export async function lerLote(
  cargo: Cargo,
  uf: string,
  offset: number,
  limite: number,
): Promise<{ total: number; cidades: CidadeApurada[]; turno: 1 | 2; modo: Modo }> {
  const sigla = validarUf(uf, cargo);
  const municipios = await listarMunicipios(cargo, sigla);
  const inicio = Math.max(0, offset);
  const tamanho = Math.min(8, Math.max(1, limite));
  const fatia = municipios.slice(inicio, inicio + tamanho);
  const { ativo, primeiro } = await codigoDaLeitura(cargo, sigla);
  const cidades = await mapPool(fatia, 6, async (municipio) => {
    try {
      const resultado = await lerArquivo(
        ativo,
        primeiro,
        cargo,
        sigla,
        urlDaCidade(ativo.codigo, cargo, sigla, municipio.codigo),
      );
      return {
        ...municipio,
        ok: true as const,
        atualizadoEm: resultado.atualizadoEm,
        totais: resultado.totais,
        candidatos: resultado.candidatos,
      };
    } catch {
      return { ...municipio, ok: false as const, atualizadoEm: null, totais: null, candidatos: null };
    }
  });
  const oficial = await obterResultado(cargo, sigla);
  return { total: municipios.length, cidades, turno: oficial.turno, modo: oficial.modo };
}

export async function montarPainel(): Promise<{
  presidente: Resultado;
  somaEstados: Resultado;
  unidades: Resultado[];
  governadores: Resultado[];
}> {
  const presidente = await obterResultado("presidente", "br");
  const [governadores, presidenciais] = await Promise.all([
    mapPool(UFS, 8, async (uf) => {
      try {
        return await obterResultado("governador", uf.sigla);
      } catch (erro) {
        if (erro instanceof NaoPublicado) return null;
        throw erro;
      }
    }),
    mapPool(UFS_PRESIDENTE, 8, async (uf) => {
      try {
        return await obterResultado("presidente", uf.sigla);
      } catch (erro) {
        if (erro instanceof NaoPublicado) return null;
        throw erro;
      }
    }),
  ]);
  const unidades = presidenciais.filter((item) => item != null);
  return {
    presidente,
    somaEstados: somarResultados(presidente, unidades),
    unidades,
    governadores: governadores.filter((item) => item != null),
  };
}

