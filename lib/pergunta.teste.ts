import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Candidato, Totais } from "./conta";
import { acharCidade, fraseDoLugar } from "./pergunta";
import { lerCidade, listarTodasCidades, obterResultado } from "./tse";

const CIDADES = [
  { uf: "sp", codigo: "61638", nome: "Araraquara" },
  { uf: "sp", codigo: "61314", nome: "Araras" },
  { uf: "sp", codigo: "61357", nome: "Araçatuba" },
  { uf: "sp", codigo: "71072", nome: "São Paulo" },
];

function candidato(parcial: Pick<Candidato, "sqcand" | "nome" | "votos">): Candidato {
  return {
    nomeCompleto: null,
    numero: "22",
    partido: "PL",
    partidoNome: "Partido Liberal",
    coligacao: null,
    vice: null,
    vicePartido: null,
    pctTse: 0,
    situacao: "",
    fase: "segundo-turno",
    fotos: [],
    ...parcial,
  };
}

const TOTAIS: Totais = {
  eleitorado: 100,
  comparecimento: 80,
  abstencao: 20,
  votosValidos: 100,
  brancos: 0,
  nulos: 0,
  secoesTotal: 10,
  secoesApuradas: 10,
};

describe("mapa da pergunta", () => {
  it("acha Araraquara mesmo com o nome escrito errado", () => {
    const cidade = acharCidade("arraquara", CIDADES);
    assert.equal(cidade?.codigo, "61638");
    assert.equal(cidade?.nome, "Araraquara");
  });

  it("acha a cidade dentro da frase inteira", () => {
    const cidade = acharCidade("Quem ganhou em Araraquara em presidente?", CIDADES);
    assert.equal(cidade?.nome, "Araraquara");
  });

  it("não confunde Araraquara com Araras", () => {
    const cidade = acharCidade("araras", CIDADES);
    assert.equal(cidade?.nome, "Araras");
  });

  it("responde sim quando o candidato pedido ficou na frente", () => {
    const frase = fraseDoLugar(
      "Araraquara",
      1,
      [
        candidato({ sqcand: "1", nome: "Flavio Bolsonaro", votos: 46 }),
        candidato({ sqcand: "2", nome: "Lula", votos: 44 }),
      ],
      TOTAIS,
      "em araraquara o flavio ganhou?",
    );
    assert.match(frase, /^Sim\. Em Araraquara, no 1º turno, Flavio ficou na frente com 46,00%/);
    assert.match(frase, /Lula teve 44,00%/);
  });

  it("responde não quando o outro ficou na frente", () => {
    const frase = fraseDoLugar(
      "Araraquara",
      1,
      [
        candidato({ sqcand: "1", nome: "Flavio Bolsonaro", votos: 46 }),
        candidato({ sqcand: "2", nome: "Lula", votos: 44 }),
      ],
      TOTAIS,
      "lula ganhou em araraquara?",
    );
    assert.match(frase, /^Não\. Em Araraquara/);
    assert.match(frase, /Lula teve 44,00%/);
  });
});

describe("arquivo do TSE", () => {
  it("lê Araraquara e devolve quem ficou na frente", async () => {
    const cidades = await listarTodasCidades();
    const cidade = acharCidade("Quem ganhou em Araraquara?", cidades);
    assert.ok(cidade, "a lista do TSE não tem Araraquara");
    const [lida, oficial] = await Promise.all([
      lerCidade("presidente", cidade.uf, cidade.codigo),
      obterResultado("presidente", cidade.uf),
    ]);
    assert.equal(lida.ok, true);
    const frase = fraseDoLugar(cidade.nome, oficial.turno, lida.candidatos ?? [], lida.totais, "Quem ganhou em Araraquara?");
    assert.match(frase, /Araraquara/);
    assert.match(frase, /\d{1,3},\d{2}%/);
    console.log("tse:", frase);
  });
});

const ENDERECOS = [
  "https://apuracao-2026-alexetecribeiro-9013.vercel.app",
  "https://apuracao-2026-rosy.vercel.app",
  "https://apuracao-2026-alt1hnbxd-alexetecribeiro-9013.vercel.app",
];

async function acharSite(): Promise<string | null> {
  for (const base of ENDERECOS) {
    const resposta = await fetch(base + "/", { redirect: "manual" });
    if (resposta.status === 200) return base;
  }
  return null;
}

describe("site no ar", () => {
  it("a apresentadora responde a pergunta pelo endpoint", async () => {
    const base = await acharSite();
    assert.ok(base, "nenhum endereço do painel respondeu 200");
    const html = await (await fetch(base + "/")).text();
    const paginas = [...html.matchAll(/\/_next\/static\/chunks\/app\/page-[^"]+\.js/g)].map((item) => item[0]);
    assert.ok(paginas.length > 0, "não achei o pacote da página");
    let acao = "";
    for (const pagina of paginas) {
      const texto = await (await fetch(base + pagina)).text();
      const id = texto.match(/createServerReference\)\("([0-9a-f]+)"[^"]*"responderPergunta"/);
      if (id) acao = id[1];
    }
    assert.ok(acao, "o site no ar não tem a ação responderPergunta");
    const bruto = await fetch(base + "/", {
      method: "POST",
      headers: {
        "content-type": "text/plain;charset=UTF-8",
        accept: "text/x-component",
        "next-action": acao,
      },
      body: '["Quem ganhou em Araraquara?"]',
    });
    const corpo = await bruto.text();
    const linha = corpo.split("\n").find((item) => item.includes('"texto"') || item.includes('"erro"'));
    console.log("endpoint:", base, linha);
    assert.match(corpo, /"ok":true/);
    assert.match(corpo, /Araraquara/);
    assert.match(corpo, /\d{1,3},\d{2}%/);
  });
});
