import { getDb } from "../db";

export type StatusSessao = 'ativa' | 'encerrada' | 'cancelada';

export interface Sessao {
    id: number;
    paciente_id: number;
    fisioterapeuta_id: number;
    prescricao_id: number;
    inicio: string;
    fim: string | null;
    duracao_segundos: number | null;
    observacoes: string | null;
    status: StatusSessao;

    paciente_nome: string;
    diagnostico: string | null;

    fr_min: number | null;
    fr_max: number | null;
    ie_inspiracao: number | null;
    ie_expiracao: number | null;
    pressao_min: number | null;
    pressao_max: number | null;
}

export async function debugValidarIds(
    usuarioId: number,
    pacienteId: number,
    prescricaoId?: number | null
    ) {
    const db = await getDb();

    const usuarios = await db.select<{ total: number }[]>(
        `
        SELECT COUNT(*) AS total
        FROM usuarios
        WHERE id = ?;
        `,
        [usuarioId]
    );

    const pacientes = await db.select<{ total: number }[]>(
        `
        SELECT COUNT(*) AS total
        FROM pacientes
        WHERE id = ?;
        `,
        [pacienteId]
    );

    const prescricoes = prescricaoId
        ? await db.select<{ total: number }[]>(
            `
            SELECT COUNT(*) AS total
            FROM prescricoes
            WHERE id = ?;
            `,
            [prescricaoId]
        )
        : [{ total: 0 }];

    console.log("VALIDAÇÃO DE IDS:", {
        usuarioId,
        usuarioExiste: usuarios[0]?.total ?? 0,
        pacienteId,
        pacienteExiste: pacientes[0]?.total ?? 0,
        prescricaoId,
        prescricaoExiste: prescricoes[0]?.total ?? 0,
    });
}

export async function iniciarSessao(
    pacienteId: number,
    fisioterapeutaId: number,
    prescricaoId: number | null,
    observacoes?: string
): Promise<Sessao> {
    const db = await getDb();

    await db.execute(
        `
        INSERT INTO sessoes (
            paciente_id, fisioterapeuta_id, prescricao_id, observacoes, status
        )
        VALUES (?, ?, ?, ?, 'ativa')
        `,
        [pacienteId, fisioterapeutaId, prescricaoId, observacoes?.trim() || null]
    );

    const sessoes = await db.select<Sessao[]>(
        `
        SELECT
            s.*,
            p.nome AS paciente_nome,
            p.diagnostico,

            pr.fr_min,
            pr.fr_max,
            pr.ie_inspiracao,
            pr.ie_expiracao,
            pr.pressao_min,
            pr.pressao_max
        FROM sessoes s
        JOIN pacientes p ON p.id = s.paciente_id
        LEFT JOIN prescricoes pr ON pr.id = s.prescricao_id
        WHERE s.paciente_id = ?
        AND s.fisioterapeuta_id = ?
        AND s.status = 'ativa'
        ORDER BY s.id DESC
        LIMIT 1;
        `,
        [pacienteId, fisioterapeutaId]
    );
    
    if (sessoes.length === 0) {
        throw new Error("Erro ao iniciar sessão: sessão não encontrada após inserção");
    }
    
    return sessoes[0];
}

export async function buscarSessaoAtivaPorFisioterapeuta(fisioterapeutaId: number): Promise<Sessao | null> {
    const db = await getDb();

    const resultado = await db.select<Sessao[]>(
        `
        SELECT
            s.id, s.paciente_id, s.fisioterapeuta_id, s.prescricao_id, s.inicio, s.fim, s.duracao_segundos, s.observacoes, s.status,
            p.nome AS paciente_nome, p.diagnostico,
            pr.fr_min, pr.fr_max, pr.ie_inspiracao, pr.ie_expiracao, pr.pressao_min, pr.pressao_max
        FROM sessoes s
        JOIN pacientes p ON p.id = s.paciente_id
        LEFT JOIN prescricoes pr ON pr.id = s.prescricao_id
        WHERE s.fisioterapeuta_id = ?
        AND s.status = 'ativa'
        ORDER BY s.inicio DESC
        LIMIT 1;
        `,
        [fisioterapeutaId]
    );

    return resultado[0] ?? null;
}   

export async function encerrarSessao(sessaoId: number): Promise<void> {
    const db = await getDb();

    await db.execute(
        `
        UPDATE sessoes
        SET 
            fim = datetime('now'),
            duracao_segundos = CAST(
                (julianday(datetime('now')) - julianday(inicio)) * 86400 AS INTEGER
            ),
            status = 'encerrada'
        WHERE id = ?
        `,
        [sessaoId]
    );
}

export async function cancelarSessao(sessaoId: number): Promise<void> {
    const db = await getDb();

    await db.execute(
        `
        UPDATE sessoes
        SET 
            fim = datetime('now'),
            status = 'cancelada'
        WHERE id = ?
        `,
        [sessaoId]
    );
}