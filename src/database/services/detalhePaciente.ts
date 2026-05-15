import { getDb } from "../db";

export interface DetalhesPacienteDados {
  id: number;
  nome: string;
  data_nascimento: string | null;
  genero: "masculino" | "feminino" | "outro" | null;
  diagnostico: string | null;
  ativo: number;

  ultima_sessao: string | null;
  total_sessoes: number;
  sessao_ativa_inicio: string | null;
  ultima_observacao: string | null;
}

export async function buscarDetalhesPaciente(
  pacienteId: number
): Promise<DetalhesPacienteDados | null> {
  const db = await getDb();

  const resultado = await db.select<DetalhesPacienteDados[]>(
    `
    SELECT
      p.id,
      p.nome,
      p.data_nascimento,
      p.genero,
      p.diagnostico,
      p.ativo,

      (
        SELECT MAX(s.inicio)
        FROM sessoes s
        WHERE s.paciente_id = p.id
          AND s.status = 'encerrada'
      ) AS ultima_sessao,

      (
        SELECT COUNT(*)
        FROM sessoes s
        WHERE s.paciente_id = p.id
          AND s.status = 'encerrada'
      ) AS total_sessoes,

      (
        SELECT s.inicio
        FROM sessoes s
        WHERE s.paciente_id = p.id
          AND s.status = 'ativa'
        ORDER BY s.inicio DESC
        LIMIT 1
      ) AS sessao_ativa_inicio,

      (
        SELECT s.observacoes
        FROM sessoes s
        WHERE s.paciente_id = p.id
          AND s.status = 'encerrada'
          AND s.observacoes IS NOT NULL
          AND TRIM(s.observacoes) <> ''
        ORDER BY s.fim DESC, s.inicio DESC
        LIMIT 1
      ) AS ultima_observacao

    FROM pacientes p
    WHERE p.id = ?
    LIMIT 1;
    `,
    [pacienteId]
  );

  return resultado[0] ?? null;
}