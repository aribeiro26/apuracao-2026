const MINUSCULAS = new Set(["de", "da", "do", "das", "dos", "e"]);

export function titlePt(valor: string): string {
  return valor
    .toLocaleLowerCase("pt-BR")
    .split(/\s+/)
    .filter(Boolean)
    .map((parte, indice) => {
      if (indice > 0 && MINUSCULAS.has(parte)) return parte;
      return parte.charAt(0).toLocaleUpperCase("pt-BR") + parte.slice(1);
    })
    .join(" ");
}

export function semAcento(valor: string): string {
  return valor.normalize("NFD").replace(/\p{M}/gu, "");
}

export function numero(valor: number, locale = "pt-BR"): string {
  return new Intl.NumberFormat(locale).format(Math.round(valor));
}

export function percentual(valor: number, casas = 2, locale = "pt-BR"): string {
  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor)}%`;
}

export function razao(parte: number, total: number): number {
  if (!total) return 0;
  return (parte / total) * 100;
}

const PARTIDO_COR: Record<string, string> = {
  PL: "#1d4ed8",
  PT: "#dc2626",
  PSD: "#15803d",
  PSB: "#d97706",
  REPUBLICANOS: "#047857",
  UNIAO: "#1e3a8a",
  "UNIÃO": "#1e3a8a",
  PP: "#1e40af",
  PSDB: "#1d4ed8",
  MDB: "#166534",
  PDT: "#e11d48",
  PODE: "#0369a1",
  PSOL: "#7e22ce",
  NOVO: "#ea580c",
  AVANTE: "#c2410c",
  MISSAO: "#6d28d9",
  "MISSÃO": "#6d28d9",
  PCDOB: "#b91c1c",
  "PC do B": "#b91c1c",
  PV: "#16a34a",
  REDE: "#0f766e",
  CIDADANIA: "#db2777",
  SOLIDARIEDADE: "#f97316",
  PRD: "#0e7490",
  AGIR: "#ca8a04",
  DC: "#4b5563",
  PSTU: "#9f1239",
  UP: "#be123c",
  PCO: "#7f1d1d",
  PCB: "#991b1b",
};

export function corPartido(sigla: string): string {
  const chave = sigla.trim().toUpperCase();
  return PARTIDO_COR[chave] ?? PARTIDO_COR[semAcento(chave)] ?? "#57534e";
}

export function iniciais(nome: string): string {
  const partes = nome.split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "?";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toLocaleUpperCase("pt-BR");
}
