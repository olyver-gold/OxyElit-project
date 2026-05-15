import { getDb } from "../db";
import { StatusSessao } from "./sessoes";

export interface SessaoAtivaVG {
    id: number;
    paciente_id: number;
    paciente_nome: string;
    diagnostico: string;
    inicio: string;
    status: StatusSessao;

    fr_min: number | null;
    fr_max: number | null;
    ie_inspiracao: number | null;
    ie_expiracao: number | null;
    pressao_min: number | null;
    pressao_max: number | null;
}

export interface DadosVisaoGeral {
    sessoesHoje: number;
    pacientesAtivos: number;
    pacientesComSessaoHoje: number;
    alertasAtivos: number;
    sessaoAtiva: SessaoAtivaVG | null;
}

export interface ResumoClinicoPaciente {
    ultima_sessao: string | null;
    total_sessoes: number;
    tendencia: string | null;
    observacao: string | null;
}

export async function buscarDadosVisaoGeral(fisioterapeutaId: number): Promise<DadosVisaoGeral> {
    const db = await getDb();

    const sessoesHoje = await db.select<{ total: number }[]>(
        `
        SELECT COUNT(*) AS total
        FROM sessoes
        WHERE fisioterapeuta_id = ?
        AND DATE(inicio) = DATE('now')
        `,
        [fisioterapeutaId]
    );

    const pacientesAtivos = await db.select<{ total: number }[]>(
        `
        SELECT COUNT(*) AS total
        FROM pacientes
        WHERE fisioterapeuta_id = ?
        AND ativo = 1
        `,
        [fisioterapeutaId]
    );

    const pacientesComSessaoHoje = await db.select<{ total: number }[]>(
        `
        SELECT COUNT(DISTINCT paciente_id) AS total
        FROM sessoes
        WHERE fisioterapeuta_id = ?
        AND DATE(inicio) = DATE('now')
        `,
        [fisioterapeutaId]
    );

    const sessaoAtiva = await db.select<SessaoAtivaVG[]>(
        `
        SELECT 
        s.id,
        s.paciente_id,
        p.nome AS paciente_nome,
        p.diagnostico,
        s.inicio,
        s.status,

        pr.fr_min,
        pr.fr_max,
        pr.ie_inspiracao,
        pr.ie_expiracao,
        pr.pressao_min,
        pr.pressao_max

        FROM sessoes s
        JOIN pacientes p ON p.id = s.paciente_id
        LEFT JOIN prescricoes pr ON pr.id = s.prescricao_id
        WHERE s.fisioterapeuta_id = ?
        AND s.status = 'ativa'
        ORDER BY s.inicio DESC
        LIMIT 1
        `,
        [fisioterapeutaId]
    );

    return {
        sessoesHoje: sessoesHoje[0]?.total ?? 0,
        pacientesAtivos: pacientesAtivos[0]?.total ?? 0,
        pacientesComSessaoHoje: pacientesComSessaoHoje[0]?.total ?? 0,
        alertasAtivos: 0,
        sessaoAtiva: sessaoAtiva[0] ?? null,
    };
}

export async function buscarResumoClinicoPaciente(pacienteId: number): Promise<ResumoClinicoPaciente> {
    const db = await getDb();

    const total = await db.select<{ total: number }[]>(
        `
        SELECT COUNT(*) AS total
        FROM sessoes
        WHERE paciente_id = ?
        AND status = 'encerrada'
        `,
        [pacienteId]
    );

    const ultima = await db.select<{ ultima_sessao: string | null }[]>(
        `
        SELECT MAX(inicio) AS ultima_sessao
        FROM sessoes
        WHERE paciente_id = ?
        AND status = 'encerrada'
        `,
        [pacienteId]
    );

    const observacao = await db.select<{ observacao: string | null }[]>(
        `
        SELECT observacoes AS observacao
        FROM sessoes
        WHERE paciente_id = ?
        AND status = 'encerrada'
        AND observacoes IS NOT NULL
        AND TRIM(observacoes) <> ''
        ORDER BY fim DESC, inicio DESC
        LIMIT 1
        `,
        [pacienteId]
    );

        const tendencia = await db.select<{ tendencia: string | null }[]>(
        `
        SELECT 
        CASE
            WHEN score_evolucao IS NULL THEN NULL
            WHEN score_evolucao >= 70 THEN 'melhora'
            WHEN score_evolucao >= 40 THEN 'estavel'
            ELSE 'atencao'
        END AS tendencia
        FROM metricas_sessao m
        JOIN sessoes s ON s.id = m.sessao_id
        WHERE s.paciente_id = ?
        AND s.status = 'encerrada'
        ORDER BY s.fim DESC, s.inicio DESC
        LIMIT 1
        `,
        [pacienteId]
    );


    return {
        ultima_sessao: ultima[0]?.ultima_sessao ?? null,
        total_sessoes: total[0]?.total ?? 0,
        tendencia: tendencia[0]?.tendencia ?? null,
        observacao: observacao[0]?.observacao ?? null,
    };
}