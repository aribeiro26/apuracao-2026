import type { Locale } from "@/lib/locale";

export type TipoReportagem = "fez" | "acusado" | "fake" | "deixou";

export type Reportagem = {
  titulo: string;
  veiculo: string;
  url: string;
  resumo: string;
};

const FEZ: Record<Locale, Reportagem[]> = {
  "pt-BR": [
    {
      titulo: "Flávio defende programas sociais na TV; Lula critica cortes",
      veiculo: "SpaceMoney",
      url: "https://www.spacemoney.com.br/politica/flavio-lula-propaganda-tv-2-turno/",
      resumo: "A reportagem de 9 de outubro diz que, no horário eleitoral, Flávio prometeu reajustar o Bolsa Família, manter o benefício de quem trabalha, reduzir parcelas do Minha Casa Minha Vida e dar ao SUS um padrão que chamou de Einstein. A peça de Lula criticou cortes de saúde, habitação e merenda na gestão de Jair Bolsonaro.",
    },
    {
      titulo: "Flávio promete maioridade penal aos 16 anos e corte de impostos",
      veiculo: "g1",
      url: "https://g1.globo.com/rj/rio-de-janeiro/eleicoes/2026/noticia/2026/09/26/flavio-bolsonaro-agenda-baixada-fluminense.ghtml",
      resumo: "O g1 registrou, em 26 de setembro, o discurso de Flávio na Baixada Fluminense: ele prometeu reduzir a maioridade penal para 16 anos, cortar impostos e falou em saúde no padrão Einstein.",
    },
    {
      titulo: "No horário eleitoral, os dois levam STF e investigações à TV",
      veiculo: "g1",
      url: "https://g1.globo.com/politica/eleicoes/2026/noticia/2026/09/15/em-dia-de-julgamento-no-stf-flavio-bolsonaro-liga-lula-a-moraes-e-presidente-explora-investigacao-contra-senador.ghtml",
      resumo: "O g1 descreveu a propaganda de 15 de setembro: Flávio associou Lula a Alexandre de Moraes e falou em desequilíbrio institucional. A campanha de Lula citou investigações envolvendo o senador no caso do Banco Master.",
    },
  ],
  "pt-PT": [
    {
      titulo: "Flávio defende programas sociais na TV; Lula critica cortes",
      veiculo: "SpaceMoney",
      url: "https://www.spacemoney.com.br/politica/flavio-lula-propaganda-tv-2-turno/",
      resumo: "A reportagem de 9 de outubro diz que Flávio prometeu, no tempo de antena, reforçar o Bolsa Família, manter o benefício de quem trabalha e reduzir prestações do Minha Casa Minha Vida. A peça de Lula criticou cortes de saúde, habitação e refeições escolares na gestão de Jair Bolsonaro.",
    },
    {
      titulo: "Flávio promete maioridade penal aos 16 anos e corte de impostos",
      veiculo: "g1",
      url: "https://g1.globo.com/rj/rio-de-janeiro/eleicoes/2026/noticia/2026/09/26/flavio-bolsonaro-agenda-baixada-fluminense.ghtml",
      resumo: "O g1 registou, em 26 de setembro, o discurso de Flávio na Baixada Fluminense: prometeu baixar a maioridade penal para 16 anos e cortar impostos.",
    },
    {
      titulo: "No horário eleitoral, os dois levam o STF e investigações à TV",
      veiculo: "g1",
      url: "https://g1.globo.com/politica/eleicoes/2026/noticia/2026/09/15/em-dia-de-julgamento-no-stf-flavio-bolsonaro-liga-lula-a-moraes-e-presidente-explora-investigacao-contra-senador.ghtml",
      resumo: "O g1 descreveu a propaganda de 15 de setembro: Flávio associou Lula a Alexandre de Moraes. A campanha de Lula citou investigações ao senador no caso do Banco Master.",
    },
  ],
  es: [
    {
      titulo: "Flávio defiende programas sociales en la TV; Lula critica recortes",
      veiculo: "SpaceMoney",
      url: "https://www.spacemoney.com.br/politica/flavio-lula-propaganda-tv-2-turno/",
      resumo: "La nota del 9 de octubre dice que Flávio prometió reajustar Bolsa Família, mantener el beneficio de quien trabaja y bajar las cuotas de Minha Casa Minha Vida. La pieza de Lula criticó recortes de salud, vivienda y alimentación escolar en el gobierno de Jair Bolsonaro.",
    },
    {
      titulo: "Flávio promete mayoría penal a los 16 años y menos impuestos",
      veiculo: "g1",
      url: "https://g1.globo.com/rj/rio-de-janeiro/eleicoes/2026/noticia/2026/09/26/flavio-bolsonaro-agenda-baixada-fluminense.ghtml",
      resumo: "g1 registró, el 26 de septiembre, el discurso de Flávio en la Baixada Fluminense: prometió bajar la mayoría penal a 16 años y recortar impuestos.",
    },
    {
      titulo: "En la TV, los dos llevan el STF y las investigaciones a la campaña",
      veiculo: "g1",
      url: "https://g1.globo.com/politica/eleicoes/2026/noticia/2026/09/15/em-dia-de-julgamento-no-stf-flavio-bolsonaro-liga-lula-a-moraes-e-presidente-explora-investigacao-contra-senador.ghtml",
      resumo: "g1 describió la propaganda del 15 de septiembre: Flávio vinculó a Lula con Alexandre de Moraes. La campaña de Lula citó investigaciones sobre el senador en el caso Banco Master.",
    },
  ],
  en: [
    {
      titulo: "Flávio defends social programs on TV; Lula criticizes cuts",
      veiculo: "SpaceMoney",
      url: "https://www.spacemoney.com.br/politica/flavio-lula-propaganda-tv-2-turno/",
      resumo: "The 9 October report says Flávio promised on the free airtime to raise Bolsa Família, keep the benefit for people who work, and cut Minha Casa Minha Vida installments. Lula's ad criticized health, housing and school-meal cuts under Jair Bolsonaro.",
    },
    {
      titulo: "Flávio promises a lower age of criminal responsibility and tax cuts",
      veiculo: "g1",
      url: "https://g1.globo.com/rj/rio-de-janeiro/eleicoes/2026/noticia/2026/09/26/flavio-bolsonaro-agenda-baixada-fluminense.ghtml",
      resumo: "On 26 September, g1 reported Flávio's speech in the Baixada Fluminense: he promised to lower the age of criminal responsibility to 16 and to cut taxes.",
    },
    {
      titulo: "On TV, both campaigns bring the Supreme Court and investigations",
      veiculo: "g1",
      url: "https://g1.globo.com/politica/eleicoes/2026/noticia/2026/09/15/em-dia-de-julgamento-no-stf-flavio-bolsonaro-liga-lula-a-moraes-e-presidente-explora-investigacao-contra-senador.ghtml",
      resumo: "g1 described the 15 September ads: Flávio linked Lula to Justice Alexandre de Moraes. Lula's campaign cited investigations involving the senator in the Banco Master case.",
    },
  ],
};

const ACUSADO: Record<Locale, Reportagem[]> = {
  "pt-BR": [
    {
      titulo: "TSE manda tirar posts que associam Lula a facções e multa Flávio",
      veiculo: "g1",
      url: "https://g1.globo.com/politica/eleicoes/2026/noticia/2026/10/09/tse-determina-remocao-de-posts-que-associam-lula-a-faccoes-criminosas-flavio-e-multado-em-r-5-mil.ghtml",
      resumo: "O g1 informa que o TSE, em 8 de outubro, mandou remover publicações da campanha de Flávio que associam Lula a facções. A corte disse que a associação sem base mínima ultrapassa a crítica. Também há multa de R$ 5 mil.",
    },
    {
      titulo: "Flávio aciona o TSE contra o que chama de fake news pró-Lula",
      veiculo: "CNN Brasil",
      url: "https://www.cnnbrasil.com.br/blogs/caio-junqueira/eleicoes/flavio-aciona-tse-contra-campanha-do-medo-com-fake-news-em-massa-pro-lula/",
      resumo: "A CNN relata que Flávio protocolou uma ação no TSE contra Lula. A defesa aponta posts que dizem, por exemplo, que ele acabaria com o Bolsa Família ou privatizaria o SUS. A classificação de falso, na reportagem, é a da própria campanha, não uma sentença.",
    },
    {
      titulo: "Campanha de Lula cita investigação contra o senador",
      veiculo: "g1",
      url: "https://g1.globo.com/politica/eleicoes/2026/noticia/2026/09/15/em-dia-de-julgamento-no-stf-flavio-bolsonaro-liga-lula-a-moraes-e-presidente-explora-investigacao-contra-senador.ghtml",
      resumo: "O g1 diz que a propaganda de Lula explorou investigações contra Flávio no caso do Banco Master. É o que a campanha levou ao ar, não uma conclusão deste site.",
    },
  ],
  "pt-PT": [
    {
      titulo: "TSE manda tirar posts que associam Lula a facções e multa Flávio",
      veiculo: "g1",
      url: "https://g1.globo.com/politica/eleicoes/2026/noticia/2026/10/09/tse-determina-remocao-de-posts-que-associam-lula-a-faccoes-criminosas-flavio-e-multado-em-r-5-mil.ghtml",
      resumo: "O g1 informa que o TSE, a 8 de outubro, mandou remover publicações da campanha de Flávio que associam Lula a facções. O tribunal disse que a associação sem base mínima ultrapassa a crítica. Há também uma multa de R$ 5 mil.",
    },
    {
      titulo: "Flávio aciona o TSE contra o que chama de notícias falsas pró-Lula",
      veiculo: "CNN Brasil",
      url: "https://www.cnnbrasil.com.br/blogs/caio-junqueira/eleicoes/flavio-aciona-tse-contra-campanha-do-medo-com-fake-news-em-massa-pro-lula/",
      resumo: "A CNN relata que Flávio apresentou uma ação no TSE contra Lula. A defesa aponta publicações que dizem, por exemplo, que ele acabaria com o Bolsa Família. Quem classifica isso como falso, na reportagem, é a campanha, não uma sentença.",
    },
    {
      titulo: "A campanha de Lula cita uma investigação contra o senador",
      veiculo: "g1",
      url: "https://g1.globo.com/politica/eleicoes/2026/noticia/2026/09/15/em-dia-de-julgamento-no-stf-flavio-bolsonaro-liga-lula-a-moraes-e-presidente-explora-investigacao-contra-senador.ghtml",
      resumo: "O g1 diz que a propaganda de Lula explorou investigações a Flávio no caso do Banco Master. É o que a campanha levou ao ar, não uma conclusão deste sítio.",
    },
  ],
  es: [
    {
      titulo: "El TSE ordena borrar posts que vinculan a Lula con facciones y multa a Flávio",
      veiculo: "g1",
      url: "https://g1.globo.com/politica/eleicoes/2026/noticia/2026/10/09/tse-determina-remocao-de-posts-que-associam-lula-a-faccoes-criminosas-flavio-e-multado-em-r-5-mil.ghtml",
      resumo: "g1 informa que el TSE, el 8 de octubre, ordenó retirar publicaciones de la campaña de Flávio que asocian a Lula con facciones. El tribunal dijo que el vínculo sin base mínima supera la crítica. También hay una multa de 5 mil reales.",
    },
    {
      titulo: "Flávio acude al TSE por lo que llama noticias falsas a favor de Lula",
      veiculo: "CNN Brasil",
      url: "https://www.cnnbrasil.com.br/blogs/caio-junqueira/eleicoes/flavio-aciona-tse-contra-campanha-do-medo-com-fake-news-em-massa-pro-lula/",
      resumo: "CNN cuenta que Flávio presentó una acción contra Lula. La defensa señala posts que dicen, por ejemplo, que él acabaría con Bolsa Família. Quien los llama falsos, según la nota, es la campaña, no una sentencia.",
    },
    {
      titulo: "La campaña de Lula cita una investigación contra el senador",
      veiculo: "g1",
      url: "https://g1.globo.com/politica/eleicoes/2026/noticia/2026/09/15/em-dia-de-julgamento-no-stf-flavio-bolsonaro-liga-lula-a-moraes-e-presidente-explora-investigacao-contra-senador.ghtml",
      resumo: "g1 dice que la propaganda de Lula mencionó investigaciones contra Flávio en el caso Banco Master. Es lo que la campaña puso al aire, no una conclusión de este sitio.",
    },
  ],
  en: [
    {
      titulo: "Electoral court orders removal of posts linking Lula to gangs and fines Flávio",
      veiculo: "g1",
      url: "https://g1.globo.com/politica/eleicoes/2026/noticia/2026/10/09/tse-determina-remocao-de-posts-que-associam-lula-a-faccoes-criminosas-flavio-e-multado-em-r-5-mil.ghtml",
      resumo: "g1 reports that on 8 October the TSE ordered Flávio's campaign to remove posts linking Lula to criminal gangs. The court said the link lacked a minimal factual basis. It also set a fine of 5,000 reais.",
    },
    {
      titulo: "Flávio asks the electoral court to act on what he calls pro-Lula fake news",
      veiculo: "CNN Brasil",
      url: "https://www.cnnbrasil.com.br/blogs/caio-junqueira/eleicoes/flavio-aciona-tse-contra-campanha-do-medo-com-fake-news-em-massa-pro-lula/",
      resumo: "CNN reports that Flávio filed a case against Lula. His lawyers point to posts claiming, for example, that he would end Bolsa Família. In the story, that 'false' label comes from the campaign, not from a ruling.",
    },
    {
      titulo: "Lula's campaign cites an investigation involving the senator",
      veiculo: "g1",
      url: "https://g1.globo.com/politica/eleicoes/2026/noticia/2026/09/15/em-dia-de-julgamento-no-stf-flavio-bolsonaro-liga-lula-a-moraes-e-presidente-explora-investigacao-contra-senador.ghtml",
      resumo: "g1 says Lula's ad raised investigations involving Flávio in the Banco Master case. That is what the campaign broadcast, not a finding of this site.",
    },
  ],
};

const FAKE: Record<Locale, Reportagem[]> = {
  "pt-BR": [
    {
      titulo: "Pausa na divulgação dos resultados não comprova fraude",
      veiculo: "AFP Checamos",
      url: "https://checamos.afp.com/doc.afp.com.D2NY7KJ",
      resumo: "A AFP checou a alegação de que uma pausa na tela nacional da apuração, em 4 de outubro, provaria fraude contra Flávio. O TSE e especialistas ouvidos pela agência dizem que a pausa foi só na consolidação nacional, e que as urnas continuaram chegando.",
    },
    {
      titulo: "TSE manda apagar vídeos com IA que associam Lula a facções",
      veiculo: "CNN Brasil",
      url: "https://www.cnnbrasil.com.br/eleicoes/tse-manda-flavio-apagar-videos-com-ia-que-associam-lula-a-faccoes/",
      resumo: "A CNN relata que o TSE mandou remover três publicações de Flávio. Uma, segundo a corte, usou IA para simular uma imagem de Lula numa situação inexistente. Outras associavam o presidente a facções sem base factual mínima.",
    },
    {
      titulo: "Ação de Flávio lista posts que a defesa chama de campanha do medo",
      veiculo: "CNN Brasil",
      url: "https://www.cnnbrasil.com.br/blogs/caio-junqueira/eleicoes/flavio-aciona-tse-contra-campanha-do-medo-com-fake-news-em-massa-pro-lula/",
      resumo: "A CNN descreve a ação em que a defesa de Flávio aponta posts sobre privatizar o SUS, acabar com o Bolsa Família, o 13º e a Farmácia Popular. A reportagem apresenta isso como alegação da campanha, ainda sem decisão do TSE sobre cada frase.",
    },
  ],
  "pt-PT": [
    {
      titulo: "A pausa na divulgação dos resultados não comprova fraude",
      veiculo: "AFP Checamos",
      url: "https://checamos.afp.com/doc.afp.com.D2NY7KJ",
      resumo: "A AFP verificou a alegação de que uma pausa no ecrã nacional da apuração, a 4 de outubro, provaria fraude contra Flávio. O TSE e especialistas ouvidos pela agência dizem que a pausa foi só na consolidação nacional.",
    },
    {
      titulo: "O TSE manda apagar vídeos com IA que associam Lula a facções",
      veiculo: "CNN Brasil",
      url: "https://www.cnnbrasil.com.br/eleicoes/tse-manda-flavio-apagar-videos-com-ia-que-associam-lula-a-faccoes/",
      resumo: "A CNN relata que o TSE mandou remover três publicações de Flávio. Uma, segundo o tribunal, usou IA para simular uma imagem de Lula numa situação que não existiu.",
    },
    {
      titulo: "A ação de Flávio lista posts que a defesa chama de campanha do medo",
      veiculo: "CNN Brasil",
      url: "https://www.cnnbrasil.com.br/blogs/caio-junqueira/eleicoes/flavio-aciona-tse-contra-campanha-do-medo-com-fake-news-em-massa-pro-lula/",
      resumo: "A CNN descreve a ação em que a defesa de Flávio aponta publicações sobre privatizar o SUS e acabar com o Bolsa Família. A reportagem trata isso como alegação da campanha, ainda sem decisão do TSE sobre cada frase.",
    },
  ],
  es: [
    {
      titulo: "La pausa en la divulgación de resultados no prueba fraude",
      veiculo: "AFP Checamos",
      url: "https://checamos.afp.com/doc.afp.com.D2NY7KJ",
      resumo: "AFP revisó la afirmación de que una pausa en la pantalla nacional del escrutinio, el 4 de octubre, probaría fraude contra Flávio. El TSE y especialistas citados dicen que la pausa fue solo en la consolidación nacional.",
    },
    {
      titulo: "El TSE manda borrar videos con IA que vinculan a Lula con facciones",
      veiculo: "CNN Brasil",
      url: "https://www.cnnbrasil.com.br/eleicoes/tse-manda-flavio-apagar-videos-com-ia-que-associam-lula-a-faccoes/",
      resumo: "CNN relata que el TSE ordenó retirar tres publicaciones de Flávio. Una, según el tribunal, usó IA para simular una imagen de Lula en una situación que no ocurrió.",
    },
    {
      titulo: "La acción de Flávio enumera posts que la defensa llama campaña del miedo",
      veiculo: "CNN Brasil",
      url: "https://www.cnnbrasil.com.br/blogs/caio-junqueira/eleicoes/flavio-aciona-tse-contra-campanha-do-medo-com-fake-news-em-massa-pro-lula/",
      resumo: "CNN describe la acción en la que la defensa de Flávio señala posts sobre privatizar el SUS y acabar con Bolsa Família. La nota lo presenta como alegación de la campaña, todavía sin fallo del TSE sobre cada frase.",
    },
  ],
  en: [
    {
      titulo: "A pause on the results screen does not prove fraud",
      veiculo: "AFP Checamos",
      url: "https://checamos.afp.com/doc.afp.com.D2NY7KJ",
      resumo: "AFP checked the claim that a pause on the national results view on 4 October proved fraud against Flávio. The TSE and experts quoted by the agency say the pause was only in the national rollup, while polling-station data kept arriving.",
    },
    {
      titulo: "Electoral court orders removal of AI videos linking Lula to gangs",
      veiculo: "CNN Brasil",
      url: "https://www.cnnbrasil.com.br/eleicoes/tse-manda-flavio-apagar-videos-com-ia-que-associam-lula-a-faccoes/",
      resumo: "CNN reports that the TSE ordered three of Flávio's posts removed. One, the court said, used AI to place Lula in a scene that did not happen. Others linked him to gangs without a minimal factual basis.",
    },
    {
      titulo: "Flávio's filing lists posts his campaign calls a fear campaign",
      veiculo: "CNN Brasil",
      url: "https://www.cnnbrasil.com.br/blogs/caio-junqueira/eleicoes/flavio-aciona-tse-contra-campanha-do-medo-com-fake-news-em-massa-pro-lula/",
      resumo: "CNN describes the case in which Flávio's lawyers flag posts about privatizing the SUS and ending Bolsa Família. The story presents that as the campaign's allegation, not as a ruling on each sentence.",
    },
  ],
};

const DEIXOU: Record<Locale, Reportagem[]> = {
  "pt-BR": [
    {
      titulo: "Promessas de Flávio na TV ficam sem o como; Lula lembra cortes",
      veiculo: "SpaceMoney",
      url: "https://www.spacemoney.com.br/politica/flavio-lula-propaganda-tv-2-turno/",
      resumo: "A SpaceMoney anotou, em 9 de outubro, que Flávio prometeu reajuste do Bolsa Família, Farmácia Popular e SUS no padrão Einstein, mas a peça não detalhou como. A propaganda de Lula disse que cortes de saúde, habitação e merenda da gestão anterior não podem se repetir.",
    },
    {
      titulo: "Datafolha: aprovação e desaprovação do governo Lula seguem próximas",
      veiculo: "O Globo",
      url: "https://oglobo.globo.com/blogs/pulso/post/2026/10/datafolha-flavio-bolsonaro-tem-49percent-no-segundo-turno-contra-45percent-de-lula.ghtml",
      resumo: "O Globo, ao noticiar o Datafolha de 8 de outubro, registrou que a desaprovação ao governo Lula se mantinha em 49% e a aprovação em 48%. É leitura de pesquisa, não um balanço deste site sobre o que ficou por fazer.",
    },
  ],
  "pt-PT": [
    {
      titulo: "As promessas de Flávio na TV ficam sem o como; Lula lembra cortes",
      veiculo: "SpaceMoney",
      url: "https://www.spacemoney.com.br/politica/flavio-lula-propaganda-tv-2-turno/",
      resumo: "A SpaceMoney anotou, a 9 de outubro, que Flávio prometeu reforçar o Bolsa Família e o SUS, mas a peça não explicou como. A propaganda de Lula disse que os cortes da gestão anterior não se podem repetir.",
    },
    {
      titulo: "Datafolha: aprovação e desaprovação do governo Lula continuam próximas",
      veiculo: "O Globo",
      url: "https://oglobo.globo.com/blogs/pulso/post/2026/10/datafolha-flavio-bolsonaro-tem-49percent-no-segundo-turno-contra-45percent-de-lula.ghtml",
      resumo: "O Globo, ao noticiar o Datafolha de 8 de outubro, registou que a desaprovação do governo Lula se mantinha em 49% e a aprovação em 48%. É leitura de sondagem, não um balanço deste sítio.",
    },
  ],
  es: [
    {
      titulo: "Las promesas de Flávio en la TV no explican el cómo; Lula recuerda recortes",
      veiculo: "SpaceMoney",
      url: "https://www.spacemoney.com.br/politica/flavio-lula-propaganda-tv-2-turno/",
      resumo: "SpaceMoney anotó, el 9 de octubre, que Flávio prometió reajustar Bolsa Família y el SUS, pero la pieza no detalló cómo. La propaganda de Lula dijo que los recortes del gobierno anterior no pueden repetirse.",
    },
    {
      titulo: "Datafolha: aprobación y desaprobación del gobierno de Lula siguen cerca",
      veiculo: "O Globo",
      url: "https://oglobo.globo.com/blogs/pulso/post/2026/10/datafolha-flavio-bolsonaro-tem-49percent-no-segundo-turno-contra-45percent-de-lula.ghtml",
      resumo: "O Globo, al contar el Datafolha del 8 de octubre, registró que la desaprobación del gobierno de Lula seguía en 49% y la aprobación en 48%. Es la lectura de una encuesta, no un balance de este sitio.",
    },
  ],
  en: [
    {
      titulo: "Flávio's TV promises skip the how; Lula's ad recalls cuts",
      veiculo: "SpaceMoney",
      url: "https://www.spacemoney.com.br/politica/flavio-lula-propaganda-tv-2-turno/",
      resumo: "SpaceMoney noted on 9 October that Flávio promised a higher Bolsa Família and a stronger SUS, but the ad did not explain how. Lula's ad said health, housing and school-meal cuts from the previous government must not return.",
    },
    {
      titulo: "Datafolha: approval and disapproval of Lula's government stay close",
      veiculo: "O Globo",
      url: "https://oglobo.globo.com/blogs/pulso/post/2026/10/datafolha-flavio-bolsonaro-tem-49percent-no-segundo-turno-contra-45percent-de-lula.ghtml",
      resumo: "Reporting the 8 October Datafolha, O Globo said disapproval of Lula's government was still 49% and approval 48%. That is the poll's reading, not this site's audit of unfinished work.",
    },
  ],
};

const POR_TIPO: Record<TipoReportagem, Record<Locale, Reportagem[]>> = {
  fez: FEZ,
  acusado: ACUSADO,
  fake: FAKE,
  deixou: DEIXOU,
};

export function ehTipoReportagem(valor: string): valor is TipoReportagem {
  return valor === "fez" || valor === "acusado" || valor === "fake" || valor === "deixou";
}

export function sementeDe(tipo: TipoReportagem, locale: Locale): Reportagem[] {
  return POR_TIPO[tipo][locale];
}

export function disputaPresidencial(nomes: string[]): boolean {
  const texto = nomes.join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return texto.includes("flavio") && texto.includes("lula");
}
