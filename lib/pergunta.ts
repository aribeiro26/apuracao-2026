import type { Candidato, Totais } from "./conta";
import { numero, percentual, semAcento } from "./format";
import { parDaDisputa, quemLidera, type Par } from "./placar";
import { UFS_PRESIDENTE } from "./uf";

export type CidadeIndice = { uf: string; codigo: string; nome: string };

const PARADAS = new Set([
  "em", "no", "na", "nos", "nas", "o", "a", "os", "as", "de", "do", "da", "dos", "das",
  "que", "quem", "vai", "ganhou", "ganhar", "ganha", "frente", "esta", "estah", "outro",
  "ainda", "passa", "passar", "passou", "segundo", "turno", "presidente", "governador",
  "eleicao", "votos", "voto", "cidade", "municipio", "estado", "capital", "sobre", "para",
  "por", "com", "sem", "mais", "menos", "como", "qual", "quais", "onde", "quando",
]);

export function norm(valor: string): string {
  return semAcento(valor).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function distancia(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const linha = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j += 1) {
    let anterior = linha[0] ?? 0;
    linha[0] = j;
    for (let i = 1; i <= a.length; i += 1) {
      const guardado = linha[i] ?? 0;
      const troca = a[i - 1] === b[j - 1] ? anterior : Math.min(anterior, linha[i] ?? 0, linha[i - 1] ?? 0) + 1;
      linha[i] = troca;
      anterior = guardado;
    }
  }
  return linha[a.length] ?? 9;
}

function tokens(texto: string): string[] {
  return norm(texto).split(" ").filter((parte) => parte.length >= 5 && !PARADAS.has(parte));
}

function curto(nome: string): string {
  return nome.split(" ")[0] ?? nome;
}

export function pareceLugar(texto: string): boolean {
  return tokens(texto).some((parte) => !["flavio", "falvio", "bolsonaro", "lula", "inacio", "silva"].includes(parte));
}

function contemPalavra(consulta: string, nome: string): boolean {
  return ` ${consulta} `.includes(` ${nome} `);
}

export function acharCidade(texto: string, cidades: CidadeIndice[]): CidadeIndice | null {
  const consulta = norm(texto);
  if (consulta.length < 4) return null;
  let melhor: { cidade: CidadeIndice; nota: number } | null = null;
  const pedacos = tokens(texto);
  for (const cidade of cidades) {
    const nome = norm(cidade.nome);
    if (nome.length < 5) continue;
    let nota = 9;
    if (contemPalavra(consulta, nome)) nota = 0;
    else {
      for (const pedaco of pedacos) {
        if (Math.abs(pedaco.length - nome.length) > 2) continue;
        nota = Math.min(nota, distancia(pedaco, nome));
      }
    }
    const limite = nome.length >= 9 ? 2 : 1;
    if (nota > limite) continue;
    if (!melhor || nota < melhor.nota || (nota === melhor.nota && nome.length > norm(melhor.cidade.nome).length)) {
      melhor = { cidade, nota };
    }
  }
  return melhor?.cidade ?? null;
}

export function acharEstado(texto: string): { uf: string; nome: string } | null {
  const consulta = norm(texto);
  let melhor: { uf: string; nome: string; tamanho: number } | null = null;
  for (const uf of UFS_PRESIDENTE) {
    const nome = norm(uf.nome);
    if (nome.length < 4 || !contemPalavra(consulta, nome)) continue;
    if (!melhor || nome.length > melhor.tamanho) melhor = { uf: uf.sigla, nome: uf.nome, tamanho: nome.length };
  }
  if (melhor) return { uf: melhor.uf, nome: melhor.nome };
  const sigla = consulta.split(" ").find((parte) => UFS_PRESIDENTE.some((uf) => uf.sigla === parte));
  if (!sigla) return null;
  const uf = UFS_PRESIDENTE.find((item) => item.sigla === sigla);
  return uf ? { uf: uf.sigla, nome: uf.nome } : null;
}

function candidatoPedido(texto: string, par: Par): Candidato | null {
  const consulta = norm(texto);
  const pares: [Candidato, string[]][] = [
    [par.azul, [norm(par.azul.nome), norm(curto(par.azul.nome)), "flavio", "falvio", "bolsonaro"]],
    [par.vermelho, [norm(par.vermelho.nome), norm(curto(par.vermelho.nome)), "lula", "inacio"]],
  ];
  for (const [cand, chaves] of pares) {
    if (chaves.some((chave) => chave.length >= 4 && (consulta.includes(chave) || tokens(texto).some((parte) => distancia(parte, chave) <= 1)))) {
      return cand;
    }
  }
  return null;
}

function pctDe(cand: Candidato, validos: number): string {
  const valor = validos > 0 ? (cand.votos / validos) * 100 : cand.pctTse;
  return percentual(valor, 2, "pt-BR");
}

export function fraseDoLugar(
  lugar: string,
  turno: 1 | 2,
  candidatos: Candidato[],
  totais: Totais | null,
  pergunta: string,
): string {
  const par = parDaDisputa(candidatos);
  if (!par || !totais) return `O TSE ainda não publicou os votos de ${lugar}.`;
  const soma = par.azul.votos + par.vermelho.votos;
  if (soma <= 0) return `Em ${lugar} o TSE ainda não publicou voto.`;
  const lider = quemLidera(par);
  if (!lider) return `Em ${lugar} está empatado: ${numero(par.azul.votos)} a ${numero(par.vermelho.votos)}.`;
  const outro = lider.sqcand === par.azul.sqcand ? par.vermelho : par.azul;
  const quando = turno === 1 ? "no 1º turno" : "no 2º turno";
  const fechou = turno === 2 && totais.secoesTotal > 0 && totais.secoesApuradas >= totais.secoesTotal;
  const verbo = fechou ? "ganhou" : "ficou na frente";
  const pedido = candidatoPedido(pergunta, par);
  const liderPct = pctDe(lider, totais.votosValidos);
  const outroPct = pctDe(outro, totais.votosValidos);
  const aviso = turno === 1 ? " O arquivo do 2º turno ainda não tem voto." : "";
  if (pedido && pedido.sqcand !== lider.sqcand) {
    return `Não. Em ${lugar}, ${quando}, ${curto(lider.nome)} ${verbo} com ${liderPct}. ${curto(pedido.nome)} teve ${pctDe(pedido, totais.votosValidos)}.${aviso}`;
  }
  if (pedido) {
    return `Sim. Em ${lugar}, ${quando}, ${curto(pedido.nome)} ${verbo} com ${liderPct}. ${curto(outro.nome)} teve ${outroPct}.${aviso}`;
  }
  return `Em ${lugar}, ${quando}, ${curto(lider.nome)} ${verbo} com ${liderPct}. ${curto(outro.nome)} teve ${outroPct}.${aviso}`;
}

export function responderNaHora(
  texto: string,
  candidatos: Candidato[],
  totais: Totais | null,
  turno: 1 | 2,
  unidades: { uf: string; nomeUf: string; candidatos: Candidato[]; totais: Totais }[],
): string | null {
  const consulta = norm(texto);
  if (!consulta) return null;
  const estado = acharEstado(texto);
  if (estado && norm(estado.nome).length >= 4 && consulta.includes(norm(estado.nome))) {
    const unidade = unidades.find((item) => item.uf === estado.uf);
    if (!unidade) return `Ainda não li o arquivo de ${estado.nome}.`;
    return fraseDoLugar(estado.nome, turno, unidade.candidatos, unidade.totais, texto);
  }
  if (pareceLugar(texto)) return null;
  const par = parDaDisputa(candidatos);
  if (!par || !totais) return "Ainda não há dois nomes para comparar.";
  const lider = quemLidera(par);
  const outro = lider ? (lider.sqcand === par.azul.sqcand ? par.vermelho : par.azul) : null;
  if (consulta.includes("ainda passa") || consulta.includes("virar") || consulta.includes("alcanca")) {
    if (!lider || !outro) return "Está empatado. Qualquer voto muda quem fica na frente.";
    const falta = lider.votos - outro.votos + 1;
    const restantes = Math.max(0, totais.eleitorado - totais.comparecimento);
    if (turno === 1) return `O 1º turno já foi. ${curto(lider.nome)} ficou na frente, e os dois foram para o 2º turno.`;
    if (restantes > 0 && falta > restantes) return `Não. ${curto(outro.nome)} não alcança ${curto(lider.nome)} nem com os votos que ainda cabem.`;
    return `Pode. ${curto(outro.nome)} precisa de mais ${numero(falta)} votos do que ${curto(lider.nome)} daqui para a frente.`;
  }
  if (consulta.includes("vai ganhar") || consulta.includes("quem ganha") || consulta.includes("eleito")) {
    if (!lider) return "Está empatado. Ainda não dá para cravar um nome.";
    if (turno === 1) return `No 1º turno ${curto(lider.nome)} ficou na frente, mas ninguém foi eleito. Os dois seguem no 2º turno.`;
    return `Neste instante eu fico com ${curto(lider.nome)}, com ${pctDe(lider, totais.votosValidos)}. Isso muda se a apuração virar.`;
  }
  if (consulta.includes("frente") || consulta.includes("lider") || consulta.includes("placar") || consulta.includes("ganhou")) {
    if (!lider || !outro) return "Está empatado neste momento.";
    return `${curto(lider.nome)} está na frente com ${pctDe(lider, totais.votosValidos)}. ${curto(outro.nome)} tem ${pctDe(outro, totais.votosValidos)}.`;
  }
  return null;
}
