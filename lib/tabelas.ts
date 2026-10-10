import { bigint, integer, pgTable, text } from "drizzle-orm/pg-core";

export const visita = pgTable("visita", {
  id: text("id").primaryKey(),
});

export const estado = pgTable("estado", {
  uf: text("uf").primaryKey(),
  total: integer("total").notNull(),
});

export const online = pgTable("online", {
  id: text("id").primaryKey(),
  uf: text("uf").notNull(),
  em: bigint("em", { mode: "number" }).notNull(),
});

export const voto = pgTable("voto", {
  chave: text("chave").primaryKey(),
  nome: text("nome").notNull(),
  total: integer("total").notNull(),
});

export const escolha = pgTable("escolha", {
  id: text("id").primaryKey(),
  chave: text("chave").notNull(),
  origem: text("origem"),
});

export const meta = pgTable("meta", {
  chave: text("chave").primaryKey(),
  valor: text("valor").notNull(),
});

/** Amostra da contagem. Linha nova a cada horário. Nada aqui é atualizado. */
export const contagem = pgTable("contagem", {
  id: text("id").primaryKey(),
  em: bigint("em", { mode: "number" }).notNull(),
  dia: text("dia").notNull(),
  slot: text("slot").notNull(),
  cargo: text("cargo").notNull(),
  uf: text("uf").notNull(),
  nomeUf: text("nome_uf").notNull(),
  turno: integer("turno").notNull(),
  codigo: text("codigo").notNull(),
  atualizadoEm: text("atualizado_em").notNull(),
  sqcand: text("sqcand").notNull(),
  nome: text("nome").notNull(),
  numero: text("numero").notNull(),
  partido: text("partido").notNull(),
  votos: bigint("votos", { mode: "number" }).notNull(),
  pct: text("pct").notNull(),
  votosValidos: bigint("votos_validos", { mode: "number" }).notNull(),
  secoesApuradas: bigint("secoes_apuradas", { mode: "number" }).notNull(),
  secoesTotal: bigint("secoes_total", { mode: "number" }).notNull(),
  fonte: text("fonte").notNull(),
});
