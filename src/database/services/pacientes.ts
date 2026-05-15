import { getDb } from "../db";

export type Genero = 'masculino' | 'feminino' | 'outro';

export interface Paciente {
    id: number;
    nome: string;
    data_nascimento: string;
    genero: Genero;
    diagnostico: string | null;
    fisioterapeuta_id: number;
    ativo: number;
    criado_em: string;
    ultima_sessao: string | null;
}

export interface NovoPaciente {
    nome: string;
    data_nascimento: string;
    genero?: Genero;
    diagnostico?: string;
    fisioterapeuta_id: number;
}

export async function listarPacientesPorFisioterapeuta(fisioterapeuta_id: number): Promise<Paciente[]> {
    const db = await getDb();

    return await db.select<Paciente[]>(`
        SELECT
            p.id,
            p.nome,
            p.data_nascimento,
            p.genero,
            p.diagnostico,
            p.fisioterapeuta_id,
            p.ativo,
            p.criado_em,
            MAX(s.inicio) AS ultima_sessao
        FROM pacientes p
        LEFT JOIN sessoes s ON s.paciente_id = p.id
        AND s.status = 'encerrada'
        WHERE p.ativo = 1
        AND p.fisioterapeuta_id = ?
        GROUP BY p.id
        ORDER BY p.nome ASC
    `, [fisioterapeuta_id]);
}

export async function criarPaciente(paciente: NovoPaciente): Promise<void> {
    const db = await getDb();

    await db.execute(
        `
        INSERT INTO pacientes (nome, data_nascimento, genero, diagnostico, fisioterapeuta_id)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            paciente.nome,
            paciente.data_nascimento,
            paciente.genero,
            paciente.diagnostico || null,
            paciente.fisioterapeuta_id
        ]
    );
}

export async function desativarPaciente(id: number): Promise<void> {
    const db = await getDb();

    await db.execute(
        `
        UPDATE pacientes
        SET ativo = 0
        WHERE id = ?
        `,
        [id]
    );
}