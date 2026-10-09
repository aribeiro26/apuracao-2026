import { comparar } from "../lib/conta";
import { lerLote, obterResultado } from "../lib/tse";

async function conferir(cargo: "presidente" | "governador") {
  const oficial = await obterResultado(cargo, "ac");
  const cidades = [];
  let total = 0;
  for (let offset = 0; offset <= total; offset += 8) {
    const lote = await lerLote(cargo, "ac", offset, 8);
    total = lote.total;
    cidades.push(...lote.cidades);
    if (!lote.cidades.length) break;
  }
  const { somarCidades } = await import("../lib/conta");
  const soma = somarCidades(cargo, "ac", cidades, { modo: oficial.modo, turno: oficial.turno });
  if (!soma) throw new Error("Soma vazia");
  const diff = comparar(soma, oficial);
  const falhas = cidades.filter((cidade) => !cidade.ok).length;
  console.log(
    cargo,
    "municipios",
    cidades.length,
    "falhas",
    falhas,
    "validos soma",
    soma.totais.votosValidos,
    "oficial",
    oficial.totais.votosValidos,
    "delta",
    diff.votosValidos,
  );
  const relevantes = diff.candidatos.filter((item) => item.delta !== 0);
  if (falhas === 0 && (diff.votosValidos !== 0 || relevantes.length)) {
    console.log(relevantes.slice(0, 8));
    throw new Error(`Soma de ${cargo} no AC não fechou com o arquivo da UF.`);
  }
}

async function main() {
  await conferir("presidente");
  await conferir("governador");
  console.log("AC fechou com o arquivo oficial.");
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
