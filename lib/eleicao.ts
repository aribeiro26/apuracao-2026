const DIA = Date.parse("2026-10-25T00:00:00-03:00");

export const INICIO_VOTACAO = Date.parse("2026-10-25T08:00:00-03:00");
export const FIM_VOTACAO = Date.parse("2026-10-25T17:00:00-03:00");

export type FaseEleicao = "antes" | "hoje" | "aberta" | "fim";

/** Dias de calendário em Brasília até 25 de outubro de 2026. */
export function diasParaEleicao(agora = Date.now()): number {
  const hoje = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
  const inicioHoje = Date.parse(`${hoje}T00:00:00-03:00`);
  return Math.round((DIA - inicioHoje) / 86_400_000);
}

export function faseEleicao(agora = Date.now()): FaseEleicao {
  if (agora >= FIM_VOTACAO) return "fim";
  if (agora >= INICIO_VOTACAO) return "aberta";
  if (diasParaEleicao(agora) <= 0) return "hoje";
  return "antes";
}
