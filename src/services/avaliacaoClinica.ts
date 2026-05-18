import { getDb } from "../database/db";

export interface AvaliacaoClinicaSessao {
    id: number;
    sessao_id: number;
    spo2_inicial: number | null;
    spo2_final: number | null;
    borg_inicial: number | null;
    borg_final: number | null;
    fc_final: number | null;
    fc_recuperacao: number | null;
    tempo_recuperacao_segundos: number;
    observacoes_clinicas: string | null;
    criado_em: string;
}

export async function salvarAvaliacaoClinicaSessao(params: {
    sessaoId: number;
    spo2Inicial?: number | null;
    spo2Final?: number | null;
    borgInicial?: number | null;
    borgFinal?: number | null;
    fcFinal?: number | null;
    fcRecuperacao?: number | null;
    tempoRecuperacaoSegundos?: number;
    observacoesClinicas?: string | null;
}): Promise<void> {
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
        `,
        [
        params.sessaoId,
        params.spo2Inicial ?? null,
        params.spo2Final ?? null,
        params.borgInicial ?? null,
        params.borgFinal ?? null,
        params.fcFinal ?? null,
        params.fcRecuperacao ?? null,
        params.tempoRecuperacaoSegundos ?? 60,
        params.observacoesClinicas?.trim() || null,
        ]
    );
}