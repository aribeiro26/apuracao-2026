import assert from "node:assert/strict";
import test from "node:test";
import { cronAutorizado } from "./cron-auth.ts";

test("um token que não é do GitHub não grava", async () => {
  assert.equal(await cronAutorizado(null), false);
  assert.equal(await cronAutorizado("Bearer nao"), false);
  assert.equal(await cronAutorizado("Bearer aaa.bbb.ccc"), false);
});
