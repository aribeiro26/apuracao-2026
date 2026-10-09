"use server";

import { headers } from "next/headers";
import { ipConfiavel } from "@/lib/ip";
import { consumir, entrar, sair } from "@/lib/limite";
import { contextoDe, registrar, type Contexto } from "@/lib/siem";
import { pngDoPix } from "@/lib/pix";
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
