import { getDb } from "../db";

export async function registrarAjusteValvula(params: {
  sessaoId: number;
  usuarioId: number;
  observacao: string;
}): Promise<void> {
  const db = await getDb();

  await db.execute(
    `
    INSERT INTO ajustes_valvula (
      sessao_id,
      usuario_id,
      observacao
    )
    VALUES (?, ?, ?)
    `,
    [
      params.sessaoId,
      params.usuarioId,
      params.observacao.trim(),
    ]
  );
}