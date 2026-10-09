export type Bloco = "feitos" | "acusacoes" | "checagens" | "pendencias";

export type Item = {
  texto: string;
  fonte: string;
  url?: string;
};

export type Dossie = {
  id: "lula" | "flavio";
  itens: Record<Bloco, Item[]>;
};

const G1 =
  "https://g1.globo.com/politica/noticia/2026/09/29/gilmar-mantem-quebra-de-sigilos-de-ex-assessora-de-flavio-bolsonaro-em-investigacao-sobre-rachadinha.ghtml";
const TSE =
  "https://www.gazetadopovo.com.br/eleicoes/2026/tse-contraria-mendonca-e-manda-flavio-remover-videos-que-associam-lula-a-faccoes/";

const DOSSIES: Dossie[] = [
  {
    id: "lula",
    itens: {
      feitos: [
        { texto: "Presidente da República de 2003 a 2010 e de novo desde 1º de janeiro de 2023. É o ocupante do cargo neste 2º turno.", fonte: "Posse e mandatos públicos" },
        { texto: "Foi metalúrgico e presidente do Sindicato dos Metalúrgicos de São Bernardo do Campo e Diadema. Ajudou a fundar o PT em 1980.", fonte: "Biografia pública" },
        { texto: "No primeiro governo criou o Bolsa Família, Lei 10.836, de 2004, que unificou programas de transferência de renda.", fonte: "Lei 10.836/2004" },
        { texto: "Lançou o Programa de Aceleração do Crescimento em janeiro de 2007.", fonte: "Anúncio do PAC, 2007" },
        { texto: "Sancionou a Minha Casa Minha Vida, Lei 11.977, de 2009.", fonte: "Lei 11.977/2009" },
        { texto: "Voltou a ser eleito em 2022, no 2º turno, e tomou posse em 2023. As condenações da Lava Jato já tinham sido anuladas e não o tornavam inelegível.", fonte: "Eleição de 2022 e STF, 2021" },
      ],
      acusacoes: [
        { texto: "Em 2017 foi condenado na 13ª Vara Federal de Curitiba no caso do tríplex do Guarujá, por corrupção passiva e lavagem de dinheiro. Houve outra condenação no caso do sítio de Atibaia. Isso é o que a sentença disse na época.", fonte: "Sentenças da Lava Jato, 2017" },
        { texto: "Em 2021 o STF anulou essas condenações: a 13ª Vara de Curitiba foi declarada incompetente e, no tríplex, Sergio Moro foi considerado suspeito. O Supremo não julgou se o fato aconteceu. Não é absolvição de mérito e também não é condenação válida.", fonte: "STF, 2021" },
        { texto: "Hoje não há condenação criminal válida nesses processos. Tratar Lula como condenado ou inelegível por eles está errado.", fonte: "STF, 2021" },
      ],
      checagens: [
        { texto: "Não confere: “Lula está preso, condenado ou impedido de concorrer por causa da Lava Jato”. As condenações foram anuladas em 2021. Ele tomou posse em 2023.", fonte: "STF, 2021" },
        { texto: "Não confere como prova de ligação com facção: em 8 e 9 de outubro de 2026 o TSE, por unanimidade, mandou Flávio Bolsonaro remover três postagens que associavam Lula ao PCC e ao Comando Vermelho. O relator tinha negado a liminar e depois acompanhou o plenário. O tribunal viu as falas recortadas como reais, sem montagem, e ainda assim considerou o uso enganoso.", fonte: "TSE, 8–9/10/2026", url: TSE },
      ],
      pendencias: [
        { texto: "Fez, no registro: dois mandatos completos, a volta em 2023, Bolsa Família, PAC e Minha Casa Minha Vida.", fonte: "Leis e mandatos citados acima" },
        { texto: "Não fechou: tríplex e sítio não tiveram novo julgamento de mérito depois da anulação. A acusação continua sem resposta criminal definitiva, para os dois lados.", fonte: "STF, 2021" },
      ],
    },
  },
  {
    id: "flavio",
    itens: {
      feitos: [
        { texto: "Deputado estadual do Rio de Janeiro de 2003 a 2019.", fonte: "Mandatos na Alerj" },
        { texto: "Senador pelo Rio de Janeiro desde 2019, eleito em 2018.", fonte: "Senado" },
        { texto: "Candidato do PL à Presidência neste 2º turno. Na urna o número é 22.", fonte: "Registro eleitoral de 2026" },
      ],
      acusacoes: [
        { texto: "Em outubro de 2020 o Ministério Público do Rio denunciou Flávio Bolsonaro, Fabrício Queiroz e outros 15 investigados por organização criminosa, peculato, lavagem de dinheiro e apropriação indébita. A acusação descreve um esquema de “rachadinha” no gabinete da Alerj entre 2007 e 2018: pelo menos 13 assessores teriam repassado parte do salário, e a conta de Queiroz teria recebido mais de R$ 2 milhões. Isso é a denúncia, não uma sentença.", fonte: "MP-RJ, outubro de 2020", url: G1 },
        { texto: "O STJ e o STF invalidaram provas centrais dessa investigação, em especial quebras de sigilo e relatórios do Coaf. Em 2022 o Tribunal de Justiça do Rio rejeitou a denúncia por falta de justa causa. Flávio foi denunciado e não foi condenado. A Justiça não julgou se a rachadinha aconteceu.", fonte: "STJ, STF e TJ-RJ, 2022", url: G1 },
        { texto: "Em 2023 o MP-RJ entrou com ação civil de improbidade. Em 29 de setembro de 2026 o ministro Gilmar Mendes manteve a quebra dos sigilos bancário e fiscal de Danielle da Nóbrega, ex-assessora de Flávio. A decisão cita relatórios do Coaf e do MP como indício de repasse de salário. Não condena Flávio.", fonte: "STF, Gilmar Mendes, 29/09/2026", url: G1 },
      ],
      checagens: [
        { texto: "Não confere: “Flávio já foi condenado pela rachadinha”. Houve denúncia, anulação de provas e rejeição da denúncia em 2022. Não houve condenação.", fonte: "TJ-RJ, 2022", url: G1 },
        { texto: "Também não confere o contrário, “a investigação acabou e ele foi inocentado no mérito”. O mérito não foi julgado. Em setembro de 2026 o STF ainda manteve quebra de sigilo numa apuração ligada ao mesmo gabinete.", fonte: "STF, 29/09/2026", url: G1 },
      ],
      pendencias: [
        { texto: "Fez, no registro: quatro legislaturas como deputado estadual do Rio e o mandato de senador desde 2019.", fonte: "Alerj e Senado" },
        { texto: "Não fechou: a acusação de rachadinha não teve julgamento de mérito. Não existe condenação nem absolvição. A ação civil de improbidade segue como investigação, não como culpa formada.", fonte: "TJ-RJ, 2022, e STF, 2026", url: G1 },
      ],
    },
  },
];

function semAcento(valor: string) {
  return valor.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function acharDossie(nome: string): Dossie | null {
  const texto = semAcento(nome);
  if (texto.includes("lula") || texto.includes("luiz inacio")) return DOSSIES[0];
  if (texto.includes("flavio") && texto.includes("bolsonaro")) return DOSSIES[1];
  return null;
}
