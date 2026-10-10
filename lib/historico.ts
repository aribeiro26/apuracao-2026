import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { DIA_ELEICAO, slotDe } from "./amostra";
import type { Ponto } from "./discrepancia";
import { contagem } from "./tabelas";
import { montarPainel, type Resultado } from "./tse";

const soquete = (globalThis as { WebSocket?: typeof WebSocket }).WebSocket;
if (soquete) neonConfig.webSocketConstructor = soquete;

const CRIAR = [
  `CREATE TABLE IF NOT EXISTS contagem (
    id text PRIMARY KEY,
    em bigint NOT NULL,
    dia text NOT NULL,
    slot text NOT NULL,
    cargo text NOT NULL,
    uf text NOT NULL,
    nome_uf text NOT NULL,
    turno integer NOT NULL,
    codigo text NOT NULL,
    atualizado_em text NOT NULL,
    sqcand text NOT NULL,
    nome text NOT NULL,
    numero text NOT NULL,
    partido text NOT NULL,
    votos bigint NOT NULL,
    pct text NOT NULL,
    votos_validos bigint NOT NULL,
    secoes_apuradas bigint NOT NULL,
    secoes_total bigint NOT NULL,
    fonte text NOT NULL
  )`,
  "CREATE INDEX IF NOT EXISTS contagem_dia ON contagem (dia, cargo, uf)",
] as const;

let banco: NeonDatabase | null | undefined;
let pronto: Promise<void> | null = null;

export { DIA_ELEICAO, eDiaDaEleicao, slotDe } from "./amostra";

export async function gravarContagem(agora = Date.now()): Promise<{ gravado: number; porque: string }> {
  const slot = slotDe(agora);
  if (!slot.startsWith(DIA_ELEICAO)) return { gravado: 0, porque: "fora-do-dia" };
  const painel = await montarPainel();
  const disputas = [painel.presidente, ...painel.unidades, ...painel.governadores].filter((item) => item.turno === 2);
  if (!disputas.length) return { gravado: 0, porque: "sem-segundo-turno" };
  const db = abrir();
  if (!db) return { gravado: 0, porque: "sem-banco" };
  await garantir(db);
  const linhas = disputas.flatMap((resultado) => linhasDe(resultado, agora, slot));
  if (!linhas.length) return { gravado: 0, porque: "sem-candidato" };
  const inseridas = await db.insert(contagem).values(linhas).onConflictDoNothing().returning({ id: contagem.id });
  return { gravado: inseridas.length, porque: inseridas.length ? "gravado" : "ja-gravado" };
}

function linhasDe(resultado: Resultado, agora: number, slot: string) {
  return resultado.candidatos
    .filter((candidato) => candidato.sqcand)
    .map((candidato) => ({
      id: `${slot}|${resultado.cargo}|${resultado.uf}|${candidato.sqcand}`,
      em: agora,
      dia: DIA_ELEICAO,
      slot,
      cargo: resultado.cargo,
      uf: resultado.uf,
      nomeUf: resultado.nomeUf.slice(0, 80),
      turno: resultado.turno,
      codigo: resultado.codigoEleicao.slice(0, 16),
      atualizadoEm: resultado.atualizadoEm.slice(0, 40),
      sqcand: candidato.sqcand,
      nome: candidato.nome.slice(0, 80),
      numero: candidato.numero.slice(0, 6),
      partido: candidato.partido.slice(0, 24),
      votos: candidato.votos,
      pct: candidato.pctTse.toFixed(2),
      votosValidos: resultado.totais.votosValidos,
      secoesApuradas: resultado.totais.secoesApuradas,
      secoesTotal: resultado.totais.secoesTotal,
      fonte: resultado.url.slice(0, 240),
    }));
}

function abrir(): NeonDatabase | null {
  if (banco !== undefined) return banco;
  const url = process.env.DATABASE_URL;
  if (!url) {
    banco = null;
    return null;
  }
  banco = drizzle(new Pool({ connectionString: url, max: 1 }));
  return banco;
}

async function garantir(db: NeonDatabase): Promise<void> {
  if (!pronto) {
    pronto = (async () => {
      for (const texto of CRIAR) await db.execute(sql.raw(texto));
    })().catch((erro) => {
      pronto = null;
      throw erro;
    });
  }
  await pronto;
}

export async function lerHistorico(): Promise<Ponto[]> {
  const db = abrir();
  if (!db) return [];
  await garantir(db);
  const linhas = await db.select().from(contagem).where(eq(contagem.dia, DIA_ELEICAO));
  return linhas.map((linha) => ({
    slot: linha.slot,
    cargo: linha.cargo,
    uf: linha.uf,
    nomeUf: linha.nomeUf,
    sqcand: linha.sqcand,
    nome: linha.nome,
    partido: linha.partido,
    votos: Number(linha.votos),
    pct: Number(linha.pct),
    votosValidos: Number(linha.votosValidos),
    secoesApuradas: Number(linha.secoesApuradas),
    secoesTotal: Number(linha.secoesTotal),
  }));
}
