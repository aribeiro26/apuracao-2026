import http from "node:http";
import { appendFileSync, readFileSync } from "node:fs";
import path from "node:path";

function lerSegredo(env, arquivo) {
  const valor = process.env[env];
  if (valor && valor.trim()) return valor.trim();
  try {
    return readFileSync(arquivo, "utf8").trim();
  } catch {
    return "";
  }
}

const pasta = path.join(process.env.LOCALAPPDATA || "", "apuracao-ollama");

function nota(mensagem) {
  try {
    appendFileSync(path.join(pasta, "ponte.err"), `${new Date().toISOString()} ${mensagem}\n`);
  } catch {
    /* o processo segue sem o arquivo */
  }
}
const token = lerSegredo("PONTE_TOKEN", path.join(pasta, "porta.token"));
const gemini = lerSegredo("GEMINI_API_KEY", path.join(pasta, "gemini.key"));
const modelo = process.env.GEMINI_MODEL || "gemini-3.8-flash";
if (token.length < 16 || gemini.length < 10) {
  console.error("ponte sem segredo");
  process.exit(1);
}

const limite = new Map();

function permitido(ip) {
  const agora = Date.now();
  const fila = (limite.get(ip) || []).filter((hora) => agora - hora < 60_000);
  if (fila.length >= 20) {
    limite.set(ip, fila);
    return false;
  }
  fila.push(agora);
  limite.set(ip, fila);
  return true;
}

function textoDe(json) {
  const partes = json?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(partes)) return "";
  return partes
    .filter((parte) => parte && typeof parte.text === "string" && !parte.thought)
    .map((parte) => parte.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);
}

async function perguntar(instrucoes, entrada, maxSaida) {
  const resposta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": gemini,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instrucoes }] },
        contents: [{ role: "user", parts: [{ text: entrada }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: Math.min(maxSaida * 4, 1200) },
      }),
      signal: AbortSignal.timeout(45_000),
    },
  );
  if (!resposta.ok) {
    nota(`gemini ${resposta.status}`);
    return "";
  }
  return textoDe(await resposta.json());
}

const servidor = http.createServer((req, res) => {
  const ip = req.socket.remoteAddress || "";
  if (req.method !== "POST" || req.url !== "/perguntar") {
    res.writeHead(404);
    res.end("nao");
    return;
  }
  if ((req.headers.authorization || "") !== `Bearer ${token}` || !permitido(ip)) {
    res.writeHead(401);
    res.end("nao");
    return;
  }
  const pedacos = [];
  let tamanho = 0;
  req.on("data", (pedaco) => {
    tamanho += pedaco.length;
    if (tamanho > 32_000) {
      res.writeHead(413);
      res.end("nao");
      req.destroy();
      return;
    }
    pedacos.push(pedaco);
  });
  req.on("end", async () => {
    if (res.headersSent) return;
    try {
      const json = JSON.parse(Buffer.concat(pedacos).toString("utf8"));
      const instrucoes = typeof json.instrucoes === "string" ? json.instrucoes.slice(0, 4000) : "";
      const entrada = typeof json.entrada === "string" ? json.entrada.slice(0, 8000) : "";
      const maxSaida = Number.isFinite(json.maxSaida) ? json.maxSaida : 280;
      if (instrucoes.length < 8 || entrada.length < 2) {
        res.writeHead(400);
        res.end("nao");
        return;
      }
      const texto = await perguntar(instrucoes, entrada, maxSaida);
      if (!texto) {
        res.writeHead(502);
        res.end("nao");
        return;
      }
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ texto }));
    } catch (erro) {
      const causa = erro instanceof Error && erro.cause instanceof Error ? erro.cause.message : "";
      nota(`${erro instanceof Error ? erro.message : "erro"} ${causa}`.slice(0, 180));
      if (!res.headersSent) res.writeHead(502);
      res.end("nao");
    }
  });
});

servidor.listen(8787, "127.0.0.1", () => {
  console.log("ponte em 127.0.0.1:8787");
});
