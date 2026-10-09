"use server";

import { cookies, headers } from "next/headers";
import { lerResumo, marcarPresenca, marcarVoto, ufDoPedido, type ResumoAudiencia } from "@/lib/audiencia";
import { textoPlano } from "@/lib/texto";
import { ipConfiavel, ipDeVoto } from "@/lib/ip";
import { consumir, entrar, sair } from "@/lib/limite";
import { contextoDe, registrar, type Contexto } from "@/lib/siem";
import { responderPergunta } from "@/lib/ia";
import { temIa } from "@/lib/llm";
import { itensDaRede, itensEmCache, sementeSePresidencial } from "@/lib/reportagens";
import { ehTipoReportagem, type Reportagem } from "@/lib/reportagens-semente";
import { isLocale } from "@/lib/locale";
import { pngDoPix } from "@/lib/pix";
import { limparPergunta, normalizarTela, type TelaIa } from "@/lib/tela-ia";
import {
  PedidoInvalido,
  lerCidade,
  lerLote,
  listarMunicipios,
  montarPainel,
  obterResultado,
  type CidadeApurada,
  type Modo,
  type MunicipioRef,
  type Resultado,
} from "@/lib/tse";
import type { Cargo } from "@/lib/conta";

export type Falha = { ok: false; erro: "limite" | "pedido" | "rede"; rastreio: string };

type Regra = { escopo: "ip" | "todos"; max: number; janelaMs: number; vagas: number };

const REGRAS: Record<string, Regra[]> = {
  painel: [
    { escopo: "ip", max: 20, janelaMs: 60_000, vagas: 2 },
    { escopo: "todos", max: 400, janelaMs: 60_000, vagas: 6 },
  ],
  municipios: [
    { escopo: "ip", max: 40, janelaMs: 60_000, vagas: 3 },
    { escopo: "todos", max: 600, janelaMs: 60_000, vagas: 12 },
  ],
  municipio: [
    { escopo: "ip", max: 60, janelaMs: 60_000, vagas: 4 },
    { escopo: "todos", max: 800, janelaMs: 60_000, vagas: 16 },
  ],
  lote: [
    { escopo: "ip", max: 180, janelaMs: 60_000, vagas: 3 },
    { escopo: "ip", max: 2000, janelaMs: 600_000, vagas: 3 },
    { escopo: "todos", max: 1500, janelaMs: 60_000, vagas: 12 },
  ],
  pix: [
    { escopo: "ip", max: 10, janelaMs: 60_000, vagas: 2 },
    { escopo: "todos", max: 120, janelaMs: 60_000, vagas: 6 },
  ],
  presenca: [
    { escopo: "ip", max: 40, janelaMs: 60_000, vagas: 4 },
    { escopo: "todos", max: 4000, janelaMs: 60_000, vagas: 20 },
  ],
  voto: [
    { escopo: "ip", max: 6, janelaMs: 60_000, vagas: 2 },
    { escopo: "todos", max: 600, janelaMs: 60_000, vagas: 8 },
  ],
  enquete: [
    { escopo: "ip", max: 30, janelaMs: 60_000, vagas: 3 },
    { escopo: "todos", max: 600, janelaMs: 60_000, vagas: 12 },
  ],
  ia: [
    { escopo: "ip", max: 6, janelaMs: 60_000, vagas: 1 },
    { escopo: "ip", max: 30, janelaMs: 3_600_000, vagas: 1 },
    { escopo: "todos", max: 40, janelaMs: 60_000, vagas: 3 },
  ],
  faq: [
    { escopo: "ip", max: 10, janelaMs: 60_000, vagas: 2 },
    { escopo: "todos", max: 30, janelaMs: 60_000, vagas: 4 },
  ],
};



function cargoDe(valor: string): Cargo | null {
  if (valor === "presidente" || valor === "governador") return valor;
  return null;
}

async function comCota<T>(acao: string, trabalho: () => Promise<T>): Promise<T | { ok: false; erro: "limite" }> {
  const regras = REGRAS[acao];
  const ip = ipConfiavel(await headers());
  const chavesOcupadas: { chave: string; max: number }[] = [];
  for (const regra of regras) {
    const dono = regra.escopo === "ip" ? ip : "todos";
    const chave = `${acao}:${regra.escopo}:${regra.janelaMs}:${dono}`;
    if (!consumir(chave, regra.max, regra.janelaMs)) return { ok: false, erro: "limite" };
    if (!chavesOcupadas.some((item) => item.chave === `${acao}:${regra.escopo}:${dono}`)) {
      chavesOcupadas.push({ chave: `${acao}:${regra.escopo}:${dono}`, max: regra.vagas });
    }
  }
  const segurou: string[] = [];
  for (const vaga of chavesOcupadas) {
    if (!entrar(vaga.chave, vaga.max)) {
      for (const chave of segurou) sair(chave);
      return { ok: false, erro: "limite" };
    }
    segurou.push(vaga.chave);
  }
  try {
    return await trabalho();
  } finally {
    for (const chave of segurou) sair(chave);
  }
}

function falhaDe(erro: unknown): { ok: false; erro: "pedido" | "rede" } {
  if (erro instanceof PedidoInvalido) return { ok: false, erro: "pedido" };
  return { ok: false, erro: "rede" };
}

async function auditar<T extends { ok: boolean; erro?: string }>(
  acao: string,
  detalhes: { cargo?: string; uf?: string; codigo?: string; offset?: number },
  trabalho: () => Promise<T>,
): Promise<T & { rastreio: string }> {
  const inicio = Date.now();
  const ctx: Contexto = contextoDe(await headers());
  try {
    const valor = await trabalho();
    registrar({
      ...ctx,
      acao,
      resultado: valor.ok ? "sucesso" : "falha",
      porque: valor.ok ? "concluido" : (valor.erro ?? "rede"),
      canal: "server-action",
      duracaoMs: Date.now() - inicio,
      ...detalhes,
    });
    return { ...valor, rastreio: ctx.rastreio };
  } catch {
    registrar({
      ...ctx,
      acao,
      resultado: "falha",
      porque: "rede",
      canal: "server-action",
      duracaoMs: Date.now() - inicio,
      ...detalhes,
    });
    return { ok: false, erro: "rede", rastreio: ctx.rastreio } as T & { rastreio: string };
  }
}

export async function carregarPainel(): Promise<
  ({ ok: true; presidente: Resultado; somaEstados: Resultado; unidades: Resultado[]; governadores: Resultado[] } & { rastreio: string }) | Falha
> {
  return auditar("painel", {}, () =>
    comCota("painel", async () => {
      try {
        const painel = await montarPainel();
        return { ok: true as const, ...painel };
      } catch (erro) {
        return falhaDe(erro);
      }
    }),
  );
}

export async function municipiosDoEstado(uf: string): Promise<({ ok: true; municipios: MunicipioRef[] } & { rastreio: string }) | Falha> {
  const ufOk = /^[a-z]{2}$/i.test(uf) ? uf.toLowerCase() : undefined;
  return auditar("municipios", { uf: ufOk, cargo: "presidente" }, () =>
    comCota("municipios", async () => {
      try {
        const municipios = await listarMunicipios("presidente", uf);
        return { ok: true as const, municipios };
      } catch (erro) {
        return falhaDe(erro);
      }
    }),
  );
}

export async function lerMunicipio(
  cargo: string,
  uf: string,
  codigo: string,
): Promise<({ ok: true; cidade: CidadeApurada; modo: Modo; turno: 1 | 2; atualizadoEm: string | null } & { rastreio: string }) | Falha> {
  const cargoOk = cargoDe(cargo);
  const ufOk = /^[a-z]{2}$/i.test(uf) ? uf.toLowerCase() : undefined;
  const codigoOk = /^\d{5}$/.test(codigo) ? codigo : undefined;
  if (!cargoOk || !codigoOk) return auditar("municipio", {}, async () => ({ ok: false as const, erro: "pedido" as const }));
  return auditar("municipio", { cargo: cargoOk, uf: ufOk, codigo: codigoOk }, () =>
    comCota("municipio", async () => {
      try {
        const [cidade, oficial] = await Promise.all([
          lerCidade(cargoOk, uf, codigoOk),
          obterResultado(cargoOk, ufOk === "br" ? "br" : uf),
        ]);
        return { ok: true as const, cidade, modo: oficial.modo, turno: oficial.turno, atualizadoEm: cidade.atualizadoEm };
      } catch (erro) {
        return falhaDe(erro);
      }
    }),
  );
}

export async function lerLoteMunicipios(
  cargo: string,
  uf: string,
  offset: number,
): Promise<({ ok: true; total: number; cidades: CidadeApurada[]; turno: 1 | 2; modo: Modo } & { rastreio: string }) | Falha> {
  const cargoOk = cargoDe(cargo);
  const ufOk = /^[a-z]{2}$/i.test(uf) ? uf.toLowerCase() : undefined;
  const offsetOk = Number.isInteger(offset) && offset >= 0 && offset <= 8000 ? offset : undefined;
  if (!cargoOk || offsetOk == null) return auditar("lote", {}, async () => ({ ok: false as const, erro: "pedido" as const }));
  return auditar("lote", { cargo: cargoOk, uf: ufOk, offset: offsetOk }, () =>
    comCota("lote", async () => {
      try {
        const lote = await lerLote(cargoOk, uf, offsetOk, 8);
        return { ok: true as const, ...lote };
      } catch (erro) {
        return falhaDe(erro);
      }
    }),
  );
}

function nomesDeReportagem(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  const vistos = new Set<string>();
  const saida: string[] = [];
  for (const item of valor) {
    const nome = textoPlano(item, 80);
    const chave = nome.toLowerCase();
    if (nome.length < 2 || vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push(nome);
    if (saida.length === 4) break;
  }
  return saida;
}

export async function lerReportagens(
  tipo: string,
  nomes: unknown,
  locale: string,
): Promise<({ ok: true; itens: Reportagem[] } & { rastreio: string }) | Falha> {
  const localeOk = isLocale(locale) ? locale : null;
  if (!ehTipoReportagem(tipo) || !localeOk) {
    return auditar("faq", {}, async () => ({ ok: false as const, erro: "pedido" as const }));
  }
  const nomesOk = nomesDeReportagem(nomes);
  const emCache = itensEmCache(tipo, nomesOk, localeOk);
  if (emCache) return auditar("faq", {}, async () => ({ ok: true as const, itens: emCache }));
  if (!temIa()) {
    return auditar("faq", {}, async () => ({ ok: true as const, itens: sementeSePresidencial(tipo, nomesOk, localeOk) }));
  }
  return auditar("faq", {}, () =>
    comCota("faq", async () => {
      try {
        const rede = await itensDaRede(tipo, nomesOk, localeOk);
        if (rede && rede.length > 0) return { ok: true as const, itens: rede };
      } catch {
        /* a semente cobre a disputa presidencial */
      }
      const semente = sementeSePresidencial(tipo, nomesOk, localeOk);
      if (semente.length > 0) return { ok: true as const, itens: semente };
      return { ok: false as const, erro: "rede" as const };
    }),
  );
}

export async function perguntarApresentadora(
  pergunta: string,
  tela: TelaIa,
  locale: string,
): Promise<({ ok: true; texto: string; fontes: string[] } & { rastreio: string }) | Falha> {
  const perguntaOk = limparPergunta(pergunta);
  const localeOk = isLocale(locale) ? locale : "pt-BR";
  if (perguntaOk.length < 2) return auditar("ia", {}, async () => ({ ok: false as const, erro: "pedido" as const }));
  const telaOk = normalizarTela(tela);
  return auditar("ia", {}, () =>
    comCota("ia", async () => {
      try {
        const resposta = await responderPergunta(perguntaOk, telaOk, localeOk);
        return { ok: true as const, texto: resposta.texto, fontes: resposta.fontes };
      } catch {
        return { ok: false as const, erro: "rede" as const };
      }
    }),
  );
}

export async function qrDoacao(): Promise<({ ok: true; png: string } & { rastreio: string }) | Falha> {
  return auditar("pix", {}, () =>
    comCota("pix", async () => {
      try {
        const png = await pngDoPix();
        return { ok: true as const, png: png.toString("base64") };
      } catch {
        return { ok: false as const, erro: "rede" as const };
      }
    }),
  );
}

const VISITA = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function idDaVisita(): Promise<string> {
  const jar = await cookies();
  const salvo = jar.get("visita")?.value ?? "";
  const id = VISITA.test(salvo) ? salvo : crypto.randomUUID();
  const seguro = (await headers()).get("x-forwarded-proto") === "https";
  if (id !== salvo) {
    jar.set("visita", id, { httpOnly: true, sameSite: "lax", secure: seguro, path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return id;
}

export async function atualizarEnquete(): Promise<({ ok: true; resumo: ResumoAudiencia } & { rastreio: string }) | Falha> {
  const resultado = await comCota("enquete", async () => {
    const cabecalhos = await headers();
    const jar = await cookies();
    const id = jar.get("visita")?.value;
    const resumo = await lerResumo(VISITA.test(id ?? "") ? id : undefined, ipDeVoto(cabecalhos));
    return { ok: true as const, resumo };
  });
  if (!resultado.ok) return { ok: false, erro: "limite", rastreio: contextoDe(await headers()).rastreio };
  return { ...resultado, rastreio: "" };
}

export async function registrarPresenca(): Promise<({ ok: true; resumo: ResumoAudiencia } & { rastreio: string }) | Falha> {
  const resultado = await comCota("presenca", async () => {
    const cabecalhos = await headers();
    const id = await idDaVisita();
    const resumo = await marcarPresenca(id, ufDoPedido(cabecalhos), ipDeVoto(cabecalhos));
    return { ok: true as const, resumo };
  });
  if (!resultado.ok) return { ok: false, erro: "limite", rastreio: contextoDe(await headers()).rastreio };
  return { ...resultado, rastreio: "" };
}

export async function votarCandidato(
  chave: string,
  nome: string,
): Promise<({ ok: true; novo: boolean; resumo: ResumoAudiencia } & { rastreio: string }) | Falha> {
  const chaveOk = /^[a-z0-9]{1,32}$/.test(chave) ? chave : "";
  const nomeOk = textoPlano(nome, 40);
  if (!chaveOk || !nomeOk) return auditar("voto", {}, async () => ({ ok: false as const, erro: "pedido" as const }));
  return auditar("voto", {}, () =>
    comCota("voto", async () => {
      const jar = await cookies();
      const cabecalhos = await headers();
      const id = await idDaVisita();
      const rede = ipDeVoto(cabecalhos);
      const antigo = jar.get("voto-botao")?.value || (jar.get("voto-lula")?.value === "1" ? "lula" : "");
      if (antigo) {
        const resumo = await lerResumo(id, rede);
        return { ok: true as const, novo: false, resumo: { ...resumo, minhaEscolha: antigo } };
      }
      const { novo, resumo } = await marcarVoto(id, chaveOk, nomeOk, rede);
      const marcado = resumo.minhaEscolha;
      if (marcado) {
        const seguro = cabecalhos.get("x-forwarded-proto") === "https";
        jar.set("voto-botao", marcado, { httpOnly: true, sameSite: "lax", secure: seguro, path: "/", maxAge: 60 * 60 * 24 * 365 });
      }
      return { ok: true as const, novo, resumo };
    }),
  );
}
