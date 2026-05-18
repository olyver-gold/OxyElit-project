export const MIN_SESSOES_PREDICAO = 5;

export type TendenciaPreditiva =
  | "melhora"
  | "estavel"
  | "piora"
  | "insuficiente";

export type ClassificacaoComponente =
  | "Boa"
  | "Moderada"
  | "Baixa"
  | "Crítica"
  | "Sem dados";

export type ClassificacaoEstabilidade =
  | "Alta"
  | "Moderada"
  | "Baixa"
  | "Sem dados";

export interface SessaoScoreInput {
  frMedia: number | null;
  frMin: number | null;
  frMax: number | null;

  frDesvioPadrao: number | null;

  ieMedia: number | null;
  ieInspiracaoAlvo: number | null;
  ieExpiracaoAlvo: number | null;

  spo2Inicial: number | null;
  spo2Final: number | null;

  borgInicial: number | null;
  borgFinal: number | null;

  fcFinal: number | null;
  fcRecuperacao: number | null;
}

export interface ComponenteScore {
  valor: number | null;
  nota: number | null;
  classificacao: string;
}

export interface ComponentesScore {
  fr_media: ComponenteScore;
  estabilidade_fr: ComponenteScore;
  qualidade_ie: ComponenteScore;
  spo2: ComponenteScore;
  borg: ComponenteScore;
  fc_recuperacao: ComponenteScore;
}

export interface ResultadoScoreSessao {
  score: number | null;
  componentes: ComponentesScore;
}

/**
 * Calcula o score evolutivo da sessão.
 *
 * Componentes usados:
 * - FR média
 * - Estabilidade da FR
 * - Qualidade da razão I:E
 * - SpO₂
 * - Variação da escala de Borg
 * - Frequência cardíaca de recuperação
 */
export function calcularScoreEvolucaoSessao(
  dados: SessaoScoreInput
): ResultadoScoreSessao {
  const componentes = calcularComponentesScore(dados);

  const notasComPesos = [
    {
      nota: componentes.fr_media.nota,
      peso: 0.2,
    },
    {
      nota: componentes.estabilidade_fr.nota,
      peso: 0.15,
    },
    {
      nota: componentes.qualidade_ie.nota,
      peso: 0.15,
    },
    {
      nota: componentes.spo2.nota,
      peso: 0.2,
    },
    {
      nota: componentes.borg.nota,
      peso: 0.15,
    },
    {
      nota: componentes.fc_recuperacao.nota,
      peso: 0.15,
    },
  ].filter((item): item is { nota: number; peso: number } => {
    return item.nota !== null && Number.isFinite(item.nota);
  });

  if (notasComPesos.length === 0) {
    return {
      score: null,
      componentes,
    };
  }

  const somaPesos = notasComPesos.reduce(
    (total, item) => total + item.peso,
    0
  );

  const scorePonderado =
    notasComPesos.reduce(
      (total, item) => total + item.nota * item.peso,
      0
    ) / somaPesos;

  return {
    score: limitarNota(scorePonderado),
    componentes,
  };
}

/**
 * Calcula os seis componentes individuais do score.
 */
export function calcularComponentesScore(
  dados: SessaoScoreInput
): ComponentesScore {
  const notaFrMedia = pontuarFrMedia(
    dados.frMedia,
    dados.frMin,
    dados.frMax
  );

  const notaEstabilidadeFr = pontuarEstabilidadeFr(
    dados.frDesvioPadrao
  );

  const notaQualidadeIE = pontuarQualidadeIE(
    dados.ieMedia,
    dados.ieInspiracaoAlvo,
    dados.ieExpiracaoAlvo
  );

  const notaSpo2 = pontuarSpo2(
    dados.spo2Inicial,
    dados.spo2Final
  );

  const notaBorg = pontuarBorg(
    dados.borgInicial,
    dados.borgFinal
  );

  const notaFcRecuperacao = pontuarFcRecuperacao(
    dados.fcFinal,
    dados.fcRecuperacao
  );

  return {
    fr_media: {
      valor: dados.frMedia,
      nota: notaFrMedia,
      classificacao: classificarNota(notaFrMedia),
    },

    estabilidade_fr: {
      valor: dados.frDesvioPadrao,
      nota: notaEstabilidadeFr,
      classificacao: classificarEstabilidadeFr(dados.frDesvioPadrao),
    },

    qualidade_ie: {
      valor: dados.ieMedia,
      nota: notaQualidadeIE,
      classificacao: classificarNota(notaQualidadeIE),
    },

    spo2: {
      valor: dados.spo2Final,
      nota: notaSpo2,
      classificacao: classificarNota(notaSpo2),
    },

    borg: {
      valor:
        dados.borgInicial !== null && dados.borgFinal !== null
          ? Number((dados.borgFinal - dados.borgInicial).toFixed(1))
          : null,
      nota: notaBorg,
      classificacao: classificarNota(notaBorg),
    },

    fc_recuperacao: {
      valor:
        dados.fcFinal !== null && dados.fcRecuperacao !== null
          ? Number((dados.fcFinal - dados.fcRecuperacao).toFixed(1))
          : null,
      nota: notaFcRecuperacao,
      classificacao: classificarNota(notaFcRecuperacao),
    },
  };
}

/**
 * Pontua a FR média comparando com a faixa-alvo da sessão.
 */
export function pontuarFrMedia(
  frMedia: number | null,
  frMin: number | null,
  frMax: number | null
): number | null {
  if (frMedia === null || frMin === null || frMax === null) {
    return null;
  }

  if (frMedia >= frMin && frMedia <= frMax) {
    return 10;
  }

  const distancia =
    frMedia < frMin
      ? frMin - frMedia
      : frMedia - frMax;

  const penalidade = distancia * 1.5;

  return limitarNota(10 - penalidade);
}

/**
 * Pontua a estabilidade da FR usando o desvio padrão.
 *
 * Quanto menor o desvio padrão, maior a estabilidade.
 */
export function pontuarEstabilidadeFr(
  frDesvioPadrao: number | null
): number | null {
  if (frDesvioPadrao === null) {
    return null;
  }

  if (frDesvioPadrao <= 1) return 10;
  if (frDesvioPadrao <= 2) return 8;
  if (frDesvioPadrao <= 3) return 6;
  if (frDesvioPadrao <= 4) return 4;

  return 2;
}

/**
 * Pontua a qualidade da razão I:E comparando a média real com a razão alvo.
 *
 * Exemplo:
 * alvo 1:2 = 1 / 2 = 0.5
 */
export function pontuarQualidadeIE(
  ieMedia: number | null,
  ieInspiracaoAlvo: number | null,
  ieExpiracaoAlvo: number | null
): number | null {
  if (
    ieMedia === null ||
    ieInspiracaoAlvo === null ||
    ieExpiracaoAlvo === null ||
    ieExpiracaoAlvo === 0
  ) {
    return null;
  }

  const ieAlvo = ieInspiracaoAlvo / ieExpiracaoAlvo;
  const diferenca = Math.abs(ieMedia - ieAlvo);

  if (diferenca <= 0.05) return 10;
  if (diferenca <= 0.1) return 8;
  if (diferenca <= 0.2) return 6;
  if (diferenca <= 0.3) return 4;

  return 2;
}

/**
 * Pontua a SpO₂.
 *
 * Prioriza a variação entre início e fim quando os dois valores existem.
 * Caso não exista SpO₂ inicial, usa somente a SpO₂ final.
 */
export function pontuarSpo2(
  spo2Inicial: number | null,
  spo2Final: number | null
): number | null {
  if (spo2Final === null) {
    return null;
  }

  if (spo2Inicial !== null) {
    const queda = spo2Inicial - spo2Final;

    if (queda <= 0) return 10;
    if (queda <= 2) return 8;
    if (queda <= 4) return 5;

    return 2;
  }

  if (spo2Final >= 96) return 10;
  if (spo2Final >= 94) return 8;
  if (spo2Final >= 92) return 6;
  if (spo2Final >= 90) return 4;

  return 2;
}

/**
 * Pontua tolerância ao esforço usando a variação da escala de Borg.
 *
 * Quanto menor o aumento do Borg, melhor a tolerância.
 */
export function pontuarBorg(
  borgInicial: number | null,
  borgFinal: number | null
): number | null {
  if (borgInicial === null || borgFinal === null) {
    return null;
  }

  const variacao = borgFinal - borgInicial;

  if (variacao <= 0) return 10;
  if (variacao <= 1) return 8;
  if (variacao <= 2) return 6;
  if (variacao <= 3) return 4;

  return 2;
}

/**
 * Pontua a recuperação da frequência cardíaca.
 *
 * Quanto maior a queda da FC após o tempo de recuperação, melhor.
 */
export function pontuarFcRecuperacao(
  fcFinal: number | null,
  fcRecuperacao: number | null
): number | null {
  if (fcFinal === null || fcRecuperacao === null) {
    return null;
  }

  const queda = fcFinal - fcRecuperacao;

  if (queda >= 20) return 10;
  if (queda >= 15) return 8;
  if (queda >= 10) return 6;
  if (queda >= 5) return 4;

  return 2;
}

/**
 * Calcula a tendência geral do paciente a partir dos scores das sessões.
 */
export function calcularTendencia(
  scores: number[]
): TendenciaPreditiva {
  const valores = scores.filter((valor) => Number.isFinite(valor));

  if (valores.length < MIN_SESSOES_PREDICAO) {
    return "insuficiente";
  }

  const metade = Math.floor(valores.length / 2);

  const primeiros = valores.slice(0, metade);
  const ultimos = valores.slice(metade);

  const mediaPrimeiros = calcularMedia(primeiros);
  const mediaUltimos = calcularMedia(ultimos);

  if (mediaPrimeiros === null || mediaUltimos === null) {
    return "insuficiente";
  }

  const diferenca = mediaUltimos - mediaPrimeiros;

  if (diferenca >= 0.7) return "melhora";
  if (diferenca <= -0.7) return "piora";

  return "estavel";
}

/**
 * Estimativa textual simples para previsão de alta.
 *
 * Pode ser refinada depois com orientação clínica.
 */
export function estimarPrevisaoAlta(
  tendencia: TendenciaPreditiva,
  scoreAtual: number | null
): string | null {
  if (scoreAtual === null || tendencia === "insuficiente") {
    return null;
  }

  if (scoreAtual >= 8.5) {
    return "próxima";
  }

  if (tendencia === "melhora") {
    return "~4 sem.";
  }

  if (tendencia === "estavel") {
    return "indefinida";
  }

  return "sem previsão";
}

export function classificarNota(
  nota: number | null
): ClassificacaoComponente {
  if (nota === null) return "Sem dados";
  if (nota >= 8) return "Boa";
  if (nota >= 6) return "Moderada";
  if (nota >= 4) return "Baixa";

  return "Crítica";
}

export function classificarEstabilidadeFr(
  frDesvioPadrao: number | null
): ClassificacaoEstabilidade {
  if (frDesvioPadrao === null) return "Sem dados";
  if (frDesvioPadrao <= 1) return "Alta";
  if (frDesvioPadrao <= 3) return "Moderada";

  return "Baixa";
}

export function calcularMedia(valores: number[]): number | null {
  const validos = valores.filter((valor) => Number.isFinite(valor));

  if (validos.length === 0) {
    return null;
  }

  const soma = validos.reduce((total, valor) => total + valor, 0);

  return Number((soma / validos.length).toFixed(2));
}

export function extrairNumeros(
  valores: Array<number | null | undefined>
): number[] {
  return valores.filter(
    (valor): valor is number =>
      valor !== null &&
      valor !== undefined &&
      Number.isFinite(valor)
  );
}

export function limitarNota(valor: number): number {
  return Math.max(0, Math.min(10, Number(valor.toFixed(1))));
}