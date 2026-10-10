import { createPublicKey, verify, type JsonWebKey } from "node:crypto";

const EMISSOR = "https://token.actions.githubusercontent.com";
const PUBLICO = "apuracao-contagem";
const REPOSITORIO = "aribeiro26/apuracao-2026";

type Cabeca = { alg?: string; kid?: string };
type Corpo = { iss?: string; aud?: string | string[]; exp?: number; repository?: string };

let cache: { em: number; chaves: JsonWebKey[] } | null = null;

export async function cronAutorizado(cabecalho: string | null): Promise<boolean> {
  const segredo = process.env.CRON_SECRET;
  if (segredo && cabecalho === `Bearer ${segredo}`) return true;
  return tokenDoGithub(cabecalho);
}

async function tokenDoGithub(cabecalho: string | null): Promise<boolean> {
  if (!cabecalho?.startsWith("Bearer ")) return false;
  const token = cabecalho.slice("Bearer ".length);
  const partes = token.split(".");
  if (partes.length !== 3) return false;
  const cabeca = jsonDe<Cabeca>(partes[0]);
  const corpo = jsonDe<Corpo>(partes[1]);
  if (!cabeca || !corpo) return false;
  if (cabeca.alg !== "RS256" || !cabeca.kid) return false;
  if (corpo.iss !== EMISSOR || corpo.repository !== REPOSITORIO) return false;
  const aud = Array.isArray(corpo.aud) ? corpo.aud : [corpo.aud];
  if (!aud.includes(PUBLICO)) return false;
  if (!corpo.exp || corpo.exp * 1000 < Date.now()) return false;
  const chaves = await chavesDoGithub();
  const jwk = chaves.find((chave) => chave.kid === cabeca.kid);
  if (!jwk) return false;
  const publica = createPublicKey({ key: jwk, format: "jwk" });
  return verify("RSA-SHA256", Buffer.from(`${partes[0]}.${partes[1]}`), publica, Buffer.from(partes[2], "base64url"));
}

function jsonDe<T>(pedaco: string): T | null {
  try {
    return JSON.parse(Buffer.from(pedaco, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

async function chavesDoGithub(): Promise<JsonWebKey[]> {
  if (cache && Date.now() - cache.em < 3_600_000) return cache.chaves;
  const resposta = await fetch(`${EMISSOR}/.well-known/jwks`);
  if (!resposta.ok) throw new Error("jwks");
  const json = (await resposta.json()) as { keys?: JsonWebKey[] };
  const chaves = json.keys ?? [];
  cache = { em: Date.now(), chaves };
  return chaves;
}
