import { corpoIa, provedorIa } from "@/lib/llm";
import type { Locale } from "@/lib/locale";
import {
  disputaPresidencial,
  sementeDe,
  type Reportagem,
  type TipoReportagem,
} from "@/lib/reportagens-semente";

const TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { em: number; itens: Reportagem[] }>();
const voos = new Map<string, Promise<Reportagem[] | null>>();

const ESQUEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    itens: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          titulo: { type: "string" },
          veiculo: { type: "string" },
          url: { type: "string" },
          resumo: { type: "string" },
        },
        required: ["titulo", "veiculo", "url", "resumo"],
      },
    },
  },
  required: ["itens"],
} as const;

const FOCO: Record<TipoReportagem, string> = {
  fez: "atos, propostas e o que veículos dizem que a pessoa já fez na vida pública",
  acusado: "acusações, processos e a resposta publicada pelo outro lado. A acusação é o que o veículo ou a campanha disse, não um veredito deste site",
  fake: "checagens e decisões de tribunal sobre conteúdo removido ou chamado de falso. O rótulo é de quem o deu, não deste site",
  deixou: "promessas sem o como, o que críticos dizem que ficou por fazer e o que a própria campanha diz que fez. Atribua cada frase ao veículo",
};

export function chaveReportagem(tipo: TipoReportagem, nomes: string[], locale: Locale): string {
  const base = nomes.map((nome) => nome.toLowerCase()).sort().join("|");
  return `${tipo}:${locale}:${base}`;
}

export function itensEmCache(tipo: TipoReportagem, nomes: string[], locale: Locale, agora = Date.now()): Reportagem[] | null {
  const salvo = cache.get(chaveReportagem(tipo, nomes, locale));
  if (!salvo || agora - salvo.em > TTL_MS) return null;
  return salvo.itens;
}

export function sementeSePresidencial(tipo: TipoReportagem, nomes: string[], locale: Locale): Reportagem[] {
  return disputaPresidencial(nomes) ? sementeDe(tipo, locale) : [];
}

export async function itensDaRede(tipo: TipoReportagem, nomes: string[], locale: Locale): Promise<Reportagem[] | null> {
  const chave = chaveReportagem(tipo, nomes, locale);
  const emVoo = voos.get(chave);
  if (emVoo) return emVoo;
  const voo = pedirRede(tipo, nomes, locale)
    .then((itens) => {
      if (itens && itens.length > 0) cache.set(chave, { em: Date.now(), itens });
      return itens;
    })
    .finally(() => {
      voos.delete(chave);
    });
  voos.set(chave, voo);
  return voo;
}

async function pedirRede(tipo: TipoReportagem, nomes: string[], locale: Locale): Promise<Reportagem[] | null> {
  const provedor = provedorIa();
  if (!provedor || !provedor.busca || provedor.formato !== "responses" || nomes.length === 0) return null;
  const resposta = await fetch(provedor.url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${provedor.chave}`,
    },
    body: JSON.stringify(corpoIa(provedor.modelo, 900, {
      tools: [{ type: "web_search" }],
      instructions: [
        "Você lista reportagens reais sobre a eleição brasileira de 2026.",
        "Devolva só o JSON pedido, com 3 a 5 itens.",
        "Cada url tem de ser https e de uma página que a busca abriu. Não invente endereço.",
        "Cubra os dois lados quando houver dois nomes.",
        "Não declare culpa, crime, vitória eleitoral nem veredito de notícia falsa.",
        "O resumo é uma frase do que o veículo publicou, com o nome do veículo.",
        `Foco: ${FOCO[tipo]}.`,
        `Escreva título e resumo no idioma ${locale}.`,
      ].join(" "),
      input: [{ role: "user", content: `Tipo: ${tipo}\nIdioma: ${locale}\nNomes: ${nomes.join("; ")}` }],
      text: {
        format: {
          type: "json_schema",
          name: "reportagens",
          strict: true,
          schema: ESQUEMA,
        },
      },
    })),
    signal: AbortSignal.timeout(50_000),
  });
  if (!resposta.ok) return null;
  const json: unknown = await resposta.json();
  return validarItens(extrairTexto(json));
}

function validarItens(texto: string): Reportagem[] | null {
  const bruto = texto.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  let json: unknown;
  try {
    json = JSON.parse(bruto);
  } catch {
    return null;
  }
  if (!json || typeof json !== "object") return null;
  const lista = (json as { itens?: unknown }).itens;
  if (!Array.isArray(lista)) return null;
  const vistos = new Set<string>();
  const itens: Reportagem[] = [];
  for (const item of lista) {
    if (!item || typeof item !== "object") continue;
    const titulo = frase((item as { titulo?: unknown }).titulo, 140);
    const veiculo = frase((item as { veiculo?: unknown }).veiculo, 40);
    const resumo = frase((item as { resumo?: unknown }).resumo, 320);
    const url = urlHttps((item as { url?: unknown }).url);
    if (titulo.length < 8 || veiculo.length < 2 || resumo.length < 20 || !url || vistos.has(url)) continue;
    vistos.add(url);
    itens.push({ titulo, veiculo, url, resumo });
    if (itens.length === 5) break;
  }
  return itens.length > 0 ? itens : null;
}

function frase(valor: unknown, max: number): string {
  if (typeof valor !== "string") return "";
  return valor
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`\\]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function urlHttps(valor: unknown): string {
  if (typeof valor !== "string" || valor.length > 300) return "";
  try {
    const url = new URL(valor);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function extrairTexto(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  const output = (json as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";
  const partes: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const bloco of content) {
      if (!bloco || typeof bloco !== "object") continue;
      if ((bloco as { type?: unknown }).type !== "output_text") continue;
      const texto = (bloco as { text?: unknown }).text;
      if (typeof texto === "string") partes.push(texto);
    }
  }
  return partes.join("\n");
}
