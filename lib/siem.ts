/** Uma linha JSON por evento. stdout é a saída para o coletor (Docker, SIEM). */

import { ipConfiavel } from "./ip";

export type Contexto = {
  rastreio: string;
  ip: string;
  pais: string;
  locale: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function contextoDe(cabecalhos: Headers): Contexto {
  const informado = cabecalhos.get("x-rastreio")?.trim() ?? "";
  const rastreio = UUID.test(informado) ? informado : crypto.randomUUID();
  const ip = ipConfiavel(cabecalhos);
  const paisBruto = (cabecalhos.get("x-vercel-ip-country") || cabecalhos.get("cf-ipcountry") || "").toUpperCase();
  const pais = /^[A-Z]{2}$/.test(paisBruto) ? paisBruto : "";
  const localeBruto = cabecalhos.get("x-locale") ?? "";
  const locale = /^(pt-BR|pt-PT|es|en)$/.test(localeBruto) ? localeBruto : "";
  return { rastreio, ip, pais, locale };
}

type Evento = {
  rastreio: string;
  ip: string;
  pais: string;
  locale: string;
  acao: string;
  resultado: "sucesso" | "falha";
  porque: string;
  canal: "server-action" | "http" | "proxy";
  duracaoMs?: number;
  cargo?: string;
  uf?: string;
  codigo?: string;
  offset?: number;
};

function permitido(evento: Evento): { cargo?: string; uf?: string; codigo?: string; offset?: number } {
  const cargo = evento.cargo === "presidente" || evento.cargo === "governador" ? evento.cargo : undefined;
  const uf = evento.uf && /^[a-z]{2}$/.test(evento.uf) ? evento.uf : undefined;
  const codigo = evento.codigo && /^\d{5}$/.test(evento.codigo) ? evento.codigo : undefined;
  const offset = typeof evento.offset === "number" && Number.isInteger(evento.offset) && evento.offset >= 0 && evento.offset <= 8000 ? evento.offset : undefined;
  return { cargo, uf, codigo, offset };
}

export function registrar(evento: Evento): void {
  const extra = permitido(evento);
  const linha = {
    tipo: "siem",
    esquema: "5w",
    quando: new Date().toISOString(),
    quem: {
      ip: evento.ip,
      ...(evento.pais ? { pais: evento.pais } : {}),
      ...(evento.locale ? { locale: evento.locale } : {}),
    },
    oque: {
      acao: evento.acao,
      resultado: evento.resultado,
      ...extra,
    },
    onde: { servico: "apuracao-2026", canal: evento.canal },
    porque: evento.porque,
    rastreio: UUID.test(evento.rastreio) ? evento.rastreio : "invalido",
    ...(typeof evento.duracaoMs === "number" ? { duracaoMs: Math.max(0, Math.round(evento.duracaoMs)) } : {}),
  };
  const texto = JSON.stringify(linha);
  if (evento.resultado === "falha") console.warn(texto);
  else console.info(texto);
}
