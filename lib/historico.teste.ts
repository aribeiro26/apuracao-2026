import assert from "node:assert/strict";
import test from "node:test";
import { DIA_ELEICAO, eDiaDaEleicao, slotDe } from "./amostra";

test("a amostra cai no bloco de 30 minutos em Brasília", () => {
  assert.equal(slotDe(Date.parse("2026-10-25T17:10:00-03:00")), "2026-10-25T17:00");
  assert.equal(slotDe(Date.parse("2026-10-25T17:40:00-03:00")), "2026-10-25T17:30");
  assert.equal(slotDe(Date.parse("2026-10-25T00:05:00-03:00")), "2026-10-25T00:00");
});

test("só o dia da eleição entra", () => {
  assert.equal(eDiaDaEleicao(Date.parse("2026-10-25T23:50:00-03:00")), true);
  assert.equal(eDiaDaEleicao(Date.parse("2026-10-24T23:50:00-03:00")), false);
  assert.equal(eDiaDaEleicao(Date.parse("2026-10-26T00:10:00-03:00")), false);
  assert.equal(DIA_ELEICAO, "2026-10-25");
});
