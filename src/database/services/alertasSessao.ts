import { getDb } from "../db";

export type TipoAlertaSessao =
  | "fr_alta"
  | "fr_baixa"
  | "pressao_alta"
  | "pressao_baixa"
  | "ie_fora_faixa"
  | "sensor_sem_leitura"
  | "sensor_desconectado"
  | "ciclo_atipico";

export type SeveridadeAlerta = "baixa" | "media" | "alta";

export interface AlertaSessao {
  id: number;
  sessao_id: number;
  tipo: TipoAlertaSessao;
  severidade: SeveridadeAlerta;
  mensagem: string;
  valor_atual: number | null;
  limite_min: number | null;
  limite_max: number | null;
  resolvido: number;
  criado_em: string;
  resolvido_em: string | null;
}

export async function criarAlertaSessao(params: {
  sessaoId: number;
  tipo: TipoAlertaSessao;
  severidade: SeveridadeAlerta;
  mensagem: string;
  valorAtual?: number;
  limiteMin?: number | null;
  limiteMax?: number | null;
}): Promise<void> {
  const db = await getDb();

  await db.execute(
    `
    INSERT INTO alertas_sessao (
      sessao_id,
      tipo,
      severidade,
      mensagem,
      valor_atual,
      limite_min,
      limite_max
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      params.sessaoId,
      params.tipo,
      params.severidade,
      params.mensagem,
      params.valorAtual ?? null,
      params.limiteMin ?? null,
      params.limiteMax ?? null,
    ]
  );
}

export async function listarAlertasSessao(
  sessaoId: number
): Promise<AlertaSessao[]> {
  const db = await getDb();

  return await db.select<AlertaSessao[]>(
    `
    SELECT *
    FROM alertas_sessao
    WHERE sessao_id = ?
    ORDER BY resolvido ASC, criado_em DESC
    `,
    [sessaoId]
  );
}

export async function listarAlertasNaoResolvidosSessao(
  sessaoId: number
): Promise<AlertaSessao[]> {
  const db = await getDb();

  return await db.select<AlertaSessao[]>(
    `
    SELECT *
    FROM alertas_sessao
    WHERE sessao_id = ?
      AND resolvido = 0
    ORDER BY criado_em DESC
    `,
    [sessaoId]
  );
}

export async function contarAlertasNaoResolvidosSessao(
  sessaoId: number
): Promise<number> {
  const db = await getDb();

  const resultado = await db.select<{ total: number }[]>(
    `
    SELECT COUNT(*) AS total
    FROM alertas_sessao
    WHERE sessao_id = ?
      AND resolvido = 0
    `,
    [sessaoId]
  );

  return resultado[0]?.total ?? 0;
}

export async function buscarAlertaNaoResolvidoPorTipo(
  sessaoId: number,
  tipo: TipoAlertaSessao
): Promise<AlertaSessao | null> {
  const db = await getDb();

  const resultado = await db.select<AlertaSessao[]>(
    `
    SELECT *
    FROM alertas_sessao
    WHERE sessao_id = ?
      AND tipo = ?
      AND resolvido = 0
    ORDER BY criado_em DESC
    LIMIT 1
    `,
    [sessaoId, tipo]
  );

  return resultado[0] ?? null;
}

export async function resolverAlertaSessao(alertaId: number): Promise<void> {
  const db = await getDb();

  await db.execute(
    `
    UPDATE alertas_sessao
    SET
      resolvido = 1,
      resolvido_em = datetime('now')
    WHERE id = ?
    `,
    [alertaId]
  );
}

export async function ignorarAlertaSessao(alertaId: number): Promise<void> {
  const db = await getDb();

  await db.execute(
    `
    UPDATE alertas_sessao
    SET
      resolvido = 1,
      resolvido_em = datetime('now')
    WHERE id = ?
    `,
    [alertaId]
  );
}