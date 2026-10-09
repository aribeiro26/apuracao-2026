import { completar, provedorClaude, provedorIa, type Provedor } from "@/lib/llm";
import type { Locale } from "@/lib/locale";
import { anotarPergunta, notasPara, tirarDesculpaDeRede } from "@/lib/rag";
import type { TelaIa } from "@/lib/tela-ia";

const INSTRUCOES = [
  "Você é a apresentadora de um painel cívico sobre a eleição de 2026 no Brasil, presidente e governadores.",
  "Responda no idioma indicado, em no máximo quatro frases curtas, para serem lidas em voz alta. Sem markdown e sem lista.",
  "O objeto tela traz os números que estão nesta página, lidos dos arquivos públicos do TSE. Para a apuração, use só esses números. Não troque por outro total.",
  "Diga que alguém está eleito somente se cenario for eleito. Se for aberto, empate ou segue, a disputa continua aberta e você não declara vencedor.",
  "Não invente acusação, crime ou escândalo. Se a pergunta for sobre isso, diga que este site não julga pessoa e só mostra a apuração. Se citar notícia, diga que é notícia, não conclusão do site.",
  "O clique no botão de pesquisa deste site não é voto do TSE.",
].join(" ");

function instrucoesDe(busca: boolean): string {
  if (busca) {
    return `${INSTRUCOES} Para biografia, regra, data ou notícia que não esteja na tela, pesquise na web e cite o nome do site numa frase curta. Isso é notícia, não conclusão do site. Não comente modelo nem conexão.`;
  }
  return `${INSTRUCOES} Para biografia, regra, data ou notícia, use somente as notas do painel incluídas na pergunta. Cite o veículo numa frase curta. Se a tela e as notas não tiverem o fato, diga que o painel não tem essa nota. Não invente notícia, link, número fora da tela nem acusação.`;
}

export async function responderPergunta(
  pergunta: string,
  tela: TelaIa,
  locale: Locale,
): Promise<{ texto: string; fontes: string[] }> {
  const provedor = provedorIa();
  const reserva = provedorClaude();
  const principal = provedor && provedor.formato !== "claude" ? provedor : reserva;
  if (!principal) throw new Error("sem-chave");
  anotarPergunta(pergunta);
  const notas = notasPara(pergunta);
  const entrada = `Idioma: ${locale}\nPergunta: ${pergunta}\nTela: ${JSON.stringify(tela)}\nNotas do painel:\n${notas}`;
  try {
    return await umaResposta(principal, entrada, principal.formato === "gemini" && reserva ? 18_000 : 50_000);
  } catch (erro) {
    if (!reserva || principal.formato === "claude") throw erro;
    return await umaResposta(reserva, entrada, 25_000);
  }
}

async function umaResposta(provedor: Provedor, entrada: string, prazoMs: number) {
  const instrucoes = instrucoesDe(provedor.busca);
  const resposta = await completar(
    provedor,
    instrucoes,
    entrada,
    280,
    provedor.busca ? { tools: [{ type: "web_search" }] } : undefined,
    prazoMs,
  );
  const texto = tirarDesculpaDeRede(falaLimpa(resposta.texto));
  if (!texto) throw new Error("vazio");
  return { texto, fontes: resposta.fontes };
}

function falaLimpa(valor: string): string {
  return valor
    .replace(/<[^>]*>/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[*#`_]+/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);
}
