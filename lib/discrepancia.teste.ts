import assert from "node:assert/strict";
import test from "node:test";
import { acharDiscrepancias, type Ponto } from "./discrepancia";

function ponto(parcial: Partial<Ponto> & Pick<Ponto, "slot" | "votos">): Ponto {
  const votosValidos = parcial.votosValidos ?? 1000;
  return {
    cargo: "presidente",
    uf: "br",
    nomeUf: "Brasil",
    sqcand: "1",
    nome: "Ana",
    partido: "PL",
    pct: (parcial.votos / votosValidos) * 100,
    votosValidos,
    secoesApuradas: 10,
    secoesTotal: 20,
    ...parcial,
    votos: parcial.votos,
  };
}

test("série limpa não gera alerta", () => {
  const pontos = [
    ponto({ slot: "2026-10-25T17:00", votos: 400, sqcand: "1", nome: "Ana" }),
    ponto({ slot: "2026-10-25T17:00", votos: 600, sqcand: "2", nome: "Bia", partido: "PT" }),
    ponto({ slot: "2026-10-25T17:30", votos: 450, votosValidos: 1100, sqcand: "1", nome: "Ana", secoesApuradas: 12 }),
    ponto({ slot: "2026-10-25T17:30", votos: 650, votosValidos: 1100, sqcand: "2", nome: "Bia", partido: "PT", secoesApuradas: 12 }),
  ];
  assert.deepEqual(acharDiscrepancias(pontos), []);
});

test("voto que volta atrás, urna que volta e percentual fora da conta", () => {
  const alertas = acharDiscrepancias([
    ponto({ slot: "2026-10-25T17:00", votos: 600, votosValidos: 600, pct: 100, secoesApuradas: 10 }),
    ponto({ slot: "2026-10-25T17:30", votos: 500, votosValidos: 500, pct: 80, secoesApuradas: 8 }),
  ]);
  assert.deepEqual(
    alertas.map((item) => item.tipo),
    ["percentual", "urnas-caiu", "votos-caiu"],
  );
});

test("soma dos candidatos diferente dos votos válidos", () => {
  const alertas = acharDiscrepancias([
    ponto({ slot: "2026-10-25T17:00", votos: 400, sqcand: "1" }),
    ponto({ slot: "2026-10-25T17:00", votos: 500, sqcand: "2", nome: "Bia" }),
  ]);
  assert.equal(alertas.length, 1);
  assert.equal(alertas[0].tipo, "soma");
});

test("amostra de 30 minutos que não chegou", () => {
  const alertas = acharDiscrepancias([
    ponto({ slot: "2026-10-25T17:00", votos: 400, votosValidos: 400, pct: 100 }),
    ponto({ slot: "2026-10-25T18:00", votos: 500, votosValidos: 500, pct: 100, secoesApuradas: 12 }),
  ]);
  assert.equal(alertas.some((item) => item.tipo === "buraco" && item.slot === "2026-10-25T17:30"), true);
});

test("votos mudam sem urna nova", () => {
  const alertas = acharDiscrepancias([
    ponto({ slot: "2026-10-25T17:00", votos: 400, votosValidos: 400, pct: 100, secoesApuradas: 10 }),
    ponto({ slot: "2026-10-25T17:30", votos: 2000, votosValidos: 2000, pct: 100, secoesApuradas: 10 }),
  ]);
  assert.equal(alertas.some((item) => item.tipo === "salto"), true);
});

test("Brasil não fecha com a soma dos estados", () => {
  const estados = Array.from({ length: 27 }, (_, i) =>
    ponto({
      slot: "2026-10-25T17:00",
      uf: `e${i}`,
      nomeUf: `Estado ${i}`,
      votos: 100,
      votosValidos: 100,
      pct: 100,
    }),
  );
  const alertas = acharDiscrepancias([
    ponto({ slot: "2026-10-25T17:00", uf: "br", votos: 10000, votosValidos: 10000, pct: 100 }),
    ...estados,
  ]);
  assert.equal(alertas.some((item) => item.tipo === "brasil"), true);
});
