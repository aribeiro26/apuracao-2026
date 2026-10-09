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
};

const ptBR: Copy = {
  metaTitle: "Segundo turno 2026",
  metaDescription: "Acompanhe presidente e governadores no segundo turno de 2026 com os arquivos públicos do TSE.",
  kicker: "Eleições 2026 · fonte TSE",
  title: "Segundo turno 2026",
  lead: "Presidente e governadores, com os números oficiais do TSE.",
  live: "Apuração ao vivo",
  waiting: "Aguardando o 2º turno",
  readAt: (hora) => `lido às ${hora}`,
  countdownFuture: (dias, horas) => `Votação em 25/10, das 8h às 17h. A apuração começa em ${dias} dia(s) e ${horas} hora(s).`,
  countdownPast: "A votação do 2º turno já encerrou. A apuração entra aqui quando o TSE publica o arquivo.",
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
};

const ptPT: Copy = {
  ...ptBR,
  metaTitle: "Segunda volta 2026",
  metaDescription: "Acompanhe presidente e governadores na segunda volta de 2026 com os ficheiros públicos do TSE.",
  kicker: "Eleições 2026 · fonte TSE",
  title: "Segunda volta 2026",
  lead: "Presidente e governadores, com os números oficiais do TSE.",
  live: "Apuramento em direto",
  waiting: "A aguardar a segunda volta",
  readAt: (hora) => `lido às ${hora}`,
  countdownFuture: (dias, horas) => `Votação a 25/10, das 8h às 17h. O apuramento começa dentro de ${dias} dia(s) e ${horas} hora(s).`,
  countdownPast: "A votação da segunda volta já terminou. O apuramento aparece aqui quando o TSE publicar o ficheiro.",
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
  buscarSoma: "Pesquisar na soma",
};

const es: Copy = {
  metaTitle: "Segunda vuelta 2026",
  metaDescription: "Sigue al presidente y a los gobernadores en la segunda vuelta de 2026 con los archivos públicos del TSE.",
  kicker: "Elecciones 2026 · fuente TSE",
  title: "Segunda vuelta 2026",
  lead: "Presidente y gobernadores, con las cifras oficiales del TSE.",
  live: "Escrutinio en directo",
  waiting: "A la espera de la segunda vuelta",
  readAt: (hora) => `leído a las ${hora}`,
  countdownFuture: (dias, horas) => `Votación el 25/10, de 8h a 17h. El escrutinio empieza en ${dias} día(s) y ${horas} hora(s).`,
  countdownPast: "La votación de la segunda vuelta ya terminó. El escrutinio aparece aquí cuando el TSE publica el archivo.",
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
};

const en: Copy = {
  metaTitle: "2026 runoff",
  metaDescription: "Follow the presidential and governor races in Brazil’s 2026 runoff using public TSE files.",
  kicker: "2026 election · TSE source",
  title: "2026 runoff",
  lead: "President and governors, from the official TSE numbers.",
  live: "Live count",
  waiting: "Waiting for the runoff",
  readAt: (hora) => `read at ${hora}`,
  countdownFuture: (dias, horas) => `Voting is on 25 Oct, from 8:00 to 17:00. The count starts in ${dias} day(s) and ${horas} hour(s).`,
  countdownPast: "Runoff voting has ended. The count shows up here when the TSE publishes the file.",
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
};

export const MENSAGENS: Record<Locale, Copy> = { "pt-BR": ptBR, "pt-PT": ptPT, es, en };
