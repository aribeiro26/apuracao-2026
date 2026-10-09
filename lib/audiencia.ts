import { Pool, neonConfig } from "@neondatabase/serverless";
import { get } from "@vercel/blob";
import { count, eq, lt, sql } from "drizzle-orm";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { escolha, estado, meta, online, visita, voto } from "./tabelas";
import { ufValida } from "./uf";

const soquete = (globalThis as { WebSocket?: typeof WebSocket }).WebSocket;
if (soquete) neonConfig.webSocketConstructor = soquete;

const AGORA_MS = 90_000;
const MAX_IDS = 20_000;
const ARQUIVO = "audiencia.json";

type Voto = { nome: string; total: number };

type Arquivo = {
  vistos: string[];
  porEstado: Record<string, number>;
  online: Record<string, { uf: string; em: number }>;
  votosPor: Record<string, Voto>;
  escolha: Record<string, string>;
  porOrigem: Record<string, string>;
};

export type ResumoAudiencia = {
  total: number;
  agora: number;
  porEstado: { uf: string; total: number; agora: number }[];
  votos: { chave: string; nome: string; total: number }[];
  minhaEscolha: string | null;
};

const VAZIO = (): Arquivo => ({
  vistos: [],
  porEstado: {},
  online: {},
  votosPor: { flavio: { nome: "Flávio", total: 0 }, lula: { nome: "Lula", total: 0 } },
  escolha: {},
  porOrigem: {},
});

let cache: Arquivo | null = null;
let fila: Promise<void> = Promise.resolve();
let bancoPronto: Promise<void> | null = null;
let bancoCache: NeonDatabase | null | undefined;

type Banco = NeonDatabase;

const CRIAR_TABELAS = [
  "CREATE TABLE IF NOT EXISTS visita (id text PRIMARY KEY)",
  "CREATE TABLE IF NOT EXISTS estado (uf text PRIMARY KEY, total integer NOT NULL)",
  "CREATE TABLE IF NOT EXISTS online (id text PRIMARY KEY, uf text NOT NULL, em bigint NOT NULL)",
  "CREATE TABLE IF NOT EXISTS voto (chave text PRIMARY KEY, nome text NOT NULL, total integer NOT NULL)",
  "CREATE TABLE IF NOT EXISTS escolha (id text PRIMARY KEY, chave text NOT NULL, origem text)",
  "ALTER TABLE escolha ADD COLUMN IF NOT EXISTS origem text",
  "CREATE UNIQUE INDEX IF NOT EXISTS escolha_origem_unica ON escolha (origem) WHERE origem IS NOT NULL",
  "CREATE TABLE IF NOT EXISTS meta (chave text PRIMARY KEY, valor text NOT NULL)",
] as const;

export function ufDoPedido(cabecalhos: Headers): string {
  const pais = (cabecalhos.get("x-vercel-ip-country") || cabecalhos.get("cf-ipcountry") || "").toUpperCase();
  const regiao = (cabecalhos.get("x-vercel-ip-country-region") || "").trim().toLowerCase();
  if (pais === "BR" && ufValida(regiao) && regiao !== "zz") return regiao;
  return "fora";
}

export async function marcarPresenca(id: string, uf: string, origem?: string | null): Promise<ResumoAudiencia> {
  const db = cliente();
  if (!db) return alterar((arquivo) => registrarNoArquivo(arquivo, id, uf), id, origem);
  await preparar(db);
  const em = Date.now();
  const ufOk = ufValida(uf) && uf !== "zz" ? uf : "fora";
  await db.transaction(async (tx) => {
    const ja = await tx.select({ id: visita.id }).from(visita).where(eq(visita.id, id)).limit(1);
    let nova = false;
    if (!ja.length) {
      const [{ n }] = await tx.select({ n: count() }).from(visita);
      if (Number(n) < MAX_IDS) {
        const inserida = await tx.insert(visita).values({ id }).onConflictDoNothing().returning({ id: visita.id });
        nova = inserida.length > 0;
      }
    }
    if (nova) {
      const subiu = await tx
        .update(estado)
        .set({ total: sql`${estado.total} + 1` })
        .where(eq(estado.uf, ufOk))
        .returning({ uf: estado.uf });
      if (!subiu.length) {
        await tx.insert(estado).values({ uf: ufOk, total: 1 }).onConflictDoUpdate({
          target: estado.uf,
          set: { total: sql`${estado.total} + 1` },
        });
      }
    }
    await tx
      .insert(online)
      .values({ id, uf: ufOk, em })
      .onConflictDoUpdate({
        target: online.id,
        set: { uf: sql`excluded.uf`, em: sql`excluded.em` },
      });
    await tx.delete(online).where(lt(online.em, em - AGORA_MS));
  });
  return lerDoBanco(db, id, origem);
}

export async function marcarVoto(
  id: string,
  chave: string,
  nome: string,
  origem?: string | null,
): Promise<{ novo: boolean; resumo: ResumoAudiencia }> {
  const db = cliente();
  const rede = origem || null;
  if (!db) {
    let novo = false;
    const resumo = await alterar((arquivo) => {
      if (arquivo.escolha[id] || (rede && arquivo.porOrigem[rede])) return;
      if (Object.keys(arquivo.escolha).length >= MAX_IDS) return;
      const atual = arquivo.votosPor[chave] ?? { nome, total: 0 };
      atual.total += 1;
      if (nome) atual.nome = nome;
      arquivo.votosPor[chave] = atual;
      arquivo.escolha[id] = chave;
      if (rede) arquivo.porOrigem[rede] = chave;
      novo = true;
    }, id, rede);
    return { novo, resumo };
  }
  await preparar(db);
  const nomeOk = nome.slice(0, 40) || chave;
  let novo = false;
  await db.transaction(async (tx) => {
    const ja = await tx.select({ id: escolha.id }).from(escolha).where(eq(escolha.id, id)).limit(1);
    if (ja.length) return;
    if (rede) {
      const mesmaRede = await tx.select({ id: escolha.id }).from(escolha).where(eq(escolha.origem, rede)).limit(1);
      if (mesmaRede.length) return;
    }
    const [{ n }] = await tx.select({ n: count() }).from(escolha);
    if (Number(n) >= MAX_IDS) return;
    const inserida = await tx
      .insert(escolha)
      .values({ id, chave, origem: rede })
      .onConflictDoNothing()
      .returning({ id: escolha.id });
    if (!inserida.length) return;
    const subiu = await tx
      .update(voto)
      .set({ total: sql`${voto.total} + 1`, nome: nomeOk })
      .where(eq(voto.chave, chave))
      .returning({ chave: voto.chave });
    if (!subiu.length) {
      await tx.insert(voto).values({ chave, nome: nomeOk, total: 1 }).onConflictDoUpdate({
        target: voto.chave,
        set: { total: sql`${voto.total} + 1`, nome: nomeOk },
      });
    }
    novo = true;
  });
  return { novo, resumo: await lerDoBanco(db, id, rede) };
}

export async function lerResumo(id?: string, origem?: string | null): Promise<ResumoAudiencia> {
  const db = cliente();
  if (!db) return resumoDe(podar(await ler()), id, origem);
  await preparar(db);
  await db.delete(online).where(lt(online.em, Date.now() - AGORA_MS));
  return lerDoBanco(db, id, origem);
}

function cliente(): Banco | null {
  if (bancoCache !== undefined) return bancoCache;
  const url = process.env.DATABASE_URL;
  if (!url) {
    bancoCache = null;
    return null;
  }
  bancoCache = drizzle(new Pool({ connectionString: url, max: 1 }));
  return bancoCache;
}

async function preparar(db: Banco): Promise<void> {
  if (!bancoPronto) {
    bancoPronto = criarTabelas(db).catch((erro) => {
      bancoPronto = null;
      throw erro;
    });
  }
  await bancoPronto;
}

async function criarTabelas(db: Banco): Promise<void> {
  for (const texto of CRIAR_TABELAS) await db.execute(sql.raw(texto));
  await db
    .insert(voto)
    .values([
      { chave: "flavio", nome: "Flávio", total: 0 },
      { chave: "lula", nome: "Lula", total: 0 },
    ])
    .onConflictDoNothing();
  await importarBlob(db);
}

async function importarBlob(db: Banco): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const ganhou = await db.insert(meta).values({ chave: "blob", valor: "1" }).onConflictDoNothing().returning({ chave: meta.chave });
  if (!ganhou.length) return;
  try {
    const arquivo = estruturar(await lerBlob());
    for (const id of arquivo.vistos) {
      await db.insert(visita).values({ id }).onConflictDoNothing();
    }
    for (const [uf, total] of Object.entries(arquivo.porEstado)) {
      await db
        .insert(estado)
        .values({ uf, total: Math.round(total) })
        .onConflictDoUpdate({
          target: estado.uf,
          set: { total: sql`GREATEST(${estado.total}, excluded.total)` },
        });
    }
    for (const [id, item] of Object.entries(arquivo.online)) {
      await db
        .insert(online)
        .values({ id, uf: item.uf, em: item.em })
        .onConflictDoUpdate({
          target: online.id,
          set: { uf: sql`excluded.uf`, em: sql`excluded.em` },
        });
    }
    for (const [chave, item] of Object.entries(arquivo.votosPor)) {
      await db
        .insert(voto)
        .values({ chave, nome: item.nome, total: item.total })
        .onConflictDoUpdate({
          target: voto.chave,
          set: {
            total: sql`GREATEST(${voto.total}, excluded.total)`,
            nome: sql`CASE WHEN excluded.total > ${voto.total} THEN excluded.nome ELSE ${voto.nome} END`,
          },
        });
    }
    for (const [id, chave] of Object.entries(arquivo.escolha)) {
      await db.insert(escolha).values({ id, chave }).onConflictDoNothing();
    }
  } catch (erro) {
    await db.delete(meta).where(eq(meta.chave, "blob"));
    throw erro;
  }
}

async function escolhaDe(db: Banco, id?: string, origem?: string | null): Promise<{ chave: string }[]> {
  if (id) {
    const porId = await db.select({ chave: escolha.chave }).from(escolha).where(eq(escolha.id, id)).limit(1);
    if (porId.length) return porId;
  }
  if (origem) return db.select({ chave: escolha.chave }).from(escolha).where(eq(escolha.origem, origem)).limit(1);
  return [];
}

async function lerDoBanco(db: Banco, id?: string, origem?: string | null): Promise<ResumoAudiencia> {
  const [totais, agora, estados, agoraUf, votos, escolhaLinha] = await Promise.all([
    db.select({ n: count() }).from(visita),
    db.select({ n: count() }).from(online),
    db.select({ uf: estado.uf, total: estado.total }).from(estado),
    db.select({ uf: online.uf, n: count() }).from(online).groupBy(online.uf),
    db.select({ chave: voto.chave, nome: voto.nome, total: voto.total }).from(voto),
    escolhaDe(db, id, origem),
  ]);
  const agoraPor: Record<string, number> = {};
  for (const linha of agoraUf) agoraPor[String(linha.uf)] = Number(linha.n);
  const porMapa: Record<string, number> = {};
  for (const linha of estados) porMapa[String(linha.uf)] = Number(linha.total);
  const ufs = new Set([...Object.keys(porMapa), ...Object.keys(agoraPor)]);
  const ordem = (chave: string) => (chave === "flavio" ? 0 : chave === "lula" ? 1 : 2);
  return {
    total: Number(totais[0]?.n ?? 0),
    agora: Number(agora[0]?.n ?? 0),
    porEstado: [...ufs]
      .map((uf) => ({ uf, total: porMapa[uf] ?? 0, agora: agoraPor[uf] ?? 0 }))
      .sort((a, b) => b.total - a.total || b.agora - a.agora || a.uf.localeCompare(b.uf)),
    votos: votos
      .map((linha) => ({ chave: String(linha.chave), nome: String(linha.nome), total: Number(linha.total) }))
      .sort((a, b) => ordem(a.chave) - ordem(b.chave) || b.total - a.total),
    minhaEscolha: escolhaLinha[0] ? String(escolhaLinha[0].chave) : null,
  };
}

function registrarNoArquivo(arquivo: Arquivo, id: string, uf: string) {
  if (!arquivo.vistos.includes(id)) {
    if (arquivo.vistos.length < MAX_IDS) {
      arquivo.vistos.push(id);
      arquivo.porEstado[uf] = (arquivo.porEstado[uf] ?? 0) + 1;
    }
  }
  arquivo.online[id] = { uf, em: Date.now() };
}

async function alterar(mutar: (arquivo: Arquivo) => void, id?: string, origem?: string | null): Promise<ResumoAudiencia> {
  let resultado = resumoDe(VAZIO(), id, origem);
  const tarefa = fila.then(async () => {
    const arquivo = await ler();
    mutar(arquivo);
    podar(arquivo);
    cache = arquivo;
    await gravar(arquivo);
    resultado = resumoDe(arquivo, id, origem);
  });
  fila = tarefa.then(
    () => undefined,
    () => undefined,
  );
  await tarefa;
  return resultado;
}

function podar(arquivo: Arquivo): Arquivo {
  const limite = Date.now() - AGORA_MS;
  for (const [id, item] of Object.entries(arquivo.online)) {
    if (item.em < limite) delete arquivo.online[id];
  }
  return arquivo;
}

function resumoDe(arquivo: Arquivo, id?: string, origem?: string | null): ResumoAudiencia {
  const agoraPor: Record<string, number> = {};
  for (const item of Object.values(arquivo.online)) {
    agoraPor[item.uf] = (agoraPor[item.uf] ?? 0) + 1;
  }
  const ufs = new Set([...Object.keys(arquivo.porEstado), ...Object.keys(agoraPor)]);
  const porEstado = [...ufs]
    .map((uf) => ({ uf, total: arquivo.porEstado[uf] ?? 0, agora: agoraPor[uf] ?? 0 }))
    .sort((a, b) => b.total - a.total || b.agora - a.agora || a.uf.localeCompare(b.uf));
  const ordem = (chave: string) => (chave === "flavio" ? 0 : chave === "lula" ? 1 : 2);
  const votos = Object.entries(arquivo.votosPor)
    .map(([chave, voto]) => ({ chave, nome: voto.nome, total: voto.total }))
    .sort((a, b) => ordem(a.chave) - ordem(b.chave) || b.total - a.total);
  return {
    total: arquivo.vistos.length,
    agora: Object.keys(arquivo.online).length,
    porEstado,
    votos,
    minhaEscolha: (id && arquivo.escolha[id]) || (origem && arquivo.porOrigem[origem]) || null,
  };
}

async function ler(): Promise<Arquivo> {
  if (cache) return estruturar(cache);
  return estruturar(await lerBlob());
}

async function lerBlob(): Promise<unknown> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const blob = await get(ARQUIVO, { access: "private", useCache: false });
    if (!blob) return null;
    const texto = await new Response(blob.stream).text();
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

async function gravar(arquivo: Arquivo): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const { put } = await import("@vercel/blob");
  await put(ARQUIVO, JSON.stringify(arquivo), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

function estruturar(valor: unknown): Arquivo {
  const bruto = valor && typeof valor === "object" ? (valor as Record<string, unknown>) : {};
  const texto = (lista: unknown) => (Array.isArray(lista) ? lista.filter((item) => typeof item === "string").slice(0, MAX_IDS) : []);
  const porEstado: Record<string, number> = {};
  if (bruto.porEstado && typeof bruto.porEstado === "object") {
    for (const [uf, total] of Object.entries(bruto.porEstado as Record<string, unknown>)) {
      if (typeof total === "number" && total >= 0) porEstado[uf] = total;
    }
  }
  const online: Arquivo["online"] = {};
  if (bruto.online && typeof bruto.online === "object") {
    for (const [id, item] of Object.entries(bruto.online as Record<string, unknown>)) {
      if (item && typeof item === "object") {
        const uf = (item as { uf?: unknown }).uf;
        const em = (item as { em?: unknown }).em;
        if (typeof uf === "string" && typeof em === "number") online[id] = { uf, em };
      }
    }
  }
  const votosPor: Record<string, Voto> = { flavio: { nome: "Flávio", total: 0 }, lula: { nome: "Lula", total: 0 } };
  if (bruto.votosPor && typeof bruto.votosPor === "object") {
    for (const [chave, item] of Object.entries(bruto.votosPor as Record<string, unknown>)) {
      if (!/^[a-z0-9]{1,32}$/.test(chave) || !item || typeof item !== "object") continue;
      const nome = typeof (item as { nome?: unknown }).nome === "string" ? (item as { nome: string }).nome.slice(0, 40) : chave;
      const total = (item as { total?: unknown }).total;
      votosPor[chave] = { nome, total: typeof total === "number" && total >= 0 ? total : 0 };
    }
  } else if (typeof bruto.votos === "number" && bruto.votos >= 0) {
    votosPor.lula = { nome: "Lula", total: bruto.votos };
  }
  const escolha: Record<string, string> = {};
  if (bruto.escolha && typeof bruto.escolha === "object") {
    for (const [id, chave] of Object.entries(bruto.escolha as Record<string, unknown>)) {
      if (typeof chave === "string" && votosPor[chave]) escolha[id] = chave;
    }
  } else {
    for (const id of texto(bruto.votaram)) escolha[id] = "lula";
  }
  const porOrigem: Record<string, string> = {};
  if (bruto.porOrigem && typeof bruto.porOrigem === "object") {
    for (const [origem, chave] of Object.entries(bruto.porOrigem as Record<string, unknown>)) {
      if (typeof chave === "string" && votosPor[chave]) porOrigem[origem] = chave;
    }
  }
  return { vistos: texto(bruto.vistos), porEstado, online, votosPor, escolha, porOrigem };
}
