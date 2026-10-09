import http from "node:http";

const token = process.env.OLLAMA_PORTA_TOKEN || "";
if (token.length < 16) {
  console.error("token ausente");
  process.exit(1);
}

const servidor = http.createServer((req, res) => {
  if ((req.headers.authorization || "") !== `Bearer ${token}`) {
    res.writeHead(401);
    res.end("nao");
    return;
  }
  const pedacos = [];
  req.on("data", (pedaco) => pedacos.push(pedaco));
  req.on("end", () => {
    const alvo = http.request(
      {
        hostname: "127.0.0.1",
        port: 11434,
        path: req.url,
        method: req.method,
        headers: { "content-type": req.headers["content-type"] || "application/json" },
      },
      (acima) => {
        res.writeHead(acima.statusCode || 502, { "content-type": acima.headers["content-type"] || "application/json" });
        acima.pipe(res);
      },
    );
    alvo.on("error", () => {
      if (!res.headersSent) res.writeHead(502);
      res.end("ollama");
    });
    alvo.end(Buffer.concat(pedacos));
  });
});

servidor.listen(11435, "127.0.0.1");
