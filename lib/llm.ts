import { Agent } from "undici";

const agenteGemini = new Agent({ connect: { timeout: 40_000 } });

export type Provedor = {
  url: string;
  chave: string;
  modelo: string;
  formato: "responses" | "chat" | "ponte" | "gemini" | "claude";
  busca: boolean;
};

// A ponte local vem primeiro: a chave do modelo fica neste computador e o site só manda a pergunta.
export function provedorIa(): Provedor | null {
  const ponte = process.env.PONTE_URL?.trim().replace(/\/$/, "");
  if (ponte && process.env.PONTE_TOKEN) {
    return {
      url: `${ponte}/perguntar`,
      chave: process.env.PONTE_TOKEN,
      modelo: "ponte",
      formato: "ponte",
      busca: false,
    };
  }
  const ollama = process.env.OLLAMA_BASE_URL?.trim().replace(/\/$/, "");
  if (ollama) {
    const base = ollama.endsWith("/v1") ? ollama : `${ollama}/v1`;
    return {
      url: `${base}/chat/completions`,
      chave: process.env.OLLAMA_API_KEY || "ollama",
      modelo: process.env.OLLAMA_MODEL || "llama3",
      formato: "chat",
      busca: false,
    };
  }
  const claude = provedorClaude();
  if (claude) return claude;
  // Gemini tem faixa gratuita no Google AI Studio; vem antes dos pagos.
  const gemini = process.env.GEMINI_API_KEY;
  if (gemini) {
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3.8-flash"}:generateContent`,
      chave: gemini,
      modelo: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      formato: "gemini",
      busca: process.env.GEMINI_BUSCA !== "0",
    };
  }
  const openai = process.env.OPENAI_API_KEY;
  if (openai) {
    return {
      url: "https://api.openai.com/v1/responses",
      chave: openai,
      modelo: process.env.OPENAI_MODEL || "gpt-5-mini",
      formato: "responses",
      busca: true,
    };
  }
  const xai = process.env.XAI_API_KEY;
  if (xai) {
    return {
      url: "https://api.x.ai/v1/responses",
      chave: xai,
      modelo: process.env.XAI_MODEL || "grok-4.7",
      formato: "responses",
      busca: true,
    };
  }
  return null;
}

export function provedorClaude(): Provedor | null {
  const chave = process.env.ANTHROPIC_API_KEY;
  if (!chave) return null;
  return {
    url: "https://api.anthropic.com/v1/messages",
    chave,
    modelo: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
    formato: "claude",
    busca: false,
  };
}

export function temIa(): boolean {
  return provedorIa() !== null;
}

// Modelos com raciocínio gastam parte de max_output_tokens pensando; os outros recusam o campo reasoning.
export function corpoIa(modelo: string, maxSaida: number, corpo: Record<string, unknown>): Record<string, unknown> {
  const raciocina = /^(gpt-5|o\d|grok)/.test(modelo);
  return {
    ...corpo,
    model: modelo,
    store: false,
    max_output_tokens: raciocina ? maxSaida * 4 : maxSaida,
    ...(raciocina ? { reasoning: { effort: "low" } } : {}),
  };
}

export async function completar(
  provedor: Provedor,
  instrucoes: string,
  entrada: string,
  maxSaida: number,
  extra?: Record<string, unknown>,
  prazoMs = 50_000,
): Promise<{ texto: string; fontes: string[] }> {
  const ngrok = provedor.url.includes("ngrok");
  const resposta = await fetch(provedor.url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(provedor.formato === "gemini"
        ? { "x-goog-api-key": provedor.chave }
        : provedor.formato === "claude"
        ? { "x-api-key": provedor.chave, "anthropic-version": "2023-06-01" }
        : { authorization: `Bearer ${provedor.chave}` }),
      ...(ngrok ? { "ngrok-skip-browser-warning": "1" } : {}),
    },
    body: JSON.stringify(
      provedor.formato === "ponte"
        ? { instrucoes, entrada, maxSaida }
        : provedor.formato === "gemini"
        ? {
            systemInstruction: { parts: [{ text: instrucoes }] },
            contents: [{ role: "user", parts: [{ text: entrada }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: maxSaida * 4 },
            // Busca do Google para o que não está na tela (biografia, regra, notícia).
            ...(provedor.busca ? { tools: [{ google_search: {} }] } : {}),
          }
        : provedor.formato === "claude"
        ? {
            model: provedor.modelo,
            max_tokens: maxSaida,
            // Resposta curta e falada: sem raciocínio, os tokens vão todos para o texto.
            thinking: { type: "disabled" },
            system: instrucoes,
            messages: [{ role: "user", content: entrada }],
          }
        : provedor.formato === "chat"
        ? {
            model: provedor.modelo,
            temperature: 0.2,
            ...(provedor.modelo.startsWith("gemini")
              ? { max_tokens: maxSaida * 4, reasoning_effort: "low" }
              : { max_tokens: maxSaida }),
            messages: [
              { role: "system", content: instrucoes },
              { role: "user", content: entrada },
            ],
          }
        : corpoIa(provedor.modelo, maxSaida, {
            instructions: instrucoes,
            input: [{ role: "user", content: entrada }],
            ...extra,
          }),
    ),
    signal: AbortSignal.timeout(prazoMs),
    ...(provedor.formato === "gemini" || provedor.formato === "claude" ? { dispatcher: agenteGemini } : {}),
  });
  if (!resposta.ok) {
    console.error(JSON.stringify({ ia: "falha", status: resposta.status, corpo: (await resposta.text()).slice(0, 300) }));
    throw new Error("rede");
  }
  const json: unknown = await resposta.json();
  const texto = provedor.formato === "chat"
    ? textoChat(json)
    : provedor.formato === "ponte"
    ? textoPonte(json)
    : provedor.formato === "gemini"
    ? textoGemini(json)
    : provedor.formato === "claude"
    ? textoClaude(json)
    : extrairTexto(json);
  if (!texto) throw new Error("vazio");
  return { texto, fontes: fontesDe(json) };
}

function textoClaude(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  const content = (json as { content?: unknown }).content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((parte) => parte && typeof parte === "object" && (parte as { type?: unknown }).type === "text")
    .map((parte) => (parte as { text?: unknown }).text)
    .filter((texto): texto is string => typeof texto === "string")
    .join(" ")
    .trim();
}

function textoGemini(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  const candidates = (json as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || !candidates[0] || typeof candidates[0] !== "object") return "";
  const content = (candidates[0] as { content?: unknown }).content;
  if (!content || typeof content !== "object") return "";
  const parts = (content as { parts?: unknown }).parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((parte) => parte && typeof parte === "object" && typeof (parte as { text?: unknown }).text === "string" && !(parte as { thought?: unknown }).thought)
    .map((parte) => (parte as { text: string }).text)
    .join(" ")
    .trim();
}

function textoPonte(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  const texto = (json as { texto?: unknown }).texto;
  return typeof texto === "string" ? texto : "";
}

function textoChat(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  const choices = (json as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== "object") return "";
  const message = (choices[0] as { message?: unknown }).message;
  if (!message || typeof message !== "object") return "";
  const content = (message as { content?: unknown }).content;
  return typeof content === "string" ? content : "";
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
  return partes.join(" ");
}

function fontesDe(json: unknown): string[] {
  const urls: string[] = [];
  if (!json || typeof json !== "object") return urls;
  const candidatos = (json as { candidates?: unknown }).candidates;
  if (Array.isArray(candidatos)) {
    const meta = (candidatos[0] as { groundingMetadata?: { groundingChunks?: unknown } } | undefined)?.groundingMetadata;
    const pedacos = Array.isArray(meta?.groundingChunks) ? meta.groundingChunks : [];
    for (const pedaco of pedacos) {
      const url = urlHttps((pedaco as { web?: { uri?: unknown } } | null)?.web?.uri);
      if (url) urls.push(url);
    }
    return [...new Set(urls)].slice(0, 2);
  }
  const output = (json as { output?: unknown }).output;
  if (!Array.isArray(output)) return urls;
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const bloco of content) {
      if (!bloco || typeof bloco !== "object") continue;
      const notas = (bloco as { annotations?: unknown }).annotations;
      if (!Array.isArray(notas)) continue;
      for (const nota of notas) {
        if (!nota || typeof nota !== "object") continue;
        const url = urlHttps((nota as { url?: unknown }).url);
        if (url) urls.push(url);
      }
    }
  }
  return [...new Set(urls)].slice(0, 2);
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
