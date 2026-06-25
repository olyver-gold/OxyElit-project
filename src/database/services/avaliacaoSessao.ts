import { getDb } from "../db";

export interface AvaliacaoClinicaSessaoInput {
  sessaoId: number;

  spo2Inicial: number;
  spo2Final: number;

  borgInicial: number;
  borgFinal: number;

  fcFinal: number;
  fcRecuperacao: number;

  tempoRecuperacaoSegundos?: number;
  observacoesClinicas?: string | null;
}

export async function salvarAvaliacaoClinicaSessao(
  params: AvaliacaoClinicaSessaoInput
): Promise<void> {
  const db = await getDb();

  await db.execute(
    `
    INSERT INTO avaliacao_clinica_sessao (
      sessao_id,
      spo2_inicial,
      spo2_final,
      borg_inicial,
      borg_final,
      fc_final,
      fc_recuperacao,
      tempo_recuperacao_segundos,
      observacoes_clinicas
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT(sessao_id) DO UPDATE SET
      spo2_inicial = excluded.spo2_inicial,
      spo2_final = excluded.spo2_final,
      borg_inicial = excluded.borg_inicial,
      borg_final = excluded.borg_final,
      fc_final = excluded.fc_final,
      fc_recuperacao = excluded.fc_recuperacao,
      tempo_recuperacao_segundos = excluded.tempo_recuperacao_segundos,
      observacoes_clinicas = excluded.observacoes_clinicas
    `,
    [
      params.sessaoId,

      params.spo2Inicial,
      params.spo2Final,

      params.borgInicial,
      params.borgFinal,

      params.fcFinal,
      params.fcRecuperacao,

      params.tempoRecuperacaoSegundos ?? 60,
      params.observacoesClinicas?.trim() || null,
    ]
  );
}