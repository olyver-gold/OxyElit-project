import { getDb } from "../db";
import { MetricasRespiratorias } from "../../services/processarMetRespiratorias";

export async function salvarMetricasSessao(params: {
  sessaoId: number;
  metricas: MetricasRespiratorias;
  scoreEvolucao: number | null;
  origemDados?: "sensor" | "mqtt_simulado";
}): Promise<void> {
  const db = await getDb();

  await db.execute(
    `
    INSERT INTO metricas_sessao (
      sessao_id,
      fr_media,
      fr_desvio_padrao,
      ie_media,
      ti_medio,
      te_medio,
      pressao_media,
      pressao_desvio_padrao,
      total_ciclos,
      ciclos_atipicos,
      score_evolucao,
      origem_dados
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(sessao_id) DO UPDATE SET
      fr_media = excluded.fr_media,
      fr_desvio_padrao = excluded.fr_desvio_padrao,
      ie_media = excluded.ie_media,
      ti_medio = excluded.ti_medio,
      te_medio = excluded.te_medio,
      pressao_media = excluded.pressao_media,
      pressao_desvio_padrao = excluded.pressao_desvio_padrao,
      total_ciclos = excluded.total_ciclos,
      ciclos_atipicos = excluded.ciclos_atipicos,
      score_evolucao = excluded.score_evolucao,
      origem_dados = excluded.origem_dados,
      calculado_em = datetime('now')
    `,
    [
      params.sessaoId,
      params.metricas.frMedia,
      params.metricas.frDesvioPadrao,
      params.metricas.ieMedia,
      params.metricas.tiMedio,
      params.metricas.teMedio,
      params.metricas.pressaoMedia,
      params.metricas.pressaoDesvioPadrao,
      params.metricas.totalCiclos,
      params.metricas.ciclosAtipicos,
      params.scoreEvolucao,
      params.origemDados ?? "mqtt_simulado",
    ]
  );
}