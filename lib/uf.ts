export type Uf = {
  sigla: string;
  nome: string;
  regiao: string;
};

/** Unidades que votam para governador. `zz` é o voto no exterior, só na eleição presidencial. */
export const UFS: Uf[] = [
  { sigla: "ac", nome: "Acre", regiao: "Norte" },
  { sigla: "al", nome: "Alagoas", regiao: "Nordeste" },
  { sigla: "ap", nome: "Amapá", regiao: "Norte" },
  { sigla: "am", nome: "Amazonas", regiao: "Norte" },
  { sigla: "ba", nome: "Bahia", regiao: "Nordeste" },
  { sigla: "ce", nome: "Ceará", regiao: "Nordeste" },
  { sigla: "df", nome: "Distrito Federal", regiao: "Centro-Oeste" },
  { sigla: "es", nome: "Espírito Santo", regiao: "Sudeste" },
  { sigla: "go", nome: "Goiás", regiao: "Centro-Oeste" },
  { sigla: "ma", nome: "Maranhão", regiao: "Nordeste" },
  { sigla: "mt", nome: "Mato Grosso", regiao: "Centro-Oeste" },
  { sigla: "ms", nome: "Mato Grosso do Sul", regiao: "Centro-Oeste" },
  { sigla: "mg", nome: "Minas Gerais", regiao: "Sudeste" },
  { sigla: "pa", nome: "Pará", regiao: "Norte" },
  { sigla: "pb", nome: "Paraíba", regiao: "Nordeste" },
  { sigla: "pr", nome: "Paraná", regiao: "Sul" },
  { sigla: "pe", nome: "Pernambuco", regiao: "Nordeste" },
  { sigla: "pi", nome: "Piauí", regiao: "Nordeste" },
  { sigla: "rj", nome: "Rio de Janeiro", regiao: "Sudeste" },
  { sigla: "rn", nome: "Rio Grande do Norte", regiao: "Nordeste" },
  { sigla: "rs", nome: "Rio Grande do Sul", regiao: "Sul" },
  { sigla: "ro", nome: "Rondônia", regiao: "Norte" },
  { sigla: "rr", nome: "Roraima", regiao: "Norte" },
  { sigla: "sc", nome: "Santa Catarina", regiao: "Sul" },
  { sigla: "sp", nome: "São Paulo", regiao: "Sudeste" },
  { sigla: "se", nome: "Sergipe", regiao: "Nordeste" },
  { sigla: "to", nome: "Tocantins", regiao: "Norte" },
];

export const EXTERIOR: Uf = { sigla: "zz", nome: "Exterior", regiao: "Exterior" };

export const UFS_PRESIDENTE: Uf[] = [...UFS, EXTERIOR];

const POR_SIGLA = new Map(UFS_PRESIDENTE.map((uf) => [uf.sigla, uf]));

export function ufValida(sigla: string): boolean {
  return POR_SIGLA.has(sigla);
}

const NOMES: Record<string, Partial<Record<"pt-BR" | "pt-PT" | "es" | "en", string>>> = {
  zz: { "pt-BR": "Exterior", "pt-PT": "Estrangeiro", es: "Extranjero", en: "Abroad" },
  df: { en: "Federal District", es: "Distrito Federal", "pt-PT": "Distrito Federal" },
};

export function nomeUf(sigla: string): string {
  return POR_SIGLA.get(sigla)?.nome ?? sigla.toUpperCase();
}

export function nomeLocal(sigla: string, locale: "pt-BR" | "pt-PT" | "es" | "en"): string {
  return NOMES[sigla]?.[locale] ?? nomeUf(sigla);
}
