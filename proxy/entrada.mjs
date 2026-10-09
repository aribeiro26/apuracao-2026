import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import http from "node:http";

const next = spawn(process.execPath, ["server.js"], {
  env: { ...process.env, PORT: "3001", HOSTNAME: "127.0.0.1" },
  stdio: "inherit",
});

function encerrar(codigo) {
  if (!next.killed) next.kill("SIGTERM");
  process.exit(codigo);
}

next.on("exit", (codigo) => process.exit(codigo ?? 1));
process.on("SIGTERM", () => encerrar(0));
process.on("SIGINT", () => encerrar(0));

function ipDe(socket) {
  return (socket.remoteAddress || "").replace(/^::ffff:/, "");
}

const proxy = http.createServer((req, res) => {
  const ip = ipDe(req.socket);
  const rastreio = randomUUID();
  const headers = { ...req.headers };
  delete headers["x-forwarded-for"];
  delete headers["x-forwarded-host"];
  delete headers["x-forwarded-proto"];
  delete headers["x-forwarded-port"];
  delete headers["x-real-ip"];
  delete headers["x-rastreio"];
  headers["x-forwarded-for"] = ip;
  headers["x-real-ip"] = ip;
  headers["x-rastreio"] = rastreio;
  const upstream = http.request(
    {
      hostname: "127.0.0.1",
      port: 3001,
      path: req.url,
      method: req.method,
      headers,
    },
    (resposta) => {
      const saida = { ...resposta.headers, "x-rastreio": rastreio };
      res.writeHead(resposta.statusCode || 502, saida);
      resposta.pipe(res);
    },
  );
  upstream.on("error", () => {
    console.warn(
      JSON.stringify({
        tipo: "siem",
        esquema: "5w",
        quando: new Date().toISOString(),
        quem: { ip },
        oque: { acao: "proxy", resultado: "falha" },
        onde: { servico: "apuracao-2026", canal: "proxy" },
        porque: "upstream-indisponivel",
        rastreio,
      }),
    );
    if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain; charset=utf-8", "x-rastreio": rastreio });
    res.end("indisponivel");
  });
  req.pipe(upstream);
});

proxy.listen(3000, "0.0.0.0");
