import type { Locale } from "./locale";

export type MonitorCopy = {
  titulo: string;
  nota: string;
  vazio: string;
  falha: string;
  evolucao: string;
  alertas: string;
  semAlerta: string;
  legenda: string;
  historico: string;
  amostras: (n: number) => string;
  voltar: string;
  presidente: string;
  governador: string;
  hora: string;
  candidato: string;
  votos: string;
  urnas: string;
  regras: { tipo: string; titulo: string; texto: string }[];
};

const REGRAS_PT: MonitorCopy["regras"] = [
  { tipo: "votos-caiu", titulo: "Votos para trás", texto: "Os votos de um candidato diminuíram. Na apuração o número segue para a frente. Queda pode ser correção do arquivo, mas não é o caminho normal." },
  { tipo: "urnas-caiu", titulo: "Urnas para trás", texto: "O total de urnas apuradas voltou. Urna já lida não sai da conta, salvo correção do arquivo do TSE." },
  { tipo: "soma", titulo: "Soma não fecha", texto: "A soma dos votos dos candidatos não é igual aos votos válidos da mesma amostra. Os dois números deveriam ser o mesmo." },
  { tipo: "percentual", titulo: "Percentual fora da conta", texto: "O percentual gravado não sai de votos ÷ votos válidos. A diferença passou de 0,15 ponto." },
  { tipo: "brasil", titulo: "Brasil ≠ estados", texto: "O total do Brasil não bate com a soma dos estados na mesma amostra, além de uma folga de 0,05% ou 500 votos." },
  { tipo: "buraco", titulo: "Amostra faltando", texto: "Passou mais de 30 minutos entre duas amostras. O histórico ficou com um vão." },
  { tipo: "salto", titulo: "Salto sem urna nova", texto: "Os votos mudaram em mil ou mais, mas o número de urnas apuradas ficou igual. Sem urna nova, esse salto não se explica pela entrada de seção." },
];

const pt: MonitorCopy = {
  titulo: "Monitor",
  nota: "No dia 25/10, a cada 30 minutos, a contagem do 2º turno fica gravada. Esta página mostra a evolução e não apaga o que já entrou.",
  vazio: "Ainda não há amostra. O histórico começa no dia da eleição.",
  falha: "Não deu para ler o histórico agora.",
  evolucao: "Evolução do percentual",
  alertas: "O que não fechou",
  semAlerta: "Nenhuma discrepância nestas amostras.",
  legenda: "Por que um ponto é suspeito",
  historico: "Histórico",
  amostras: (n) => (n === 1 ? "1 amostra" : `${n} amostras`),
  voltar: "Voltar à apuração",
  presidente: "Presidente",
  governador: "Governador",
  hora: "Hora",
  candidato: "Candidato",
  votos: "Votos",
  urnas: "Urnas",
  regras: REGRAS_PT,
};

export const MONITOR: Record<Locale, MonitorCopy> = {
  "pt-BR": pt,
  "pt-PT": {
    ...pt,
    nota: "No dia 25/10, de 30 em 30 minutos, a contagem da segunda volta fica gravada. Esta página mostra a evolução e não apaga o que já entrou.",
    vazio: "Ainda não há amostra. O histórico começa no dia da eleição.",
    falha: "Não deu para ler o histórico agora.",
    evolucao: "Evolução da percentagem",
    alertas: "O que não fechou",
    semAlerta: "Nenhuma discrepância nestas amostras.",
    legenda: "Por que um ponto é suspeito",
    historico: "Histórico",
    voltar: "Voltar à apuração",
    presidente: "Presidente",
    governador: "Governador",
    hora: "Hora",
    candidato: "Candidato",
    votos: "Votos",
    urnas: "Urnas",
    regras: [
      { tipo: "votos-caiu", titulo: "Votos para trás", texto: "Os votos de um candidato diminuíram. Na contagem o número segue para a frente. Uma queda pode ser correção do ficheiro, mas não é o caminho normal." },
      { tipo: "urnas-caiu", titulo: "Urnas para trás", texto: "O total de urnas apuradas voltou atrás. Urna já lida não sai da conta, salvo correção do ficheiro do TSE." },
      { tipo: "soma", titulo: "Soma não fecha", texto: "A soma dos votos dos candidatos não é igual aos votos válidos da mesma amostra." },
      { tipo: "percentual", titulo: "Percentagem fora da conta", texto: "A percentagem gravada não sai de votos ÷ votos válidos. A diferença passou de 0,15 ponto." },
      { tipo: "brasil", titulo: "Brasil ≠ estados", texto: "O total do Brasil não bate com a soma dos estados na mesma amostra, além de uma folga de 0,05% ou 500 votos." },
      { tipo: "buraco", titulo: "Amostra em falta", texto: "Passaram mais de 30 minutos entre duas amostras. O histórico ficou com um vão." },
      { tipo: "salto", titulo: "Salto sem urna nova", texto: "Os votos mudaram em mil ou mais, mas o número de urnas apuradas ficou igual." },
    ],
  },
  es: {
    ...pt,
    nota: "El 25/10, cada 30 minutos, el escrutinio de la segunda vuelta queda guardado. Esta página muestra la evolución y no borra lo ya guardado.",
    vazio: "Todavía no hay muestra. El historial empieza el día de la elección.",
    falha: "No se pudo leer el historial ahora.",
    evolucao: "Evolución del porcentaje",
    alertas: "Lo que no cuadra",
    semAlerta: "Ninguna discrepancia en estas muestras.",
    legenda: "Por qué un punto es sospechoso",
    historico: "Historial",
    amostras: (n) => (n === 1 ? "1 muestra" : `${n} muestras`),
    voltar: "Volver al escrutinio",
    presidente: "Presidente",
    governador: "Gobernador",
    hora: "Hora",
    candidato: "Candidato",
    votos: "Votos",
    urnas: "Urnas",
    regras: [
      { tipo: "votos-caiu", titulo: "Votos hacia atrás", texto: "Los votos de un candidato bajaron. En el escrutinio el número avanza. Una baja puede ser una corrección, pero no es el camino normal." },
      { tipo: "urnas-caiu", titulo: "Urnas hacia atrás", texto: "El total de urnas escrutadas retrocedió. Una urna ya leída no sale de la cuenta, salvo corrección del archivo." },
      { tipo: "soma", titulo: "La suma no cierra", texto: "La suma de los votos de los candidatos no es igual a los votos válidos de la misma muestra." },
      { tipo: "percentual", titulo: "Porcentaje fuera de la cuenta", texto: "El porcentaje guardado no sale de votos ÷ votos válidos. La diferencia pasó de 0,15 punto." },
      { tipo: "brasil", titulo: "Brasil ≠ estados", texto: "El total de Brasil no coincide con la suma de los estados en la misma muestra, más allá de un margen de 0,05% o 500 votos." },
      { tipo: "buraco", titulo: "Muestra faltante", texto: "Pasaron más de 30 minutos entre dos muestras. El historial quedó con un hueco." },
      { tipo: "salto", titulo: "Salto sin urna nueva", texto: "Los votos cambiaron en mil o más, pero el número de urnas escrutadas quedó igual." },
    ],
  },
  en: {
    ...pt,
    nota: "On 25 Oct, every 30 minutes, the runoff count is stored. This page shows how it moved and does not erase what was saved.",
    vazio: "No sample yet. The history starts on election day.",
    falha: "The history could not be read just now.",
    evolucao: "How the share moved",
    alertas: "What does not add up",
    semAlerta: "No discrepancy in these samples.",
    legenda: "Why a point is suspect",
    historico: "History",
    amostras: (n) => (n === 1 ? "1 sample" : `${n} samples`),
    voltar: "Back to the count",
    presidente: "President",
    governador: "Governor",
    hora: "Time",
    candidato: "Candidate",
    votos: "Votes",
    urnas: "Polling stations",
    regras: [
      { tipo: "votos-caiu", titulo: "Votes went down", texto: "A candidate's votes fell. A count moves forward. A drop can be a file correction, but it is not the normal path." },
      { tipo: "urnas-caiu", titulo: "Stations went down", texto: "The number of counted polling stations went backwards. A station already read does not leave the count, except as a file correction." },
      { tipo: "soma", titulo: "The sum does not match", texto: "The candidates' votes do not add up to the valid votes in the same sample. Those two numbers should be the same." },
      { tipo: "percentual", titulo: "Share does not match the math", texto: "The stored share is not votes ÷ valid votes. The gap is more than 0.15 points." },
      { tipo: "brasil", titulo: "Brazil ≠ the states", texto: "The Brazil total does not match the sum of the states in the same sample, beyond a margin of 0.05% or 500 votes." },
      { tipo: "buraco", titulo: "Missing sample", texto: "More than 30 minutes passed between two samples. The history has a gap." },
      { tipo: "salto", titulo: "Jump with no new station", texto: "Votes moved by 1,000 or more, but the number of counted stations stayed the same. Without a new station, that jump is not explained by a new section." },
    ],
  },
};
