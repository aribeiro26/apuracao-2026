import { readFileSync, writeFileSync } from "node:fs";

const bruto = JSON.parse(readFileSync(process.env.TEMP + "/br-states.geojson", "utf8"));
const NOMES = {
  Acre: "ac",
  Alagoas: "al",
  Amapá: "ap",
  Amazonas: "am",
  Bahia: "ba",
  Ceará: "ce",
  "Distrito Federal": "df",
  "Espírito Santo": "es",
  Goiás: "go",
  Maranhão: "ma",
  "Mato Grosso": "mt",
  "Mato Grosso do Sul": "ms",
  "Minas Gerais": "mg",
  Pará: "pa",
  Paraíba: "pb",
  Paraná: "pr",
  Pernambuco: "pe",
  Piauí: "pi",
  "Rio de Janeiro": "rj",
  "Rio Grande do Norte": "rn",
  "Rio Grande do Sul": "rs",
  Rondônia: "ro",
  Roraima: "rr",
  "Santa Catarina": "sc",
  "São Paulo": "sp",
  Sergipe: "se",
  Tocantins: "to",
};

function aneis(geom) {
  if (geom.type === "Polygon") return geom.coordinates;
  if (geom.type === "MultiPolygon") return geom.coordinates.flat();
  return [];
}

function reduzir(anel, passo) {
  if (anel.length <= 8) return anel;
  const saida = [];
  for (let i = 0; i < anel.length; i += passo) saida.push(anel[i]);
  const ultimo = anel[anel.length - 1];
  const fim = saida[saida.length - 1];
  if (!fim || fim[0] !== ultimo[0] || fim[1] !== ultimo[1]) saida.push(ultimo);
  return saida;
}

const partes = [];
let pontos = 0;
for (const feature of bruto.features) {
  const nome = feature.properties.name || feature.properties.nome;
  const sigla = NOMES[nome];
  if (!sigla) {
    console.error("sem sigla", nome, feature.properties);
    continue;
  }
  const caminho = [];
  for (const anel of aneis(feature.geometry)) {
    const curto = reduzir(anel, 12);
    pontos += curto.length;
    const d = curto
      .map((par, indice) => {
        const x = ((par[0] + 74) / 40) * 400;
        const y = ((5.5 - par[1]) / 40) * 420;
        return `${indice === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
    caminho.push(d + " Z");
  }
  partes.push(`  ${sigla}: "${caminho.join(" ")}",`);
}
console.log("estados", partes.length, "pontos", pontos);
writeFileSync(
  new URL("../lib/mapa-brasil.ts", import.meta.url),
  `/** Contorno simplificado dos estados. Coordenadas só para pintar o mapa. */\nexport const MAPA_BRASIL: Record<string, string> = {\n${partes.join("\n")}\n};\n`,
);
