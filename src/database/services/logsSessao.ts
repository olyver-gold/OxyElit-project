import { getDb } from "../db";

export type TipoLogSessao =
  | "inicio"
  | "sensor"
  | "alerta"
  | "ajuste"
  | "observacao"
  | "encerramento"
  | "sistema";

export interface LogSessao {
  id: number;
  sessao_id: number;
  tipo: TipoLogSessao;
  mensagem: string;
  criado_em: string;
}

export async function registrarLogSessao(
  sessaoId: number,
  tipo: TipoLogSessao,
  mensagem: string
): Promise<void> {
  const db = await getDb();

  await db.execute(
    `
    INSERT INTO logs_sessao (
      sessao_id,
      tipo,
      mensagem
    )
    VALUES (?, ?, ?)
    `,
    [sessaoId, tipo, mensagem]
  );
}

export async function listarLogsSessao(
  sessaoId: number,
  limite = 10
): Promise<LogSessao[]> {
  const db = await getDb();

  return await db.select<LogSessao[]>(
    `
    SELECT *
    FROM logs_sessao
    WHERE sessao_id = ?
    ORDER BY criado_em DESC
    LIMIT ?
    `,
    [sessaoId, limite]
  );
}