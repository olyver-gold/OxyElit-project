import {
  buscarAlertaNaoResolvidoPorTipo,
  criarAlertaSessao,
  resolverAlertaSessao,
} from "../database/services/alertasSessao";
import { registrarLogSessao } from "../database/services/logsSessao";

type SessaoComParametros = {
  id: number;
  fr_min: number | null;
  fr_max: number | null;
  pressao_min: number | null;
  pressao_max: number | null;
};

type MetricasAtuais = {
  frAtual?: number | null;
  pressaoMedia?: number | null;
};

export async function avaliarAlertasSessao(
  sessao: SessaoComParametros,
  metricas: MetricasAtuais
): Promise<void> {
  const frAtual = metricas.frAtual ?? null;

  if (frAtual !== null && sessao.fr_max !== null && frAtual > sessao.fr_max) {
    const existente = await buscarAlertaNaoResolvidoPorTipo(
      sessao.id,
      "fr_alta"
    );

    if (!existente) {
      await criarAlertaSessao({
        sessaoId: sessao.id,
        tipo: "fr_alta",
        severidade: "media",
        mensagem: `FR acima da faixa alvo (${frAtual} rpm).`,
        valorAtual: frAtual,
        limiteMin: sessao.fr_min,
        limiteMax: sessao.fr_max,
      });

      await registrarLogSessao(
        sessao.id,
        "alerta",
        `FR acima da faixa alvo (${frAtual} rpm).`
      );
    }
  }

  if (frAtual !== null && sessao.fr_max !== null && frAtual <= sessao.fr_max) {
    const alerta = await buscarAlertaNaoResolvidoPorTipo(
      sessao.id,
      "fr_alta"
    );

    if (alerta) {
      await resolverAlertaSessao(alerta.id);

      await registrarLogSessao(
        sessao.id,
        "alerta",
        "FR normalizada."
      );
    }
  }
}