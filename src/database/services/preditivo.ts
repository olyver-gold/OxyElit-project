import { getDb } from "../db";

import {
  MIN_SESSOES_PREDICAO,
  ComponentesScore,
  TendenciaPreditiva,
  calcularComponentesScore,
  calcularTendencia,
  estimarPrevisaoAlta,
  extrairNumeros,
  calcularMedia,
} from "../../services/calcularScore";

export interface PacientePreditivoResumo {
  id: number;
  nome: string;
  diagnostico: string | null;
  total_sessoes: number;
  ultima_sessao: string | null;
  status_predicao: "disponivel" | "insuficiente";
}

export interface SessaoPreditiva {
  sessao_id: number;
  inicio: string;
  fim: string | null;

  fr_media: number | null;
  fr_desvio_padrao: number | null;

  ie_media: number | null;

  pressao_media: number | null;
  pressao_desvio_padrao: number | null;

  total_ciclos: number | null;
  ciclos_atipicos: number | null;

  score_evolucao: number | null;

  fr_min_alvo: number | null;
  fr_max_alvo: number | null;
  ie_inspiracao_alvo: number | null;
  ie_expiracao_alvo: number | null;

  spo2_inicial: number | null;
  spo2_final: number | null;

  borg_inicial: number | null;
  borg_final: number | null;

  fc_final: number | null;
  fc_recuperacao: number | null;
  tempo_recuperacao_segundos: number | null;
}

export interface AnalisePreditivaPaciente {
  paciente_id: number;
  nome: string;
  diagnostico: string | null;

  total_sessoes: number;
  ultima_sessao: string | null;

  dados_suficientes: boolean;
  sessoes_necessarias: number;
  sessoes_faltantes: number;

  score_atual: number | null;
  tendencia: TendenciaPreditiva;

  fr_media_geral: number | null;
  previsao_alta: string | null;

  componentes: ComponentesScore;

  sessoes: SessaoPreditiva[];
}

export async function listarPacientesPreditivo(
  fisioterapeutaId: number
): Promise<PacientePreditivoResumo[]> {
  const db = await getDb();

  return await db.select<PacientePreditivoResumo[]>(
    `
    SELECT
      p.id,
      p.nome,
      p.diagnostico,

      COUNT(CASE WHEN s.status = 'encerrada' THEN 1 END) AS total_sessoes,

      MAX(CASE WHEN s.status = 'encerrada' THEN s.inicio END) AS ultima_sessao,

      CASE
        WHEN COUNT(CASE WHEN s.status = 'encerrada' THEN 1 END) >= ?
          THEN 'disponivel'
        ELSE 'insuficiente'
      END AS status_predicao

    FROM pacientes p
    LEFT JOIN sessoes s ON s.paciente_id = p.id
    WHERE p.fisioterapeuta_id = ?
      AND p.ativo = 1
    GROUP BY
      p.id,
      p.nome,
      p.diagnostico
    ORDER BY p.nome ASC
    `,
    [MIN_SESSOES_PREDICAO, fisioterapeutaId]
  );
}

export async function buscarAnalisePreditivaPaciente(
  pacienteId: number
): Promise<AnalisePreditivaPaciente | null> {
  const db = await getDb();

  const paciente = await db.select<
    {
      id: number;
      nome: string;
      diagnostico: string | null;
    }[]
  >(
    `
    SELECT
      id,
      nome,
      diagnostico
    FROM pacientes
    WHERE id = ?
    LIMIT 1
    `,
    [pacienteId]
  );

  if (!paciente[0]) {
    return null;
  }

  const sessoes = await db.select<SessaoPreditiva[]>(
    `
    SELECT
      s.id AS sessao_id,
      s.inicio,
      s.fim,

      m.fr_media,
      m.fr_desvio_padrao,

      m.ie_media,

      m.pressao_media,
      m.pressao_desvio_padrao,

      m.total_ciclos,
      m.ciclos_atipicos,

      m.score_evolucao,

      pr.fr_min AS fr_min_alvo,
      pr.fr_max AS fr_max_alvo,
      pr.ie_inspiracao AS ie_inspiracao_alvo,
      pr.ie_expiracao AS ie_expiracao_alvo,

      a.spo2_inicial,
      a.spo2_final,

      a.borg_inicial,
      a.borg_final,

      a.fc_final,
      a.fc_recuperacao,
      a.tempo_recuperacao_segundos

    FROM sessoes s
    LEFT JOIN metricas_sessao m ON m.sessao_id = s.id
    LEFT JOIN prescricoes pr ON pr.id = s.prescricao_id
    LEFT JOIN avaliacao_clinica_sessao a ON a.sessao_id = s.id

    WHERE s.paciente_id = ?
      AND s.status = 'encerrada'

    ORDER BY s.inicio ASC
    `,
    [pacienteId]
  );

  const totalSessoes = sessoes.length;

  const dadosSuficientes = totalSessoes >= MIN_SESSOES_PREDICAO;

  const sessoesFaltantes = Math.max(
    0,
    MIN_SESSOES_PREDICAO - totalSessoes
  );

  const ultimaSessao =
    totalSessoes > 0 ? sessoes[totalSessoes - 1].inicio : null;

  const frValores = extrairNumeros(
    sessoes.map((sessao) => sessao.fr_media)
  );

  const scores = extrairNumeros(
    sessoes.map((sessao) => sessao.score_evolucao)
  );

  const frMediaGeral = calcularMedia(frValores);

  const scoreAtual =
    scores.length > 0 ? scores[scores.length - 1] : null;

  const tendencia = dadosSuficientes
    ? calcularTendencia(scores)
    : "insuficiente";

  const sessaoMaisRecente =
    sessoes.length > 0 ? sessoes[sessoes.length - 1] : null;

  const componentes = calcularComponentesScore({
    frMedia: sessaoMaisRecente?.fr_media ?? null,
    frMin: sessaoMaisRecente?.fr_min_alvo ?? null,
    frMax: sessaoMaisRecente?.fr_max_alvo ?? null,

    frDesvioPadrao: sessaoMaisRecente?.fr_desvio_padrao ?? null,

    ieMedia: sessaoMaisRecente?.ie_media ?? null,
    ieInspiracaoAlvo: sessaoMaisRecente?.ie_inspiracao_alvo ?? null,
    ieExpiracaoAlvo: sessaoMaisRecente?.ie_expiracao_alvo ?? null,

    spo2Inicial: sessaoMaisRecente?.spo2_inicial ?? null,
    spo2Final: sessaoMaisRecente?.spo2_final ?? null,

    borgInicial: sessaoMaisRecente?.borg_inicial ?? null,
    borgFinal: sessaoMaisRecente?.borg_final ?? null,

    fcFinal: sessaoMaisRecente?.fc_final ?? null,
    fcRecuperacao: sessaoMaisRecente?.fc_recuperacao ?? null,
  });

  return {
    paciente_id: paciente[0].id,
    nome: paciente[0].nome,
    diagnostico: paciente[0].diagnostico,

    total_sessoes: totalSessoes,
    ultima_sessao: ultimaSessao,

    dados_suficientes: dadosSuficientes,
    sessoes_necessarias: MIN_SESSOES_PREDICAO,
    sessoes_faltantes: sessoesFaltantes,

    score_atual: dadosSuficientes ? scoreAtual : null,
    tendencia,

    fr_media_geral: frMediaGeral,
    previsao_alta: dadosSuficientes
      ? estimarPrevisaoAlta(tendencia, scoreAtual)
      : null,

    componentes,

    sessoes,
  };
}