import { getDb } from "../db";

export interface ParametrosAlvoSessao {
    paciente_id: number;
    fr_min?: number;
    fr_max?: number;
    ie_inspiracao?: number;
    ie_expiracao?: number;
    pressao_min?: number;
    pressao_max?: number;
    observacoes?: string;
    criado_por: number;
}

export async function criarParametrosAlvoSessao(parametros: ParametrosAlvoSessao): Promise<number> {
    const db = await getDb();

    await db.execute(
        `
        INSERT INTO prescricoes (
            paciente_id, fr_min, fr_max, ie_inspiracao, ie_expiracao, pressao_min, pressao_max, observacoes, criado_por, ativa
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1);
        `,
        [
            parametros.paciente_id,
            parametros.fr_min || null,
            parametros.fr_max || null,
            parametros.ie_inspiracao || null,
            parametros.ie_expiracao || null,
            parametros.pressao_min || null,
            parametros.pressao_max || null,
            parametros.observacoes || null,
            parametros.criado_por
        ]
    );
    
    const resultado = await db.select<{ id: number }[]>(
        `
        SELECT id
        FROM prescricoes
        WHERE paciente_id = ?
        AND criado_por = ?
        ORDER BY id DESC
        LIMIT 1
        `,
        [parametros.paciente_id, parametros.criado_por]
    );

    const id = resultado[0]?.id;

    if (!id || id <= 0) {
        throw new Error("Parâmetros foram salvos, mas o ID da prescrição não foi recuperado.");
    }

    return id;
}