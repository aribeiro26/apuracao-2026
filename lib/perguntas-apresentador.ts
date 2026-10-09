import { primeiroNome, textoDaFrente } from "@/components/DisputaVisual";
import type { Resultado } from "@/lib/conta";
import { numero, percentual, razao } from "@/lib/format";
import type { Copy } from "@/lib/i18n";
import { cenarioDaDisputa, parDaDisputa, vencedorLocal, type EleitoLista, type Par } from "@/lib/placar";

export type PerguntaPronta = { id: string; pergunta: string; resposta: string };

type Cidades = { candidatos: Resultado["candidatos"] | null }[];

export function montarPerguntas(entrada: {
  copy: Copy;
  idioma: string;
  lugar: string;
  resultado: Resultado | null;
  unidades: Resultado[];
  cidades: Cidades;
  eleitos: EleitoLista[];
}): PerguntaPronta[] {
  const { copy, idioma, lugar, resultado, unidades, cidades, eleitos } = entrada;
  const par = resultado ? parDaDisputa(resultado.candidatos) : null;
  const lista: PerguntaPronta[] = [];
  const aqui = (texto: string) => (lugar ? `${copy.respostaNestaTela(lugar)} ${texto}` : texto);

  if (par && resultado) {
    lista.push({ id: "ganha", pergunta: copy.perguntaQuemGanha, resposta: aqui(quemGanha(par, resultado, copy, idioma)) });
    lista.push({ id: "frente", pergunta: copy.perguntaFrente, resposta: aqui(textoDaFrente(par, resultado, copy, idioma)) });
    lista.push({ id: "passar", pergunta: copy.perguntaPassar, resposta: aqui(aindaPassa(par, resultado, copy, idioma)) });
    lista.push({ id: "apurado", pergunta: copy.perguntaApurado, resposta: aqui(apurado(resultado, copy, idioma)) });
  }

  if (resultado?.cargo === "presidente" && unidades.length) {
    const contagem = contarNaFrente(par, unidades);
    if (par && (contagem.azul || contagem.vermelho)) {
      lista.push({
        id: "estados",
        pergunta: copy.perguntaEstados,
        resposta: `${copy.estadosNaFrente(primeiroNome(par.azul.nome), contagem.azul)} ${copy.estadosNaFrente(primeiroNome(par.vermelho.nome), contagem.vermelho)}`,
      });
    }
  }

  if (par && cidades.length) {
    const azuis = cidades.filter((cidade) => vencedorLocal(par, cidade.candidatos) === "azul").length;
    const vermelhos = cidades.filter((cidade) => vencedorLocal(par, cidade.candidatos) === "vermelho").length;
    if (azuis || vermelhos) {
      lista.push({
        id: "cidades",
        pergunta: copy.perguntaCidades,
        resposta: `${copy.municipioDele(primeiroNome(par.azul.nome), azuis)} ${copy.municipioDele(primeiroNome(par.vermelho.nome), vermelhos)}`,
      });
    }
  }

  if (resultado && resultado.totais.eleitorado > 0) {
    lista.push({
      id: "presenca",
      pergunta: copy.perguntaPresenca,
      resposta: aqui(
        copy.respostaPresenca(
          numero(resultado.totais.comparecimento, idioma),
          numero(resultado.totais.eleitorado, idioma),
          numero(resultado.totais.abstencao, idioma),
        ),
      ),
    });
  }

  if (resultado && resultado.totais.brancos + resultado.totais.nulos > 0) {
    lista.push({
      id: "brancos",
      pergunta: copy.perguntaBrancos,
      resposta: aqui(`${copy.brancos}: ${numero(resultado.totais.brancos, idioma)}. ${copy.nulos}: ${numero(resultado.totais.nulos, idioma)}.`),
    });
  }

  lista.push({
    id: "eleitos",
    pergunta: copy.perguntaEleitos,
    resposta: eleitos.length
      ? copy.respostaEleitosNomes(
          `${eleitos
            .slice(0, 8)
            .map((item) => `${primeiroNome(item.candidato.nome)} (${item.resultado.nomeUf})`)
            .join(", ")}${eleitos.length > 8 ? `. ${copy.eleitosConta(eleitos.length)}` : ""}`,
        )
      : copy.eleitosVazio,
  });
  lista.push({
    id: "quando",
    pergunta: copy.perguntaQuando,
    resposta: `${copy.dataTurnoQuando}. ${copy.dataTurnoHorario}`,
  });

  return lista;
}

function quemGanha(par: Par, resultado: Resultado, copy: Copy, idioma: string): string {
  const cenario = cenarioDaDisputa(par, resultado);
  if (cenario.tipo === "eleito") {
    const nome = primeiroNome(cenario.nome);
    return `${copy.cenarioEleito(nome)} ${copy.opiniaoFecha(nome)}`;
  }
  if (cenario.tipo === "empate") return copy.cenarioEmpate;
  if (cenario.tipo === "segue") return `${copy.cenarioSegue} ${textoDaFrente(par, resultado, copy, idioma)}`;
  const nome = primeiroNome(cenario.nome);
  const conta = cenario.faltam == null ? copy.cenarioAbertoSemConta(nome) : copy.cenarioAberto(nome, numero(cenario.faltam, idioma));
  return `${conta} ${copy.opiniaoAberta(nome)}`;
}

function aindaPassa(par: Par, resultado: Resultado, copy: Copy, idioma: string): string {
  const cenario = cenarioDaDisputa(par, resultado);
  if (cenario.tipo === "eleito") return copy.cenarioEleito(primeiroNome(cenario.nome));
  if (cenario.tipo === "empate") return copy.empatePlacar;
  if (cenario.tipo === "segue") return `${copy.cenarioSegue} ${textoDaFrente(par, resultado, copy, idioma)}`;
  if (cenario.faltam == null) return copy.cenarioAbertoSemConta(primeiroNome(cenario.nome));
  return copy.cenarioAberto(primeiroNome(cenario.nome), numero(cenario.faltam, idioma));
}

function apurado(resultado: Resultado, copy: Copy, idioma: string): string {
  const pct = percentual(razao(resultado.totais.secoesApuradas, resultado.totais.secoesTotal), 1, idioma);
  return `${copy.urnas(pct)} ${copy.secoes(pct, numero(resultado.totais.secoesApuradas, idioma), numero(resultado.totais.secoesTotal, idioma))}`;
}

function contarNaFrente(par: Par | null, unidades: Resultado[]): { azul: number; vermelho: number } {
  if (!par) return { azul: 0, vermelho: 0 };
  let azul = 0;
  let vermelho = 0;
  for (const unidade of unidades) {
    if (unidade.uf === "zz") continue;
    const lado = vencedorLocal(par, unidade.candidatos);
    if (lado === "azul") azul += 1;
    if (lado === "vermelho") vermelho += 1;
  }
  return { azul, vermelho };
}
