export const DIA_ELEICAO = "2026-10-25";

/** Horário de Brasília, arredondado para baixo de 30 em 30 minutos. */
export function slotDe(agora = Date.now()): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(agora);
  const ler = (tipo: Intl.DateTimeFormatPartTypes) => partes.find((parte) => parte.type === tipo)?.value ?? "";
  const hora = ler("hour").padStart(2, "0");
  const minuto = Number(ler("minute")) < 30 ? "00" : "30";
  return `${ler("year")}-${ler("month")}-${ler("day")}T${hora}:${minuto}`;
}

export function eDiaDaEleicao(agora = Date.now()): boolean {
  return slotDe(agora).startsWith(DIA_ELEICAO);
}
