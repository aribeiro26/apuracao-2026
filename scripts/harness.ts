import { readFileSync } from "node:fs";
import path from "node:path";
import { completar } from "../lib/llm";
import { guardarLicao, notasPara, tirarDesculpaDeRede } from "../lib/rag";
import type { TelaIa } from "../lib/tela-ia";

type Caso = {
  id: string;
  pergunta: string;
  tela: TelaIa;
  exige: string[];
  proibe: string[];
  licao: string;
};

function baseOllama(): string {
  const bruto = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
  return bruto.endsWith("/v1") ? bruto : `${bruto}/v1`;
}

function semAcento(valor: string): string {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function falaLimpa(valor: string): string {
  return valor
    .replace(/<[^>]*>/g, "")
    .replace(/[*#`_]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const INSTRUCOES = [
  "Você é a apresentadora de um painel cívico da eleição de 2026.",
  "Responda em português do Brasil, em no máximo quatro frases curtas, sem markdown.",
  "Use só os números da tela e as notas do painel.",
  "Não comente conexão, modelo ou o que você não consegue acessar.",
  "Se faltar o fato, diga que o painel não tem essa nota.",
].join(" ");

async function avaliar(caso: Caso): Promise<{ ok: boolean; texto: string; faltou: string[] }> {
  const notas = notasPara(caso.pergunta);
  const entrada = `Idioma: pt-BR\nPergunta: ${caso.pergunta}\nTela: ${JSON.stringify(caso.tela)}\nNotas do painel:\n${notas}`;
  const resposta = await completar(
    {
      url: `${baseOllama()}/chat/completions`,
      chave: "ollama",
      modelo: process.env.OLLAMA_MODEL || "llama3",
      formato: "chat",
      busca: false,
    },
    INSTRUCOES,
    entrada,
    280,
    undefined,
    90_000,
  );
  const texto = tirarDesculpaDeRede(falaLimpa(resposta.texto));
  const normal = semAcento(texto);
  const faltou = [
    ...caso.exige.filter((item) => !normal.includes(semAcento(item))),
    ...caso.proibe.filter((item) => normal.includes(semAcento(item))),
  ];
  return { ok: faltou.length === 0 && texto.length > 0, texto, faltou };
}

async function main() {
  const arquivo = path.join(process.cwd(), "harness", "casos.json");
  const casos = JSON.parse(readFileSync(arquivo, "utf8")) as Caso[];
  const filtro = process.argv.slice(2);
  const lista = filtro.length ? casos.filter((caso) => filtro.includes(caso.id)) : casos;
  let passou = 0;
  for (const caso of lista) {
    try {
      const resultado = await avaliar(caso);
      if (resultado.ok) {
        passou += 1;
        console.log(`ok ${caso.id}`);
      } else {
        guardarLicao({ id: caso.id, texto: caso.licao });
        console.log(`falha ${caso.id} faltou=${resultado.faltou.join("|")} texto=${resultado.texto.slice(0, 240)}`);
      }
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : "erro";
      console.log(`falha ${caso.id} erro=${mensagem}`);
    }
  }
  console.log(`resumo ${passou}/${lista.length}`);
  if (passou !== lista.length) process.exitCode = 1;
}

main();
