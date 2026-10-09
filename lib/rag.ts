import { readFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { sementeDe, type TipoReportagem } from "@/lib/reportagens-semente";

export type Licao = {
  id: string;
  texto: string;
};

const REGRAS: Licao[] = [
  {
    id: "regra-fala",
    texto:
      "Responda com o que está na tela e nas notas. Se a tela e as notas não tiverem o fato, diga apenas que o painel não tem essa nota.",
  },
  {
    id: "regra-vitoria",
    texto:
      "Diga que alguém está eleito somente quando o campo cenario for eleito. Se cenario for aberto, empate ou segue, a disputa continua aberta. Uma liderança com apuração aberta não é vitória.",
  },
  {
    id: "regra-enquete",
    texto:
      "O clique no botão de pesquisa deste site não é voto do TSE e não entra na conta da vitória. A mesma conexão só escolhe uma vez.",
  },
  {
    id: "regra-numeros",
    texto:
      "Votos, seções e totais da apuração são só os do objeto tela. Não troque por outro total e não explique como a soma é feita.",
  },
  {
    id: "regra-data",
    texto: "A votação marcada neste painel é em 25 de outubro de 2026, das 8 horas às 17 horas, no horário de Brasília.",
  },
  {
    id: "regra-julgamento",
    texto:
      "Este site não julga pessoa e não declara culpa, crime ou inocência. O que um veículo publicou é notícia, não conclusão do site.",
  },
];

const TIPOS: TipoReportagem[] = ["fez", "acusado", "fake", "deixou"];
const PARADA = new Set(["que", "com", "para", "uma", "por", "nao", "sim", "esta", "este", "como", "das", "dos", "ele", "ela", "isso", "sobre", "mais", "foi", "sao", "tem", "ser"]);

function pastaDados(): string | null {
  if (process.env.LICOES_PATH) return path.dirname(process.env.LICOES_PATH);
  const base = process.env.LOCALAPPDATA || process.env.HOME;
  if (!base) return null;
  return path.join(base, "apuracao-ollama");
}

export function arquivoLicoes(): string | null {
  if (process.env.LICOES_PATH) return process.env.LICOES_PATH;
  const pasta = pastaDados();
  return pasta ? path.join(pasta, "licoes.jsonl") : null;
}

export function arquivoPerguntas(): string | null {
  if (process.env.PERGUNTAS_PATH) return process.env.PERGUNTAS_PATH;
  const pasta = pastaDados();
  return pasta ? path.join(pasta, "perguntas.jsonl") : null;
}

function semAcento(valor: string): string {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function tokens(valor: string): string[] {
  return semAcento(valor)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !PARADA.has(token));
}

function lerLicoes(): Licao[] {
  const arquivo = arquivoLicoes();
  if (!arquivo || !existsSync(arquivo)) return [];
  const saida: Licao[] = [];
  for (const linha of readFileSync(arquivo, "utf8").split(/\r?\n/)) {
    if (!linha.trim()) continue;
    try {
      const item = JSON.parse(linha) as { id?: unknown; texto?: unknown };
      if (typeof item.id === "string" && typeof item.texto === "string" && item.texto.trim()) {
        saida.push({ id: item.id, texto: item.texto.trim() });
      }
    } catch {
      // linha incompleta não entra na busca
    }
  }
  return saida;
}

function notasFixas(): Licao[] {
  const noticias: Licao[] = [];
  for (const tipo of TIPOS) {
    for (const item of sementeDe(tipo, "pt-BR")) {
      noticias.push({
        id: `noticia-${tipo}-${item.veiculo}-${noticias.length}`,
        texto: `${item.veiculo} publicou: ${item.resumo} Isso é o que o veículo publicou, não uma conclusão deste site.`,
      });
    }
  }
  return [...REGRAS, ...noticias];
}

function pontuar(pergunta: string[], nota: Licao): number {
  const palavras = new Set(tokens(nota.texto));
  let pontos = 0;
  for (const token of pergunta) if (palavras.has(token)) pontos += 1;
  return pontos;
}

export function notasPara(pergunta: string): string {
  const consulta = tokens(pergunta);
  const ranque = notasFixas()
    .map((nota) => ({ nota, pontos: pontuar(consulta, nota) }))
    .filter((item) => item.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos);
  const licoes = lerLicoes()
    .map((nota) => ({ nota, pontos: pontuar(consulta, nota) }))
    .filter((item) => item.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 2)
    .map((item) => item.nota);
  const escolhidas: Licao[] = [];
  const ids = new Set<string>();
  for (const nota of [REGRAS[0], REGRAS[1], REGRAS[5], ...licoes, ...ranque.map((item) => item.nota)]) {
    if (ids.has(nota.id)) continue;
    ids.add(nota.id);
    escolhidas.push(nota);
    if (escolhidas.length >= 6) break;
  }
  return escolhidas.map((nota) => `- ${nota.texto}`).join("\n");
}

export function anotarPergunta(pergunta: string): void {
  const arquivo = arquivoPerguntas();
  if (!arquivo) return;
  try {
    mkdirSync(path.dirname(arquivo), { recursive: true });
    appendFileSync(arquivo, `${JSON.stringify({ em: new Date().toISOString(), pergunta })}\n`);
  } catch {
    // disco somente leitura no servidor público
  }
}

export function guardarLicao(licao: Licao): void {
  const arquivo = arquivoLicoes();
  if (!arquivo) return;
  const atuais = lerLicoes();
  if (atuais.some((item) => item.id === licao.id)) return;
  mkdirSync(path.dirname(arquivo), { recursive: true });
  appendFileSync(arquivo, `${JSON.stringify(licao)}\n`);
}

export function tirarDesculpaDeRede(valor: string): string {
  const frases = valor.split(/(?<=[.!?])\s+/);
  return frases
    .filter((frase) => !/sem internet|nao tenho internet|estou sem internet|sem acesso( a)? internet|off-?line|sem conexao|nao tenho acesso/.test(semAcento(frase)))
    .join(" ")
    .trim();
}
