import type { Locale } from "./locale";

export type Copy = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  live: string;
  waiting: string;
  readAt: (hora: string) => string;
  countdownFuture: (dias: number, horas: number) => string;
  countdownPast: string;
  sufixoDias: (n: number) => string;
  eleicaoHoje: string;
  votacaoAberta: string;
  votacaoEncerrou: string;
  steps: [string, string][];
  tudo: string;
  presidente: string;
  governador: string;
  estado: string;
  municipio: string;
  brasilInteiro: string;
  exteriorSemMunicipio: string;
  todosMunicipios: string;
  escolhaEstado: string;
  capital: string;
  semArquivo: string;
  lendo: string;
  erroRede: string;
  erroMunicipio: string;
  erroSoma: string;
  erroLimite: string;
  rastreio: (id: string) => string;
  presidenteBrasil: string;
  arquivoNacional: (quando: string) => string;
  comoTotal: string;
  comoTotalTexto: string;
  soma: string;
  oficial: string;
  votosValidosFrase: string;
  contasFecham: string;
  diferenca: (votos: string, candidatos: number) => string;
  governadores: string;
  mostrarTodos: string;
  mostrarSoSegundo: string;
  definido1: string;
  segundoTurno: string;
  vaiSegundo: string;
  presidenteCadaEstado: string;
  presidenteCadaEstadoNota: string;
  somaLotes: (lugar: string) => string;
  presidenteEm: (lugar: string) => string;
  governadorEm: (lugar: string) => string;
  buscarSoma: string;
  placeholderCidade: string;
  validosCurtos: string;
  mostrando40: string;
  voltarSoma: (lugar: string) => string;
  municipioEntra: string;
  rodape: string;
  secoes: (pct: string, feitas: string, total: string) => string;
  votosValidos: string;
  notaValidos: string;
  brancos: string;
  nulos: string;
  abstencao: string;
  outrosCandidatos: (n: number) => string;
  semPartido: string;
  coligacao: string;
  vice: string;
  votosNominais: (n: string) => string;
  tsePublica: (pct: string) => string;
  marca50: string;
  soEntre: (pct: string) => string;
  situacao: string;
  apurado: string;
  lidosDe: (lidos: number, total: number) => string;
  comecandoLeitura: string;
  aindaNao: string;
  conferenciaEstado: string;
  conferenciaEstadoTexto: string;
  falhas: (n: number) => string;
  aviso: string;
  modoAoVivo: string;
  modoAguardando: string;
  modoDefinido: string;
  idioma: string;
  temaEscuro: string;
  temaClaro: string;
  doar: string;
  fechar: string;
  doarTitulo: string;
  doarTexto: string;
  doarValor: string;
  doarErro: string;
  fotoAlt: (nome: string) => string;
  carregando: string;
  mapaTitulo: string;
  graficoTitulo: string;
  municipiosTitulo: string;
  verMunicipios: string;
  naFrente: (nome: string, votos: string) => string;
  paraPassar: (nome: string, votos: string) => string;
  empatePlacar: string;
  maioriaSimples: (nome: string) => string;
  estadosNaFrente: (nome: string, n: number) => string;
  opiniaoFecha: (nome: string) => string;
  opiniaoAberta: (nome: string) => string;
  apresentador: string;
  apresentadorOuvir: string;
  voz: string;
  perguntasProntas: string;
  perguntaLivre: string;
  perguntaLivreNota: string;
  perguntar: string;
  perguntando: string;
  perguntaFalhou: string;
  perguntaLimite: string;
  perguntaQuemGanha: string;
  perguntaFrente: string;
  perguntaPassar: string;
  perguntaApurado: string;
  perguntaEstados: string;
  perguntaCidades: string;
  perguntaPresenca: string;
  perguntaBrancos: string;
  perguntaEleitos: string;
  perguntaQuando: string;
  respostaNestaTela: (lugar: string) => string;
  respostaPresenca: (compareceram: string, eleitorado: string, abstencao: string) => string;
  respostaEleitosNomes: (nomes: string) => string;
  semDisputa: string;
  municipioDele: (nome: string, n: number) => string;
  urnas: (pct: string) => string;
  cenarioSegue: string;
  cenarioEleito: (nome: string) => string;
  cenarioAberto: (nome: string, votos: string) => string;
  cenarioAbertoSemConta: (nome: string) => string;
  cenarioEmpate: string;
  ativarAudio: string;
  pararAudio: string;
  instalarTitulo: string;
  instalarTexto: string;
  instalarLocal: string;
  instalarVoz: string;
  instalarPopup: string;
  instalarVozApp: string;
  instalarPopupApp: string;
  instalarAgoraNao: string;
  instalarIos: string;
  acompanharDeNovo: string;
  boletimPresidente: (texto: string) => string;
  boletimGovernador: (estado: string, texto: string) => string;
  boletimCandidato: (nome: string, partido: string, pct: string) => string;
  vozConfirmada: string;
  vitoria: (nome: string) => string;
  ouvirApito: string;
  eleitos: string;
  monitor: string;
  eleitosTitulo: string;
  eleitosNota: string;
  eleitosVazio: string;
  eleitosConta: (n: number) => string;
  turno1: string;
  turno2: string;
  filtroTodosTurnos: string;
  dataTurnoQuando: string;
  dataTurnoHorario: string;
  avisoQuero: string;
  avisoLigado: string;
  avisoNegado: string;
  avisoSemSuporte: string;
  avisoTitulo: string;
  avisoCorpoConfirmado: string;
  avisoCorpoDia: string;
  pularParaConteudo: string;
  filtroVisao: string;
  filtroTurno: string;
  abrirLugar: (nome: string) => string;
  falaNumero: (atual: number, total: number) => string;
  faqTitulo: string;
  faqNota: string;
  faqAtualizando: string;
  faqFalhou: string;
  faqVazio: string;
  faqEscolha: string;
  faqFez: string;
  faqAcusacao: string;
  faqFake: string;
  faqDeixou: string;
  faqRespostaFez: (nomes: string) => string;
  faqRespostaAcusacao: (nomes: string) => string;
  faqRespostaFake: (nomes: string) => string;
  faqRespostaDeixou: (nomes: string) => string;
  faqLinha: (nome: string, partido: string, numeroUrna: string, situacao: string, votos: string, pct: string) => string;
  faqSemNome: string;
  visitantes: string;
  jaAcessaram: (n: string) => string;
  acessandoAgora: (n: string) => string;
  agoraCurto: (n: string) => string;
  verGraficos: string;
  foraDoBrasil: string;
  votoBotao: (nome: string) => string;
  votoFeito: (nome: string) => string;
  votoNota: string;
  analyticsTitulo: string;
  graficoVisitantes: string;
  graficoAgora: string;
  graficoVotos: string;
  votosNoBotao: (n: string) => string;
  compartilharEnquete: string;
  compartilharTexto: string;
  linkCopiado: string;
  enqueteToque: string;
  enqueteSeguir: string;
  atualizar: string;
  atualizando: string;
  atualizado: string;
  atualizarFalhou: string;
  voltarInicio: string;
  audienciaNota: string;
};

const ptBR: Copy = {
  metaTitle: "Apuração do 2º turno 2026 | Presidente e governadores",
  metaDescription: "Apuração das eleições 2026 no segundo turno: presidente, governadores, estados e municípios, com os arquivos públicos do TSE. Votação em 25 de outubro.",
  kicker: "Eleições 2026 · fonte TSE",
  title: "Apuração do 2º turno 2026",
  lead: "Presidente e governadores em 25 de outubro de 2026, com os números oficiais do TSE. Dá para filtrar por estado, município e quem já foi eleito.",
  live: "Apuração ao vivo",
  waiting: "Aguardando o 2º turno",
  readAt: (hora) => `lido às ${hora}`,
  countdownFuture: (dias, horas) => `Votação em 25/10, das 8h às 17h. A apuração começa em ${dias} dia(s) e ${horas} hora(s).`,
  countdownPast: "A votação do 2º turno já encerrou. A apuração entra aqui quando o TSE publica o arquivo.",
  sufixoDias: (n) => (n === 1 ? "dia para a eleição" : "dias para a eleição"),
  eleicaoHoje: "A eleição é hoje",
  votacaoAberta: "A votação está aberta",
  votacaoEncerrou: "A votação encerrou",
  steps: [
    ["1. Seção", "Cada urna gera um boletim. O TSE soma as seções do município."],
    ["2. Município", "O total da cidade é a soma dessas seções. É a menor peça desta página."],
    ["3. Estado", "Aqui a conta é refeita: todos os municípios do estado, um por um."],
    ["4. Brasil", "Presidente soma os estados e o exterior. Governador para no estado."],
  ],
  tudo: "Tudo",
  presidente: "Presidente",
  governador: "Governador",
  estado: "Estado",
  municipio: "Município",
  brasilInteiro: "Brasil inteiro",
  exteriorSemMunicipio: "O exterior entra somado, sem município",
  todosMunicipios: "Todos os municípios",
  escolhaEstado: "Escolha um estado",
  capital: "capital",
  semArquivo: "sem arquivo",
  lendo: "Lendo os arquivos públicos do TSE…",
  erroRede: "Não foi possível ler o TSE agora.",
  erroMunicipio: "Não foi possível ler este município.",
  erroSoma: "A soma dos municípios falhou.",
  erroLimite: "Muitos pedidos de uma vez. Espere um instante e tente de novo.",
  rastreio: (id) => `Rastreio: ${id}`,
  presidenteBrasil: "Presidente no Brasil",
  arquivoNacional: (quando) => `Arquivo nacional do TSE: ${quando} (Brasília)`,
  comoTotal: "Como este total foi feito",
  comoTotalTexto: "Somei os arquivos de cada estado e do exterior. Esse resultado tem de chegar no arquivo único do Brasil. A diferença, se existir, é porque o TSE grava esses arquivos em instantes diferentes.",
  soma: "Soma",
  oficial: "Arquivo oficial",
  votosValidosFrase: "votos válidos",
  contasFecham: "As duas contas fecham.",
  diferenca: (votos, candidatos) => `Diferença de ${votos} votos válidos${candidatos ? ` e ${candidatos} candidato(s) com voto diferente.` : "."}`,
  governadores: "Governadores",
  mostrarTodos: "Mostrar também quem já venceu no 1º turno",
  mostrarSoSegundo: "Mostrar só quem ainda disputa o 2º turno",
  definido1: "Definido no 1º turno",
  segundoTurno: "2º turno",
  vaiSegundo: "Vai ao 2º turno",
  presidenteCadaEstado: "Presidente em cada estado",
  presidenteCadaEstadoNota: "Cada cartão é o arquivo daquela unidade. Abra para refazer a conta pelos municípios.",
  somaLotes: (lugar) => `${lugar} · a soma abaixo é recalculada lendo cada município, em lotes, para não sobrecarregar o TSE.`,
  presidenteEm: (lugar) => `Presidente em ${lugar}`,
  governadorEm: (lugar) => `Governador em ${lugar}`,
  buscarSoma: "Buscar na soma",
  placeholderCidade: "Nome do município",
  validosCurtos: "válidos",
  mostrando40: "Mostrando 40. Use a busca para achar o restante.",
  voltarSoma: (lugar) => `Voltar para a soma de ${lugar}`,
  municipioEntra: "Este município entra inteiro na soma do estado.",
  rodape: "Dados de resultados.tse.jus.br. Este site não pertence ao TSE, não estima voto e não declara vencedor antes da totalização oficial.",
  secoes: (pct, feitas, total) => `${pct} das seções · ${feitas} de ${total}`,
  votosValidos: "Votos válidos",
  notaValidos: "Branco e nulo ficam de fora. É este o bolo do percentual.",
  brancos: "Brancos",
  nulos: "Nulos",
  abstencao: "Abstenção",
  outrosCandidatos: (n) => `Outros candidatos deste recorte (${n})`,
  semPartido: "Sem partido",
  coligacao: "Coligação",
  vice: "vice",
  votosNominais: (n) => `${n} votos válidos nominais`,
  tsePublica: (pct) => `TSE publica ${pct}`,
  marca50: "A marca no meio é 50% dos votos válidos.",
  soEntre: (pct) => `Só entre quem está nesta disputa: ${pct}. No 1º turno o percentual oficial inclui os outros candidatos.`,
  situacao: "Situação no TSE",
  apurado: "apurado",
  lidosDe: (lidos, total) => `${lidos} de ${total} municípios lidos`,
  comecandoLeitura: "Começando a leitura",
  aindaNao: "Ainda não há município suficiente para somar.",
  conferenciaEstado: "Conferência com o arquivo do estado",
  conferenciaEstadoTexto: "Quando todos os municípios entram, a soma tem de repetir o arquivo agregado que o TSE publica para o estado.",
  falhas: (n) => `Há ${n} município(s) sem arquivo neste momento. A soma fica incompleta até eles responderem.`,
  aviso: "Números oficiais, sem projeção. O total do Brasil nesta página é a soma das unidades da federação e do exterior. Cada unidade é a soma dos municípios — confira abrindo o estado.",
  modoAoVivo: "2º turno em apuração",
  modoAguardando: "Números do 1º turno, de quem segue",
  modoDefinido: "Decidido no 1º turno",
  idioma: "Idioma",
  temaEscuro: "Tema escuro",
  temaClaro: "Tema claro",
  doar: "Doar",
  fechar: "Fechar",
  doarTitulo: "Apoiar este site",
  doarTexto: "Aponte a câmera do aplicativo do banco para o código. O valor é você quem escolhe.",
  doarValor: "Não há valor fixo. Nada além do código é necessário.",
  doarErro: "Não foi possível gerar o código agora.",
  fotoAlt: (nome) => `Foto de ${nome} publicada pelo TSE`,
  carregando: "Carregando a apuração…",
  mapaTitulo: "Mapa",
  graficoTitulo: "Por estado",
  municipiosTitulo: "Municípios",
  verMunicipios: "Toque num estado para ver os municípios.",
  naFrente: (nome, votos) => `${nome} está na frente por ${votos} votos.`,
  paraPassar: (nome, votos) => `Para ${nome} passar, faltam ${votos} votos.`,
  empatePlacar: "Empate neste momento. Um voto muda quem fica na frente.",
  maioriaSimples: (nome) => `${nome} já tem mais da metade dos votos válidos.`,
  estadosNaFrente: (nome, n) => `${nome} está na frente em ${n} estados.`,
  opiniaoFecha: (nome) => `Se fechar assim, eu fico com ${nome}.`,
  opiniaoAberta: (nome) => `O placar ainda pode virar. Neste instante, eu fico com ${nome}.`,
  apresentador: "Apresentadora",
  apresentadorOuvir: "Ouvir o placar",
  voz: "Voz",
  perguntasProntas: "Perguntas",
  perguntaLivre: "Pergunte o que quiser",
  perguntaLivreNota: "Pergunta livre. Ela pode consultar a web e cita o veículo. A apuração desta tela continua sendo a do TSE.",
  perguntar: "Perguntar",
  perguntando: "Pesquisando…",
  perguntaFalhou: "Não deu para responder agora.",
  perguntaLimite: "Muitas perguntas agora. Espere um pouco.",
  perguntaQuemGanha: "Quem vai ganhar?",
  perguntaFrente: "Quem está na frente?",
  perguntaPassar: "O outro ainda passa?",
  perguntaApurado: "Quanto já foi apurado?",
  perguntaEstados: "Quem leva mais estados?",
  perguntaCidades: "E nos municípios?",
  perguntaPresenca: "Quantos foram votar?",
  perguntaBrancos: "E os brancos e nulos?",
  perguntaEleitos: "Quem já está eleito?",
  perguntaQuando: "Quando é a votação?",
  respostaNestaTela: (lugar) => `Nesta tela, ${lugar}.`,
  respostaPresenca: (compareceram, eleitorado, abstencao) => `Foram votar ${compareceram} de ${eleitorado}. Abstenção: ${abstencao}.`,
  respostaEleitosNomes: (nomes) => `Nesta leitura já aparecem eleitos: ${nomes}.`,
  semDisputa: "Ainda não dá para separar os dois nomes desta disputa.",
  municipioDele: (nome, n) => `${nome} na frente em ${n} municípios já lidos.`,
  urnas: (pct) => `${pct} das urnas apuradas`,
  cenarioSegue: "Neste 1º turno ninguém está eleito. Os dois seguem.",
  cenarioEleito: (nome) => `${nome} está eleito neste cenário: o outro não alcança nem com os votos que ainda faltam.`,
  cenarioAberto: (nome, votos) => `${nome} lidera, mas ainda não está eleito. Ainda cabem ${votos} votos.`,
  cenarioAbertoSemConta: (nome) => `${nome} lidera, mas a apuração não fechou. Ainda não está eleito.`,
  cenarioEmpate: "Empate. Ninguém está eleito.",
  ativarAudio: "Ouvir",
  pararAudio: "Sem áudio",
  instalarTitulo: "Acompanhar a votação",
  instalarTexto: "Deseja instalar o app e acompanhar a votação em tempo real?",
  instalarLocal: "Se você permitir a localização, o aviso inclui o governador do seu estado, quando a disputa estiver no segundo turno.",
  instalarVoz: "Instalar e ouvir",
  instalarPopup: "Instalar e receber avisos",
  instalarVozApp: "Ouvir a apuração",
  instalarPopupApp: "Receber avisos",
  instalarAgoraNao: "Agora não",
  instalarIos: "No iPhone, toque em Compartilhar e depois em Adicionar à Tela de Início.",
  acompanharDeNovo: "Acompanhar ao vivo",
  boletimPresidente: (texto) => `Presidência. ${texto}`,
  boletimGovernador: (estado, texto) => `Governador em ${estado}. ${texto}`,
  boletimCandidato: (nome, partido, pct) => `${nome}, ${partido}, ${pct}`,
  vozConfirmada: "Vou avisar a porcentagem por voz.",
  vitoria: (nome) => `${nome} está eleito`,
  ouvirApito: "Ouvir o apito",
  eleitos: "Eleitos",
  monitor: "Monitor da apuração",
  eleitosTitulo: "Quem já está eleito",
  eleitosNota: "Lista geral de presidente e governadores já eleitos, no 1º e no 2º turno.",
  eleitosVazio: "Ainda não há eleito neste turno.",
  eleitosConta: (n) => (n === 1 ? "1 eleito" : `${n} eleitos`),
  turno1: "1º turno",
  turno2: "2º turno",
  filtroTodosTurnos: "Os dois turnos",
  dataTurnoQuando: "25 de outubro de 2026",
  dataTurnoHorario: "Votação das 8h às 17h, horário de Brasília.",
  avisoQuero: "Quero ser avisado neste navegador",
  avisoLigado: "Aviso ligado. A notificação chega neste navegador às 8h do dia 25/10 se o site estiver aberto, ou quando você abrir o site nesse dia.",
  avisoNegado: "O navegador bloqueou o aviso. Libere as notificações deste site nas configurações do navegador.",
  avisoSemSuporte: "Este navegador não mostra notificações.",
  avisoTitulo: "2º turno de 2026",
  avisoCorpoConfirmado: "Aviso ligado. A votação do 2º turno é em 25 de outubro, das 8h às 17h.",
  avisoCorpoDia: "Hoje é o 2º turno. A votação vai das 8h às 17h, horário de Brasília.",
  pularParaConteudo: "Ir para o conteúdo",
  filtroVisao: "O que mostrar",
  filtroTurno: "Qual turno",
  abrirLugar: (nome) => `Abrir ${nome}`,
  falaNumero: (atual, total) => `Frase ${atual} de ${total}`,
  faqTitulo: "Perguntas frequentes",
  faqNota: "Reportagens da web sobre quem está nesta tela. Cada frase é o que o veículo publicou. Este site não julga o candidato.",
  faqAtualizando: "Buscando reportagens…",
  faqFalhou: "Não deu para buscar reportagens agora.",
  faqVazio: "Ainda não há reportagem desta pergunta para esta disputa.",
  faqEscolha: "Escolha uma pergunta para ler a resposta.",
  faqFez: "O que o candidato já fez",
  faqAcusacao: "Do que está sendo acusado",
  faqFake: "Fake news",
  faqDeixou: "O que fez e o que deixou de fazer",
  faqRespostaFez: (nomes) => `Sobre ${nomes}, esta página mostra o que o TSE já totalizou: votos, partido, número e situação na eleição. A vida pública fora da urna não está nesse arquivo.`,
  faqRespostaAcusacao: (nomes) => `Acusação contra ${nomes} não faz parte desta apuração. O site não lista processo, crime nem culpa, e não trata acusação como fato.`,
  faqRespostaFake: (nomes) => `Notícia que circula sobre ${nomes} não é classificada aqui como verdadeira ou falsa. O que esta tela confirma é o número público do TSE. O resto não entra como fato.`,
  faqRespostaDeixou: (nomes) => `De ${nomes}, o que dá para ver aqui é o resultado eleitoral abaixo. Promessa cumprida ou o que deixou de fazer não vem no arquivo do TSE, então esta página não inventa essa lista.`,
  faqLinha: (nome, partido, numeroUrna, situacao, votos, pct) => `${nome} · ${partido} · ${numeroUrna}. Situação no TSE: ${situacao}. ${votos} votos (${pct} dos válidos).`,
  faqSemNome: "os candidatos desta disputa",
  visitantes: "Visitantes",
  jaAcessaram: (n) => `${n} já acessaram`,
  acessandoAgora: (n) => `${n} acessando agora`,
  agoraCurto: (n) => `${n} agora`,
  verGraficos: "Ver gráficos",
  foraDoBrasil: "Fora do Brasil",
  votoBotao: (nome) => `Se você for ${nome}, vote agora`,
  votoFeito: (nome) => `Seu voto em ${nome} foi contado`,
  votoNota: "Este clique não é voto de urna e não entra na apuração do TSE. A mesma conexão só escolhe uma vez.",
  analyticsTitulo: "Quem acessa e votos do botão",
  graficoVisitantes: "Visitantes por estado",
  graficoAgora: "Acessando agora por estado",
  graficoVotos: "Pesquisa de quem votou no botão",
  votosNoBotao: (n) => `${n} votos neste botão`,
  compartilharEnquete: "Compartilhar enquete",
  compartilharTexto: "Toque na foto e escolha um. Este clique não é voto de urna.",
  linkCopiado: "Link copiado",
  enqueteToque: "Toque na foto para votar",
  enqueteSeguir: "Ver a apuração",
  atualizar: "Atualizar",
  atualizando: "Atualizando…",
  atualizado: "Atualizado",
  atualizarFalhou: "Não deu para atualizar agora.",
  voltarInicio: "Voltar à apuração",
  audienciaNota: "Contagem deste site, por estado. Sem nome e sem endereço na tela.",
};

const ptPT: Copy = {
  ...ptBR,
  metaTitle: "Apuramento da segunda volta 2026 | Presidente e governadores",
  metaDescription: "Apuramento das eleições de 2026 na segunda volta: presidente, governadores, estados e municípios, com os ficheiros públicos do TSE. Votação a 25 de outubro.",
  kicker: "Eleições 2026 · fonte TSE",
  title: "Apuramento da segunda volta 2026",
  lead: "Presidente e governadores a 25 de outubro de 2026, com os números oficiais do TSE. Dá para filtrar por estado, município e quem já foi eleito.",
  live: "Apuramento em direto",
  waiting: "A aguardar a segunda volta",
  readAt: (hora) => `lido às ${hora}`,
  countdownFuture: (dias, horas) => `Votação a 25/10, das 8h às 17h. O apuramento começa dentro de ${dias} dia(s) e ${horas} hora(s).`,
  countdownPast: "A votação da segunda volta já terminou. O apuramento aparece aqui quando o TSE publicar o ficheiro.",
  sufixoDias: (n) => (n === 1 ? "dia para a eleição" : "dias para a eleição"),
  eleicaoHoje: "A eleição é hoje",
  votacaoAberta: "A votação está aberta",
  votacaoEncerrou: "A votação encerrou",
  steps: [
    ["1. Secção", "Cada assembleia gera um boletim. O TSE soma as secções do município."],
    ["2. Município", "O total da localidade é a soma dessas secções. É a peça mais pequena desta página."],
    ["3. Estado", "Aqui a conta é refeita: todos os municípios do estado, um a um."],
    ["4. Brasil", "O presidente soma os estados e o estrangeiro. O governador fica no estado."],
  ],
  municipio: "Município",
  exteriorSemMunicipio: "O estrangeiro entra somado, sem município",
  todosMunicipios: "Todos os municípios",
  escolhaEstado: "Escolha um estado",
  semArquivo: "sem ficheiro",
  lendo: "A ler os ficheiros públicos do TSE…",
  erroRede: "Não foi possível ler o TSE agora.",
  erroMunicipio: "Não foi possível ler este município.",
  erroSoma: "A soma dos municípios falhou.",
  erroLimite: "Demasiados pedidos de uma vez. Espere um momento e tente outra vez.",
  rastreio: (id) => `Rastreio: ${id}`,
  arquivoNacional: (quando) => `Ficheiro nacional do TSE: ${quando} (Brasília)`,
  comoTotal: "Como este total foi feito",
  comoTotalTexto: "Somei os ficheiros de cada estado e do estrangeiro. Esse resultado tem de coincidir com o ficheiro único do Brasil. Uma diferença, se existir, aparece porque o TSE grava esses ficheiros em instantes diferentes.",
  soma: "Soma",
  oficial: "Ficheiro oficial",
  contasFecham: "As duas contas coincidem.",
  diferenca: (votos, candidatos) => `Diferença de ${votos} votos válidos${candidatos ? ` e ${candidatos} candidato(s) com voto diferente.` : "."}`,
  mostrarTodos: "Mostrar também quem já venceu na primeira volta",
  mostrarSoSegundo: "Mostrar só quem ainda disputa a segunda volta",
  definido1: "Definido na primeira volta",
  segundoTurno: "Segunda volta",
  vaiSegundo: "Vai à segunda volta",
  presidenteCadaEstadoNota: "Cada cartão é o ficheiro daquela unidade. Abra para refazer a conta pelos municípios.",
  somaLotes: (lugar) => `${lugar} · a soma abaixo é recalculada a ler cada município, em lotes, para não sobrecarregar o TSE.`,
  placeholderCidade: "Nome do município",
  mostrando40: "A mostrar 40. Use a pesquisa para encontrar o restante.",
  voltarSoma: (lugar) => `Voltar à soma de ${lugar}`,
  municipioEntra: "Este município entra por inteiro na soma do estado.",
  rodape: "Dados de resultados.tse.jus.br. Este sítio não pertence ao TSE, não estima o voto e não declara vencedor antes da totalização oficial.",
  secoes: (pct, feitas, total) => `${pct} das secções · ${feitas} de ${total}`,
  notaValidos: "O branco e o nulo ficam de fora. É este o bolo da percentagem.",
  abstencao: "Abstenção",
  semPartido: "Sem partido",
  votosNominais: (n) => `${n} votos válidos nominais`,
  tsePublica: (pct) => `O TSE publica ${pct}`,
  marca50: "A marca ao meio é 50% dos votos válidos.",
  soEntre: (pct) => `Só entre quem está nesta disputa: ${pct}. Na primeira volta a percentagem oficial inclui os outros candidatos.`,
  situacao: "Situação no TSE",
  apurado: "apurado",
  lidosDe: (lidos, total) => `${lidos} de ${total} municípios lidos`,
  comecandoLeitura: "A começar a leitura",
  aindaNao: "Ainda não há municípios suficientes para somar.",
  conferenciaEstado: "Conferência com o ficheiro do estado",
  conferenciaEstadoTexto: "Quando todos os municípios entram, a soma tem de repetir o ficheiro agregado que o TSE publica para o estado.",
  falhas: (n) => `Há ${n} município(s) sem ficheiro neste momento. A soma fica incompleta até responderem.`,
  aviso: "Números oficiais, sem projeção. O total do Brasil nesta página é a soma dos estados e do estrangeiro. Cada estado é a soma dos municípios — confirme ao abrir o estado.",
  modoAoVivo: "Segunda volta em apuramento",
  modoAguardando: "Números da primeira volta, de quem segue",
  modoDefinido: "Decidido na primeira volta",
  idioma: "Idioma",
  temaEscuro: "Tema escuro",
  temaClaro: "Tema claro",
  doar: "Doar",
  fechar: "Fechar",
  doarTitulo: "Apoiar este sítio",
  doarTexto: "Aponte a câmara da aplicação do banco para o código. O valor é escolhido por si.",
  doarValor: "Não há valor fixo. Não é preciso mais nada além do código.",
  doarErro: "Não foi possível gerar o código agora.",
  fotoAlt: (nome) => `Fotografia de ${nome} publicada pelo TSE`,
  carregando: "A carregar o apuramento…",
  mapaTitulo: "Mapa",
  graficoTitulo: "Por estado",
  municipiosTitulo: "Municípios",
  verMunicipios: "Toque num estado para ver os municípios.",
  naFrente: (nome, votos) => `${nome} está à frente por ${votos} votos.`,
  paraPassar: (nome, votos) => `Para ${nome} passar, faltam ${votos} votos.`,
  empatePlacar: "Empate neste momento. Um voto muda quem fica à frente.",
  maioriaSimples: (nome) => `${nome} já tem mais de metade dos votos válidos.`,
  estadosNaFrente: (nome, n) => `${nome} está à frente em ${n} estados.`,
  opiniaoFecha: (nome) => `Se fechar assim, fico com ${nome}.`,
  opiniaoAberta: (nome) => `O placar ainda pode virar. Neste instante, fico com ${nome}.`,
  apresentador: "Apresentadora",
  apresentadorOuvir: "Ouvir o placar",
  voz: "Voz",
  perguntasProntas: "Perguntas",
  perguntaLivre: "Pergunte o que quiser",
  perguntaLivreNota: "Pergunta livre. Ela pode consultar a web e cita o veículo. O apuramento deste ecrã continua a ser o do TSE.",
  perguntar: "Perguntar",
  perguntando: "A pesquisar…",
  perguntaFalhou: "Não deu para responder agora.",
  perguntaLimite: "Muitas perguntas agora. Espere um pouco.",
  perguntaQuemGanha: "Quem vai ganhar?",
  perguntaFrente: "Quem está à frente?",
  perguntaPassar: "O outro ainda passa?",
  perguntaApurado: "Quanto já foi apurado?",
  perguntaEstados: "Quem leva mais estados?",
  perguntaCidades: "E nos municípios?",
  perguntaPresenca: "Quantos foram votar?",
  perguntaBrancos: "E os brancos e nulos?",
  perguntaEleitos: "Quem já está eleito?",
  perguntaQuando: "Quando é a votação?",
  respostaNestaTela: (lugar) => `Neste ecrã, ${lugar}.`,
  respostaPresenca: (compareceram, eleitorado, abstencao) => `Foram votar ${compareceram} de ${eleitorado}. Abstenção: ${abstencao}.`,
  respostaEleitosNomes: (nomes) => `Nesta leitura já aparecem eleitos: ${nomes}.`,
  semDisputa: "Ainda não dá para separar os dois nomes desta disputa.",
  municipioDele: (nome, n) => `${nome} à frente em ${n} municípios já lidos.`,
  urnas: (pct) => `${pct} das urnas apuradas`,
  cenarioSegue: "Nesta primeira volta ninguém está eleito. Os dois seguem.",
  cenarioEleito: (nome) => `${nome} está eleito neste cenário: o outro não alcança nem com os votos que ainda faltam.`,
  cenarioAberto: (nome, votos) => `${nome} lidera, mas ainda não está eleito. Ainda cabem ${votos} votos.`,
  cenarioAbertoSemConta: (nome) => `${nome} lidera, mas a apuração não fechou. Ainda não está eleito.`,
  cenarioEmpate: "Empate. Ninguém está eleito.",
  ativarAudio: "Ouvir",
  pararAudio: "Sem áudio",
  instalarTitulo: "Acompanhar a votação",
  instalarTexto: "Quer instalar a aplicação e acompanhar a votação em tempo real?",
  instalarLocal: "Se permitir a localização, o aviso inclui o governador do seu estado, quando a disputa estiver na segunda volta.",
  instalarVoz: "Instalar e ouvir",
  instalarPopup: "Instalar e receber avisos",
  instalarVozApp: "Ouvir o apuramento",
  instalarPopupApp: "Receber avisos",
  instalarAgoraNao: "Agora não",
  instalarIos: "No iPhone, toque em Partilhar e depois em Adicionar ao Ecrã Principal.",
  acompanharDeNovo: "Acompanhar em direto",
  boletimPresidente: (texto) => `Presidência. ${texto}`,
  boletimGovernador: (estado, texto) => `Governador em ${estado}. ${texto}`,
  boletimCandidato: (nome, partido, pct) => `${nome}, ${partido}, ${pct}`,
  vozConfirmada: "Vou avisar a percentagem por voz.",
  vitoria: (nome) => `${nome} está eleito`,
  ouvirApito: "Ouvir o apito",
  buscarSoma: "Pesquisar na soma",
  eleitos: "Eleitos",
  monitor: "Monitor da apuração",
  eleitosTitulo: "Quem já está eleito",
  eleitosNota: "Lista geral de presidente e governadores já eleitos, na primeira e na segunda volta.",
  eleitosVazio: "Ainda não há eleito nesta volta.",
  eleitosConta: (n) => (n === 1 ? "1 eleito" : `${n} eleitos`),
  turno1: "Primeira volta",
  turno2: "Segunda volta",
  filtroTodosTurnos: "As duas voltas",
  dataTurnoQuando: "25 de outubro de 2026",
  dataTurnoHorario: "Votação das 8h às 17h, hora de Brasília.",
  avisoQuero: "Quero ser avisado neste navegador",
  avisoLigado: "Aviso ligado. A notificação chega neste navegador às 8h do dia 25/10 se o site estiver aberto, ou quando abrir o site nesse dia.",
  avisoNegado: "O navegador bloqueou o aviso. Autorize as notificações deste site nas definições do navegador.",
  avisoSemSuporte: "Este navegador não mostra notificações.",
  avisoTitulo: "Segunda volta de 2026",
  avisoCorpoConfirmado: "Aviso ligado. A votação da segunda volta é a 25 de outubro, das 8h às 17h.",
  avisoCorpoDia: "Hoje é a segunda volta. A votação vai das 8h às 17h, hora de Brasília.",
  pularParaConteudo: "Ir para o conteúdo",
  filtroVisao: "O que mostrar",
  filtroTurno: "Qual volta",
  abrirLugar: (nome) => `Abrir ${nome}`,
  falaNumero: (atual, total) => `Frase ${atual} de ${total}`,
  faqTitulo: "Perguntas frequentes",
  faqNota: "Reportagens da web sobre quem está neste ecrã. Cada frase é o que o veículo publicou. Este sítio não julga o candidato.",
  faqAtualizando: "A procurar reportagens…",
  faqFalhou: "Não deu para procurar reportagens agora.",
  faqVazio: "Ainda não há reportagem desta pergunta para esta disputa.",
  faqEscolha: "Escolha uma pergunta para ler a resposta.",
  faqFez: "O que o candidato já fez",
  faqAcusacao: "Do que está a ser acusado",
  faqFake: "Notícias falsas",
  faqDeixou: "O que fez e o que deixou de fazer",
  faqRespostaFez: (nomes) => `Sobre ${nomes}, esta página mostra o que o TSE já totalizou: votos, partido, número e situação na eleição. A vida pública fora da urna não está nesse ficheiro.`,
  faqRespostaAcusacao: (nomes) => `Uma acusação contra ${nomes} não faz parte deste apuramento. O sítio não lista processo, crime nem culpa, e não trata acusação como facto.`,
  faqRespostaFake: (nomes) => `Uma notícia que circula sobre ${nomes} não é classificada aqui como verdadeira ou falsa. O que este ecrã confirma é o número público do TSE. O resto não entra como facto.`,
  faqRespostaDeixou: (nomes) => `De ${nomes}, o que dá para ver aqui é o resultado eleitoral em baixo. Promessa cumprida ou o que deixou de fazer não vem no ficheiro do TSE, por isso esta página não inventa essa lista.`,
  faqLinha: (nome, partido, numeroUrna, situacao, votos, pct) => `${nome} · ${partido} · ${numeroUrna}. Situação no TSE: ${situacao}. ${votos} votos (${pct} dos válidos).`,
  faqSemNome: "os candidatos desta disputa",
  visitantes: "Visitantes",
  jaAcessaram: (n) => `${n} já acederam`,
  acessandoAgora: (n) => `${n} a aceder agora`,
  agoraCurto: (n) => `${n} agora`,
  verGraficos: "Ver gráficos",
  foraDoBrasil: "Fora do Brasil",
  votoBotao: (nome) => `Se for ${nome}, vote agora`,
  votoFeito: (nome) => `O seu voto em ${nome} foi contado`,
  votoNota: "Este clique não é voto de urna e não entra no apuramento do TSE. A mesma ligação só escolhe uma vez.",
  analyticsTitulo: "Quem acede e votos do botão",
  graficoVisitantes: "Visitantes por estado",
  graficoAgora: "A aceder agora por estado",
  graficoVotos: "Sondagem de quem votou no botão",
  votosNoBotao: (n) => `${n} votos neste botão`,
  compartilharEnquete: "Partilhar sondagem",
  compartilharTexto: "Toque na foto e escolha um. Este clique não é voto de urna.",
  linkCopiado: "Ligação copiada",
  enqueteToque: "Toque na foto para votar",
  enqueteSeguir: "Ver o apuramento",
  atualizar: "Atualizar",
  atualizando: "A atualizar…",
  atualizado: "Atualizado",
  atualizarFalhou: "Não deu para atualizar agora.",
  voltarInicio: "Voltar ao apuramento",
  audienciaNota: "Contagem deste sítio, por estado. Sem nome e sem endereço no ecrã.",
};

const es: Copy = {
  metaTitle: "Escrutinio de la segunda vuelta 2026 | Presidente y gobernadores",
  metaDescription: "Escrutinio de las elecciones de 2026 en la segunda vuelta: presidente, gobernadores, estados y municipios, con los archivos públicos del TSE. Votación el 25 de octubre.",
  kicker: "Elecciones 2026 · fuente TSE",
  title: "Escrutinio de la segunda vuelta 2026",
  lead: "Presidente y gobernadores el 25 de octubre de 2026, con las cifras oficiales del TSE. Se puede filtrar por estado, municipio y quién ya fue elegido.",
  live: "Escrutinio en directo",
  waiting: "A la espera de la segunda vuelta",
  readAt: (hora) => `leído a las ${hora}`,
  countdownFuture: (dias, horas) => `Votación el 25/10, de 8h a 17h. El escrutinio empieza en ${dias} día(s) y ${horas} hora(s).`,
  countdownPast: "La votación de la segunda vuelta ya terminó. El escrutinio aparece aquí cuando el TSE publica el archivo.",
  sufixoDias: (n) => (n === 1 ? "día para la elección" : "días para la elección"),
  eleicaoHoje: "La elección es hoy",
  votacaoAberta: "La votación está abierta",
  votacaoEncerrou: "La votación terminó",
  steps: [
    ["1. Mesa", "Cada urna genera un acta. El TSE suma las mesas del municipio."],
    ["2. Municipio", "El total de la ciudad es la suma de esas mesas. Es la pieza más pequeña de esta página."],
    ["3. Estado", "Aquí la cuenta se rehace: todos los municipios del estado, uno por uno."],
    ["4. Brasil", "El presidente suma los estados y el voto en el extranjero. El gobernador se queda en el estado."],
  ],
  tudo: "Todo",
  presidente: "Presidente",
  governador: "Gobernador",
  estado: "Estado",
  municipio: "Municipio",
  brasilInteiro: "Todo Brasil",
  exteriorSemMunicipio: "El extranjero entra sumado, sin municipio",
  todosMunicipios: "Todos los municipios",
  escolhaEstado: "Elige un estado",
  capital: "capital",
  semArquivo: "sin archivo",
  lendo: "Leyendo los archivos públicos del TSE…",
  erroRede: "No se ha podido leer el TSE ahora.",
  erroMunicipio: "No se ha podido leer este municipio.",
  erroSoma: "Ha fallado la suma de los municipios.",
  erroLimite: "Demasiadas peticiones a la vez. Espere un momento y vuelva a intentarlo.",
  rastreio: (id) => `Rastreo: ${id}`,
  presidenteBrasil: "Presidente en Brasil",
  arquivoNacional: (quando) => `Archivo nacional del TSE: ${quando} (Brasilia)`,
  comoTotal: "Cómo se ha hecho este total",
  comoTotalTexto: "Sumé el archivo de cada estado y del extranjero. Ese resultado tiene que coincidir con el archivo único de Brasil. Si hay diferencia, es porque el TSE guarda esos archivos en momentos distintos.",
  soma: "Suma",
  oficial: "Archivo oficial",
  votosValidosFrase: "votos válidos",
  contasFecham: "Las dos cuentas coinciden.",
  diferenca: (votos, candidatos) => `Diferencia de ${votos} votos válidos${candidatos ? ` y ${candidatos} candidato(s) con un voto distinto.` : "."}`,
  governadores: "Gobernadores",
  mostrarTodos: "Mostrar también a quien ya ganó en la primera vuelta",
  mostrarSoSegundo: "Mostrar solo a quien aún disputa la segunda vuelta",
  definido1: "Decidido en la primera vuelta",
  segundoTurno: "Segunda vuelta",
  vaiSegundo: "Pasa a la segunda vuelta",
  presidenteCadaEstado: "Presidente en cada estado",
  presidenteCadaEstadoNota: "Cada tarjeta es el archivo de esa unidad. Ábrela para rehacer la cuenta con los municipios.",
  somaLotes: (lugar) => `${lugar} · la suma de abajo se recalcula leyendo cada municipio, en lotes, para no saturar al TSE.`,
  presidenteEm: (lugar) => `Presidente en ${lugar}`,
  governadorEm: (lugar) => `Gobernador en ${lugar}`,
  buscarSoma: "Buscar en la suma",
  placeholderCidade: "Nombre del municipio",
  validosCurtos: "válidos",
  mostrando40: "Se muestran 40. Usa el buscador para el resto.",
  voltarSoma: (lugar) => `Volver a la suma de ${lugar}`,
  municipioEntra: "Este municipio entra entero en la suma del estado.",
  rodape: "Datos de resultados.tse.jus.br. Este sitio no pertenece al TSE, no estima el voto y no declara ganador antes del escrutinio oficial.",
  secoes: (pct, feitas, total) => `${pct} de las mesas · ${feitas} de ${total}`,
  votosValidos: "Votos válidos",
  notaValidos: "El blanco y el nulo quedan fuera. Este es el total del porcentaje.",
  brancos: "En blanco",
  nulos: "Nulos",
  abstencao: "Abstención",
  outrosCandidatos: (n) => `Otros candidatos de este recorte (${n})`,
  semPartido: "Sin partido",
  coligacao: "Coalición",
  vice: "vice",
  votosNominais: (n) => `${n} votos válidos nominales`,
  tsePublica: (pct) => `El TSE publica ${pct}`,
  marca50: "La marca del medio es el 50% de los votos válidos.",
  soEntre: (pct) => `Solo entre quienes están en esta disputa: ${pct}. En la primera vuelta el porcentaje oficial incluye al resto de candidatos.`,
  situacao: "Situación en el TSE",
  apurado: "escrutado",
  lidosDe: (lidos, total) => `${lidos} de ${total} municipios leídos`,
  comecandoLeitura: "Empezando la lectura",
  aindaNao: "Todavía no hay municipios suficientes para sumar.",
  conferenciaEstado: "Comprobación con el archivo del estado",
  conferenciaEstadoTexto: "Cuando entran todos los municipios, la suma tiene que repetir el archivo agregado que el TSE publica para el estado.",
  falhas: (n) => `Hay ${n} municipio(s) sin archivo en este momento. La suma queda incompleta hasta que respondan.`,
  aviso: "Cifras oficiales, sin proyección. El total de Brasil en esta página es la suma de los estados y del extranjero. Cada estado es la suma de sus municipios: ábrelo para comprobarlo.",
  modoAoVivo: "Segunda vuelta en escrutinio",
  modoAguardando: "Cifras de la primera vuelta, de quien sigue",
  modoDefinido: "Decidido en la primera vuelta",
  idioma: "Idioma",
  temaEscuro: "Tema oscuro",
  temaClaro: "Tema claro",
  doar: "Donar",
  fechar: "Cerrar",
  doarTitulo: "Apoyar este sitio",
  doarTexto: "Apunta la cámara de la aplicación del banco al código. El importe lo eliges tú.",
  doarValor: "No hay un importe fijo. No hace falta nada más que el código.",
  doarErro: "No se ha podido generar el código ahora.",
  fotoAlt: (nome) => `Foto de ${nome} publicada por el TSE`,
  carregando: "Cargando el escrutinio…",
  mapaTitulo: "Mapa",
  graficoTitulo: "Por estado",
  municipiosTitulo: "Municipios",
  verMunicipios: "Toque un estado para ver los municipios.",
  naFrente: (nome, votos) => `${nome} va delante por ${votos} votos.`,
  paraPassar: (nome, votos) => `Para que ${nome} adelante, faltan ${votos} votos.`,
  empatePlacar: "Empate ahora mismo. Un voto cambia quién va delante.",
  maioriaSimples: (nome) => `${nome} ya tiene más de la mitad de los votos válidos.`,
  estadosNaFrente: (nome, n) => `${nome} va delante en ${n} estados.`,
  opiniaoFecha: (nome) => `Si cierra así, me quedo con ${nome}.`,
  opiniaoAberta: (nome) => `El marcador todavía puede darse la vuelta. Ahora mismo, me quedo con ${nome}.`,
  apresentador: "Presentadora",
  apresentadorOuvir: "Escuchar el marcador",
  voz: "Voz",
  perguntasProntas: "Preguntas",
  perguntaLivre: "Pregunta lo que quieras",
  perguntaLivreNota: "Pregunta libre. Puede consultar la web y cita el medio. El escrutinio de esta pantalla sigue siendo el del TSE.",
  perguntar: "Preguntar",
  perguntando: "Buscando…",
  perguntaFalhou: "No se pudo responder ahora.",
  perguntaLimite: "Demasiadas preguntas ahora. Espera un momento.",
  perguntaQuemGanha: "¿Quién va a ganar?",
  perguntaFrente: "¿Quién va delante?",
  perguntaPassar: "¿El otro todavía alcanza?",
  perguntaApurado: "¿Cuánto ya se contó?",
  perguntaEstados: "¿Quién gana más estados?",
  perguntaCidades: "¿Y en los municipios?",
  perguntaPresenca: "¿Cuántos fueron a votar?",
  perguntaBrancos: "¿Y los votos en blanco y nulos?",
  perguntaEleitos: "¿Quién ya está elegido?",
  perguntaQuando: "¿Cuándo es la votación?",
  respostaNestaTela: (lugar) => `En esta pantalla, ${lugar}.`,
  respostaPresenca: (compareceram, eleitorado, abstencao) => `Fueron a votar ${compareceram} de ${eleitorado}. Abstención: ${abstencao}.`,
  respostaEleitosNomes: (nomes) => `En esta lectura ya figuran elegidos: ${nomes}.`,
  semDisputa: "Todavía no se pueden separar los dos nombres de esta disputa.",
  municipioDele: (nome, n) => `${nome} va delante en ${n} municipios ya leídos.`,
  urnas: (pct) => `${pct} de las urnas escrutadas`,
  cenarioSegue: "En esta primera vuelta nadie está elegido. Los dos siguen.",
  cenarioEleito: (nome) => `${nome} está elegido en este escenario: el otro no alcanza ni con los votos que faltan.`,
  cenarioAberto: (nome, votos) => `${nome} va delante, pero todavía no está elegido. Aún caben ${votos} votos.`,
  cenarioAbertoSemConta: (nome) => `${nome} va delante, pero el escrutinio no cerró. Todavía no está elegido.`,
  cenarioEmpate: "Empate. Nadie está elegido.",
  ativarAudio: "Escuchar",
  pararAudio: "Sin audio",
  instalarTitulo: "Seguir el escrutinio",
  instalarTexto: "¿Quieres instalar la app y seguir la votación en tiempo real?",
  instalarLocal: "Si permites la ubicación, el aviso incluye al gobernador de tu estado cuando la disputa esté en segunda vuelta.",
  instalarVoz: "Instalar y escuchar",
  instalarPopup: "Instalar y recibir avisos",
  instalarVozApp: "Escuchar el escrutinio",
  instalarPopupApp: "Recibir avisos",
  instalarAgoraNao: "Ahora no",
  instalarIos: "En el iPhone, toca Compartir y luego Agregar a inicio.",
  acompanharDeNovo: "Seguir en vivo",
  boletimPresidente: (texto) => `Presidencia. ${texto}`,
  boletimGovernador: (estado, texto) => `Gobernador en ${estado}. ${texto}`,
  boletimCandidato: (nome, partido, pct) => `${nome}, ${partido}, ${pct}`,
  vozConfirmada: "Voy a avisar el porcentaje por voz.",
  vitoria: (nome) => `${nome} está elegido`,
  ouvirApito: "Escuchar el silbato",
  eleitos: "Elegidos",
  monitor: "Monitor del escrutinio",
  eleitosTitulo: "Quién ya está elegido",
  eleitosNota: "Lista general del presidente y de los gobernadores ya elegidos, en la primera y en la segunda vuelta.",
  eleitosVazio: "Todavía no hay elegido en esta vuelta.",
  eleitosConta: (n) => (n === 1 ? "1 elegido" : `${n} elegidos`),
  turno1: "Primera vuelta",
  turno2: "Segunda vuelta",
  filtroTodosTurnos: "Las dos vueltas",
  dataTurnoQuando: "25 de octubre de 2026",
  dataTurnoHorario: "Votación de 8h a 17h, hora de Brasilia.",
  avisoQuero: "Quiero que me avisen en este navegador",
  avisoLigado: "Aviso activado. La notificación llega en este navegador a las 8h del 25/10 si el sitio está abierto, o al abrirlo ese día.",
  avisoNegado: "El navegador bloqueó el aviso. Autorice las notificaciones de este sitio en los ajustes del navegador.",
  avisoSemSuporte: "Este navegador no muestra notificaciones.",
  avisoTitulo: "Segunda vuelta de 2026",
  avisoCorpoConfirmado: "Aviso activado. La votación de la segunda vuelta es el 25 de octubre, de 8h a 17h.",
  avisoCorpoDia: "Hoy es la segunda vuelta. La votación va de 8h a 17h, hora de Brasilia.",
  pularParaConteudo: "Ir al contenido",
  filtroVisao: "Qué mostrar",
  filtroTurno: "Qué vuelta",
  abrirLugar: (nome) => `Abrir ${nome}`,
  falaNumero: (atual, total) => `Frase ${atual} de ${total}`,
  faqTitulo: "Preguntas frecuentes",
  faqNota: "Reportajes de la web sobre quien está en esta pantalla. Cada frase es lo que publicó el medio. Este sitio no juzga al candidato.",
  faqAtualizando: "Buscando reportajes…",
  faqFalhou: "No se pudieron buscar reportajes ahora.",
  faqVazio: "Todavía no hay reportaje de esta pregunta para esta disputa.",
  faqEscolha: "Elija una pregunta para leer la respuesta.",
  faqFez: "Qué ha hecho ya el candidato",
  faqAcusacao: "De qué se le acusa",
  faqFake: "Noticias falsas",
  faqDeixou: "Qué hizo y qué dejó de hacer",
  faqRespostaFez: (nomes) => `Sobre ${nomes}, esta página muestra lo que el TSE ya ha sumado: votos, partido, número y situación en la elección. La vida pública fuera de la urna no está en ese archivo.`,
  faqRespostaAcusacao: (nomes) => `Una acusación contra ${nomes} no forma parte de este escrutinio. El sitio no lista proceso, delito ni culpa, y no trata la acusación como un hecho.`,
  faqRespostaFake: (nomes) => `Una noticia que circula sobre ${nomes} no se clasifica aquí como verdadera o falsa. Lo que esta pantalla confirma es la cifra pública del TSE. Lo demás no entra como hecho.`,
  faqRespostaDeixou: (nomes) => `De ${nomes}, lo que se puede ver aquí es el resultado electoral de abajo. Una promesa cumplida o lo que dejó de hacer no viene en el archivo del TSE, así que esta página no inventa esa lista.`,
  faqLinha: (nome, partido, numeroUrna, situacao, votos, pct) => `${nome} · ${partido} · ${numeroUrna}. Situación en el TSE: ${situacao}. ${votos} votos (${pct} de los válidos).`,
  faqSemNome: "los candidatos de esta disputa",
  visitantes: "Visitantes",
  jaAcessaram: (n) => `${n} ya entraron`,
  acessandoAgora: (n) => `${n} en línea ahora`,
  agoraCurto: (n) => `${n} ahora`,
  verGraficos: "Ver gráficos",
  foraDoBrasil: "Fuera de Brasil",
  votoBotao: (nome) => `Si usted es de ${nome}, vote ahora`,
  votoFeito: (nome) => `Su voto en ${nome} ya fue contado`,
  votoNota: "Este clic no es un voto de urna y no entra en el escrutinio del TSE. La misma conexión solo elige una vez.",
  analyticsTitulo: "Quién entra y votos del botón",
  graficoVisitantes: "Visitantes por estado",
  graficoAgora: "En línea ahora por estado",
  graficoVotos: "Encuesta de quién votó en el botón",
  votosNoBotao: (n) => `${n} votos en este botón`,
  compartilharEnquete: "Compartir encuesta",
  compartilharTexto: "Toque la foto y elija uno. Este clic no es un voto de urna.",
  linkCopiado: "Enlace copiado",
  enqueteToque: "Toque la foto para votar",
  atualizar: "Actualizar",
  atualizando: "Actualizando…",
  atualizado: "Actualizado",
  atualizarFalhou: "No se pudo actualizar ahora.",
  enqueteSeguir: "Ver el escrutinio",
  voltarInicio: "Volver al escrutinio",
  audienciaNota: "Conteo de este sitio, por estado. Sin nombre y sin dirección en la pantalla.",
};

const en: Copy = {
  metaTitle: "Brazil 2026 runoff count | President and governors",
  metaDescription: "Count of Brazil’s 2026 runoff: president, governors, states and municipalities, from the public TSE files. Voting is on 25 October.",
  kicker: "2026 election · TSE source",
  title: "Brazil 2026 runoff count",
  lead: "President and governors on 25 October 2026, from the official TSE numbers. Filter by state, municipality and who is already elected.",
  live: "Live count",
  waiting: "Waiting for the runoff",
  readAt: (hora) => `read at ${hora}`,
  countdownFuture: (dias, horas) => `Voting is on 25 Oct, from 8:00 to 17:00. The count starts in ${dias} day(s) and ${horas} hour(s).`,
  countdownPast: "Runoff voting has ended. The count shows up here when the TSE publishes the file.",
  sufixoDias: (n) => (n === 1 ? "day until the election" : "days until the election"),
  eleicaoHoje: "Election day",
  votacaoAberta: "Voting is open",
  votacaoEncerrou: "Voting has ended",
  steps: [
    ["1. Station", "Each ballot box produces a return. The TSE adds up the stations in the municipality."],
    ["2. Municipality", "The city total is the sum of those stations. It is the smallest piece on this page."],
    ["3. State", "The sum is rebuilt here: every municipality in the state, one by one."],
    ["4. Brazil", "The presidency adds the states and votes from abroad. A governor stops at the state."],
  ],
  tudo: "All",
  presidente: "President",
  governador: "Governor",
  estado: "State",
  municipio: "Municipality",
  brasilInteiro: "All of Brazil",
  exteriorSemMunicipio: "Votes abroad are included as one total, with no municipality",
  todosMunicipios: "All municipalities",
  escolhaEstado: "Choose a state",
  capital: "capital",
  semArquivo: "no file",
  lendo: "Reading the TSE’s public files…",
  erroRede: "The TSE could not be read just now.",
  erroMunicipio: "This municipality could not be read.",
  erroSoma: "Adding up the municipalities failed.",
  erroLimite: "Too many requests at once. Wait a moment and try again.",
  rastreio: (id) => `Trace: ${id}`,
  presidenteBrasil: "President in Brazil",
  arquivoNacional: (quando) => `National TSE file: ${quando} (Brasília)`,
  comoTotal: "How this total was built",
  comoTotalTexto: "The file for each state, plus votes abroad, was added up. That result should match Brazil’s single file. A gap, if there is one, is because the TSE writes those files at different moments.",
  soma: "Sum",
  oficial: "Official file",
  votosValidosFrase: "valid votes",
  contasFecham: "The two counts match.",
  diferenca: (votos, candidatos) => `Gap of ${votos} valid votes${candidatos ? ` and ${candidatos} candidate(s) with a different vote total.` : "."}`,
  governadores: "Governors",
  mostrarTodos: "Also show races already decided in the first round",
  mostrarSoSegundo: "Show only races still in the runoff",
  definido1: "Decided in the first round",
  segundoTurno: "Runoff",
  vaiSegundo: "Going to the runoff",
  presidenteCadaEstado: "President in each state",
  presidenteCadaEstadoNota: "Each card is that unit’s file. Open it to rebuild the count from municipalities.",
  somaLotes: (lugar) => `${lugar} · the sum below is rebuilt by reading each municipality, in batches, so the TSE is not flooded.`,
  presidenteEm: (lugar) => `President in ${lugar}`,
  governadorEm: (lugar) => `Governor in ${lugar}`,
  buscarSoma: "Search the sum",
  placeholderCidade: "Municipality name",
  validosCurtos: "valid",
  mostrando40: "Showing 40. Use search for the rest.",
  voltarSoma: (lugar) => `Back to the sum for ${lugar}`,
  municipioEntra: "This municipality is included in full in the state sum.",
  rodape: "Data from resultados.tse.jus.br. This site is not the TSE, does not project votes, and does not call a winner before the official tally.",
  secoes: (pct, feitas, total) => `${pct} of stations · ${feitas} of ${total}`,
  votosValidos: "Valid votes",
  notaValidos: "Blank and null ballots are left out. This is the base of the percentage.",
  brancos: "Blank",
  nulos: "Null",
  abstencao: "Abstention",
  outrosCandidatos: (n) => `Other candidates in this cut (${n})`,
  semPartido: "No party",
  coligacao: "Coalition",
  vice: "running mate",
  votosNominais: (n) => `${n} valid votes for the candidate`,
  tsePublica: (pct) => `TSE publishes ${pct}`,
  marca50: "The mark in the middle is 50% of valid votes.",
  soEntre: (pct) => `Between the people still in this race: ${pct}. In the first round the official percentage includes the other candidates.`,
  situacao: "Status at the TSE",
  apurado: "counted",
  lidosDe: (lidos, total) => `${lidos} of ${total} municipalities read`,
  comecandoLeitura: "Starting to read",
  aindaNao: "There are not enough municipalities yet to add up.",
  conferenciaEstado: "Check against the state file",
  conferenciaEstadoTexto: "Once every municipality is in, the sum should repeat the aggregate file the TSE publishes for the state.",
  falhas: (n) => `${n} municipality file(s) did not respond. The sum stays incomplete until they do.`,
  aviso: "Official numbers, no projection. Brazil’s total on this page is the sum of the states and of votes abroad. Each state is the sum of its municipalities — open one to check.",
  modoAoVivo: "Runoff count underway",
  modoAguardando: "First-round numbers, for those still in",
  modoDefinido: "Decided in the first round",
  idioma: "Language",
  temaEscuro: "Dark theme",
  temaClaro: "Light theme",
  doar: "Donate",
  fechar: "Close",
  doarTitulo: "Support this site",
  doarTexto: "Point your bank app’s camera at the code. You choose the amount.",
  doarValor: "There is no fixed amount. The code is all you need.",
  doarErro: "The code could not be generated just now.",
  fotoAlt: (nome) => `Photo of ${nome} published by the TSE`,
  carregando: "Loading the count…",
  mapaTitulo: "Map",
  graficoTitulo: "By state",
  municipiosTitulo: "Municipalities",
  verMunicipios: "Choose a state to see its municipalities.",
  naFrente: (nome, votos) => `${nome} leads by ${votos} votes.`,
  paraPassar: (nome, votos) => `${nome} needs ${votos} votes to move ahead.`,
  empatePlacar: "It is a tie right now. One vote changes who leads.",
  maioriaSimples: (nome) => `${nome} already has more than half of the valid votes.`,
  estadosNaFrente: (nome, n) => `${nome} leads in ${n} states.`,
  opiniaoFecha: (nome) => `If it ends like this, I go with ${nome}.`,
  opiniaoAberta: (nome) => `This can still turn. Right now, I go with ${nome}.`,
  apresentador: "Anchor",
  apresentadorOuvir: "Hear the count",
  voz: "Voice",
  perguntasProntas: "Questions",
  perguntaLivre: "Ask anything",
  perguntaLivreNota: "Free question. She can look it up on the web and names the outlet. The count on this screen stays the TSE count.",
  perguntar: "Ask",
  perguntando: "Searching…",
  perguntaFalhou: "Could not answer just now.",
  perguntaLimite: "Too many questions just now. Wait a moment.",
  perguntaQuemGanha: "Who is going to win?",
  perguntaFrente: "Who is ahead?",
  perguntaPassar: "Can the other still pass?",
  perguntaApurado: "How much is counted?",
  perguntaEstados: "Who leads in more states?",
  perguntaCidades: "What about the municipalities?",
  perguntaPresenca: "How many went to vote?",
  perguntaBrancos: "What about blank and null votes?",
  perguntaEleitos: "Who is already elected?",
  perguntaQuando: "When is the vote?",
  respostaNestaTela: (lugar) => `On this screen, ${lugar}.`,
  respostaPresenca: (compareceram, eleitorado, abstencao) => `${compareceram} of ${eleitorado} turned out. Abstention: ${abstencao}.`,
  respostaEleitosNomes: (nomes) => `This reading already shows elected: ${nomes}.`,
  semDisputa: "The two names in this race are not separated yet.",
  municipioDele: (nome, n) => `${nome} leads in ${n} municipalities read so far.`,
  urnas: (pct) => `${pct} of ballot boxes counted`,
  cenarioSegue: "Nobody is elected in this first round. Both go on.",
  cenarioEleito: (nome) => `${nome} is elected in this scenario: the other cannot catch up even with the votes still out.`,
  cenarioAberto: (nome, votos) => `${nome} leads, but is not elected yet. ${votos} votes can still come in.`,
  cenarioAbertoSemConta: (nome) => `${nome} leads, but the count is still open. Not elected yet.`,
  cenarioEmpate: "Tie. Nobody is elected.",
  ativarAudio: "Listen",
  pararAudio: "Mute",
  instalarTitulo: "Follow the count",
  instalarTexto: "Do you want to install the app and follow the vote in real time?",
  instalarLocal: "If you allow location, the update also includes your state's governor when that race is in a runoff.",
  instalarVoz: "Install and listen",
  instalarPopup: "Install and get alerts",
  instalarVozApp: "Hear the count",
  instalarPopupApp: "Get alerts",
  instalarAgoraNao: "Not now",
  instalarIos: "On iPhone, tap Share, then Add to Home Screen.",
  acompanharDeNovo: "Follow live",
  boletimPresidente: (texto) => `President. ${texto}`,
  boletimGovernador: (estado, texto) => `Governor in ${estado}. ${texto}`,
  boletimCandidato: (nome, partido, pct) => `${nome}, ${partido}, ${pct}`,
  vozConfirmada: "I will call the percentages out loud.",
  vitoria: (nome) => `${nome} is elected`,
  ouvirApito: "Play the whistle",
  eleitos: "Elected",
  monitor: "Count monitor",
  eleitosTitulo: "Who is already elected",
  eleitosNota: "One list of the president and every governor already elected, in the first round and in the runoff.",
  eleitosVazio: "Nobody is elected in this round yet.",
  eleitosConta: (n) => (n === 1 ? "1 elected" : `${n} elected`),
  turno1: "First round",
  turno2: "Runoff",
  filtroTodosTurnos: "Both rounds",
  dataTurnoQuando: "25 October 2026",
  dataTurnoHorario: "Voting from 8:00 to 17:00, Brasília time.",
  avisoQuero: "I want an alert in this browser",
  avisoLigado: "Alert on. It arrives in this browser at 8:00 on 25 Oct if the site is open, or when you open the site that day.",
  avisoNegado: "The browser blocked the alert. Allow notifications for this site in the browser settings.",
  avisoSemSuporte: "This browser does not show notifications.",
  avisoTitulo: "2026 runoff",
  avisoCorpoConfirmado: "Alert on. Runoff voting is on 25 October, from 8:00 to 17:00.",
  avisoCorpoDia: "Today is the runoff. Voting runs from 8:00 to 17:00, Brasília time.",
  pularParaConteudo: "Skip to content",
  filtroVisao: "What to show",
  filtroTurno: "Which round",
  abrirLugar: (nome) => `Open ${nome}`,
  falaNumero: (atual, total) => `Line ${atual} of ${total}`,
  faqTitulo: "Common questions",
  faqNota: "News reports about the people on this screen. Each line is what the outlet published. This site does not judge the candidate.",
  faqAtualizando: "Looking up reports…",
  faqFalhou: "Reports could not be loaded just now.",
  faqVazio: "There is no report for this question in this race yet.",
  faqEscolha: "Pick a question to read the answer.",
  faqFez: "What the candidate has already done",
  faqAcusacao: "What they are accused of",
  faqFake: "Fake news",
  faqDeixou: "What they did and what they left undone",
  faqRespostaFez: (nomes) => `For ${nomes}, this page shows what the TSE has already added up: votes, party, number and status in the election. A public life outside the ballot box is not in that file.`,
  faqRespostaAcusacao: (nomes) => `An accusation against ${nomes} is not part of this count. The site does not list cases, crimes or guilt, and it does not treat an accusation as a fact.`,
  faqRespostaFake: (nomes) => `A story circulating about ${nomes} is not labeled here as true or false. What this screen confirms is the public TSE number. Anything else is not entered as fact.`,
  faqRespostaDeixou: (nomes) => `For ${nomes}, what you can see here is the election result below. A kept promise, or something left undone, is not in the TSE file, so this page does not invent that list.`,
  faqLinha: (nome, partido, numeroUrna, situacao, votos, pct) => `${nome} · ${partido} · ${numeroUrna}. TSE status: ${situacao}. ${votos} votes (${pct} of valid votes).`,
  faqSemNome: "the candidates in this race",
  visitantes: "Visitors",
  jaAcessaram: (n) => `${n} have visited`,
  acessandoAgora: (n) => `${n} here now`,
  agoraCurto: (n) => `${n} now`,
  verGraficos: "See charts",
  foraDoBrasil: "Outside Brazil",
  votoBotao: (nome) => `If you are for ${nome}, vote now`,
  votoFeito: (nome) => `Your vote for ${nome} was counted`,
  votoNota: "This click is not a ballot and is not part of the TSE count. The same connection picks once.",
  analyticsTitulo: "Who visits, and votes on the button",
  graficoVisitantes: "Visitors by state",
  graficoAgora: "Here now, by state",
  graficoVotos: "Poll of who voted on the button",
  votosNoBotao: (n) => `${n} votes on this button`,
  compartilharEnquete: "Share the poll",
  compartilharTexto: "Tap a photo and pick one. This click is not a ballot.",
  linkCopiado: "Link copied",
  enqueteToque: "Tap the photo to vote",
  atualizar: "Refresh",
  atualizando: "Refreshing…",
  atualizado: "Updated",
  atualizarFalhou: "Could not refresh just now.",
  enqueteSeguir: "See the count",
  voltarInicio: "Back to the count",
  audienciaNota: "This site’s count, by state. No name and no address on screen.",
};

export const MENSAGENS: Record<Locale, Copy> = { "pt-BR": ptBR, "pt-PT": ptPT, es, en };
