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
