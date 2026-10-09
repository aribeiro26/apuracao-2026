import { nomeUf } from "./uf";

export type Cargo = "presidente" | "governador";
export type Modo = "ao-vivo" | "aguardando" | "definido";
export type Fase = "eleito" | "segundo-turno" | "nao-eleito" | "outro";

export type Candidato = {
  sqcand: string;
  nome: string;
  nomeCompleto: string | null;
  numero: string;
  partido: string;
  vice: string | null;
  votos: number;
  pctTse: number;
  situacao: string;
  fase: Fase;
  fotos: string[];
};

export type Totais = {
  eleitorado: number;
  comparecimento: number;
  abstencao: number;
  votosValidos: number;
  brancos: number;
  nulos: number;
  secoesTotal: number;
  secoesApuradas: number;
};

export type Resultado = {
  cargo: Cargo;
  uf: string;
  nomeUf: string;
  modo: Modo;
  turno: 1 | 2;
  codigoEleicao: string;
  codigoPrimeiroTurno: string;
  atualizadoEm: string;
  url: string;
  totais: Totais;
  candidatos: Candidato[];
};

export type MunicipioRef = {
  codigo: string;
  ibge: string;
  nome: string;
  capital: boolean;
};

export type CidadeApurada = MunicipioRef & {
  ok: boolean;
  atualizadoEm: string | null;
  totais: Totais | null;
  candidatos: Candidato[] | null;
};

export type Diferenca = {
  votosValidos: number;
  candidatos: { sqcand: string; nome: string; delta: number }[];
};

export function faseDe(situacao: string): Fase {
  const texto = situacao
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  if (texto.startsWith("eleit")) return "eleito";
  if (texto.includes("turno") && (texto.includes("segundo") || texto.includes("2"))) return "segundo-turno";
  if (texto.includes("nao eleito")) return "nao-eleito";
  return "outro";
}

export function totaisVazios(): Totais {
  return {
    eleitorado: 0,
    comparecimento: 0,
    abstencao: 0,
    votosValidos: 0,
    brancos: 0,
    nulos: 0,
    secoesTotal: 0,
    secoesApuradas: 0,
  };
}

export function somarCidades(
  cargo: Cargo,
  uf: string,
  cidades: CidadeApurada[],
  meta?: { modo: Modo; turno: 1 | 2 },
): Resultado | null {
  const validas = cidades.filter((cidade) => cidade.ok && cidade.totais && cidade.candidatos);
  if (!validas.length) return null;
  const totais = totaisVazios();
  const porCandidato = new Map<string, Candidato>();
  for (const cidade of validas) {
    const bloco = cidade.totais as Totais;
    totais.eleitorado += bloco.eleitorado;
    totais.comparecimento += bloco.comparecimento;
    totais.abstencao += bloco.abstencao;
    totais.votosValidos += bloco.votosValidos;
    totais.brancos += bloco.brancos;
    totais.nulos += bloco.nulos;
    totais.secoesTotal += bloco.secoesTotal;
    totais.secoesApuradas += bloco.secoesApuradas;
    for (const cand of cidade.candidatos ?? []) {
      const atual = porCandidato.get(cand.sqcand);
      if (!atual) porCandidato.set(cand.sqcand, { ...cand, pctTse: 0 });
      else atual.votos += cand.votos;
    }
  }
  return {
    cargo,
    uf,
    nomeUf: nomeUf(uf),
    modo: meta?.modo ?? "aguardando",
    turno: meta?.turno ?? 1,
    codigoEleicao: "",
    codigoPrimeiroTurno: "",
    atualizadoEm: "",
    url: "",
    totais,
    candidatos: [...porCandidato.values()].sort((a, b) => b.votos - a.votos),
  };
}

export function somarResultados(base: Resultado, partes: Resultado[]): Resultado {
  const totais = totaisVazios();
  const porCandidato = new Map<string, Candidato>();
  for (const parte of partes) {
    totais.eleitorado += parte.totais.eleitorado;
    totais.comparecimento += parte.totais.comparecimento;
    totais.abstencao += parte.totais.abstencao;
    totais.votosValidos += parte.totais.votosValidos;
    totais.brancos += parte.totais.brancos;
    totais.nulos += parte.totais.nulos;
    totais.secoesTotal += parte.totais.secoesTotal;
    totais.secoesApuradas += parte.totais.secoesApuradas;
    for (const cand of parte.candidatos) {
      const atual = porCandidato.get(cand.sqcand);
      if (!atual) porCandidato.set(cand.sqcand, { ...cand, pctTse: 0 });
      else atual.votos += cand.votos;
    }
  }
  return {
    ...base,
    uf: "br",
    nomeUf: "Brasil",
    atualizadoEm: "",
    url: "",
    totais,
    candidatos: [...porCandidato.values()].sort((a, b) => b.votos - a.votos),
  };
}

export function comparar(
  soma: Pick<Resultado, "totais" | "candidatos">,
  oficial: Pick<Resultado, "totais" | "candidatos">,
): Diferenca {
  const oficiais = new Map(oficial.candidatos.map((cand) => [cand.sqcand, cand.votos]));
  const ids = new Set<string>([...soma.candidatos.map((cand) => cand.sqcand), ...oficiais.keys()]);
  return {
    votosValidos: soma.totais.votosValidos - oficial.totais.votosValidos,
    candidatos: [...ids].map((sqcand) => {
      const daSoma = soma.candidatos.find((cand) => cand.sqcand === sqcand);
      return {
        sqcand,
        nome: daSoma?.nome ?? oficial.candidatos.find((cand) => cand.sqcand === sqcand)?.nome ?? sqcand,
        delta: (daSoma?.votos ?? 0) - (oficiais.get(sqcand) ?? 0),
      };
    }),
  };
}
