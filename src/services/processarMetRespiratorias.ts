import { LeituraSensor } from "./sensor/types";

export interface MetricasRespiratorias {
    frAtual: number | null;
    frMedia: number | null;
    frDesvioPadrao: number | null;

    ieMedia: number | null;
    tiMedio: number | null;
    teMedio: number | null;

    pressaoMedia: number | null;
    pressaoDesvioPadrao: number | null;

    totalCiclos: number;
    ciclosAtipicos: number;
}

interface InspiracaoDetectada {
    inicio: number;
    fim: number;
    pico: number;
}

const LIMIAR_MINIMO_INSPIRACAO = 0.25;
const DURACAO_MINIMA_INSPIRACAO_MS = 250;
const DURACAO_MINIMA_CICLO_MS = 1200;
const DURACAO_MAXIMA_CICLO_MS = 12000;

export function processarMetricasRespiratorias(leituras: LeituraSensor[]): MetricasRespiratorias {
    if (leituras.length < 10) {
        return metricasVazias();
    }

    const ordenadas = [...leituras].sort(
        (a, b) => a.timestamp - b.timestamp
    );

    const suavizadas = aplicarMediaMovel(ordenadas, 3);
    const pressoes = suavizadas.map((leitura) => leitura.pressao);

    const pressaoMedia = media(pressoes);
    const pressaoDesvioPadrao = desvioPadrao(pressoes);

    const maxPressao = Math.max(...pressoes);

    const limiarInspiracao = Math.max(
        LIMIAR_MINIMO_INSPIRACAO,
        maxPressao * 0.20
    );

    const inspiracoes = detectarInspiracoes(
        suavizadas,
        limiarInspiracao
    );

    if (inspiracoes.length < 2) {
        return {
        ...metricasVazias(),
        pressaoMedia: arredondar(pressaoMedia),
        pressaoDesvioPadrao: arredondar(pressaoDesvioPadrao),
        totalCiclos: inspiracoes.length,
        };
    }

    const frequencias: number[] = [];
    const temposInspiratorios: number[] = [];
    const temposExpiratorios: number[] = [];
    const razoesIE: number[] = [];

    let ciclosAtipicos = 0;

    for (let i = 0; i < inspiracoes.length - 1; i++) {
        const atual = inspiracoes[i];
        const proxima = inspiracoes[i + 1];

        const duracaoCicloMs = proxima.inicio - atual.inicio;

        if (
        duracaoCicloMs < DURACAO_MINIMA_CICLO_MS ||
        duracaoCicloMs > DURACAO_MAXIMA_CICLO_MS
        ) {
        ciclosAtipicos++;
        continue;
        }

        const tiSegundos = (atual.fim - atual.inicio) / 1000;
        const teSegundos = (proxima.inicio - atual.fim) / 1000;

        if (tiSegundos <= 0 || teSegundos <= 0) {
        ciclosAtipicos++;
        continue;
        }

        const fr = 60000 / duracaoCicloMs;
        const ie = tiSegundos / teSegundos;

        frequencias.push(fr);
        temposInspiratorios.push(tiSegundos);
        temposExpiratorios.push(teSegundos);
        razoesIE.push(ie);

        if (fr < 6 || fr > 35) {
        ciclosAtipicos++;
        }
    }

    if (frequencias.length === 0) {
        return {
        ...metricasVazias(),
        pressaoMedia: arredondar(pressaoMedia),
        pressaoDesvioPadrao: arredondar(pressaoDesvioPadrao),
        totalCiclos: inspiracoes.length,
        ciclosAtipicos,
        };
    }

    return {
        frAtual: arredondar(frequencias[frequencias.length - 1]),
        frMedia: arredondar(media(frequencias)),
        frDesvioPadrao: arredondar(desvioPadrao(frequencias)),

        ieMedia: arredondar(media(razoesIE)),
        tiMedio: arredondar(media(temposInspiratorios)),
        teMedio: arredondar(media(temposExpiratorios)),

        pressaoMedia: arredondar(pressaoMedia),
        pressaoDesvioPadrao: arredondar(pressaoDesvioPadrao),

        totalCiclos: frequencias.length,
        ciclosAtipicos,
    };
}

function detectarInspiracoes(leituras: LeituraSensor[], limiar: number): InspiracaoDetectada[] {
    const inspiracoes: InspiracaoDetectada[] = [];

    let emInspiracao = false;
    let inicio = 0;
    let pico = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < leituras.length; i++) {
        const leitura = leituras[i];

        if (!emInspiracao && leitura.pressao >= limiar) {
        emInspiracao = true;
        inicio = leitura.timestamp;
        pico = leitura.pressao;
        continue;
        }

        if (emInspiracao) {
        pico = Math.max(pico, leitura.pressao);

        if (leitura.pressao < limiar) {
            const fim = leitura.timestamp;
            const duracao = fim - inicio;

            if (duracao >= DURACAO_MINIMA_INSPIRACAO_MS) {
            inspiracoes.push({
                inicio,
                fim,
                pico,
            });
            }

            emInspiracao = false;
        }
        }
    }

    return inspiracoes;
}

function aplicarMediaMovel(leituras: LeituraSensor[], tamanhoJanela: number): LeituraSensor[] {
    return leituras.map((leitura, indice) => {
        const inicio = Math.max(0, indice - tamanhoJanela + 1);
        const janela = leituras.slice(inicio, indice + 1);

        const pressaoMedia =
        janela.reduce((soma, item) => soma + item.pressao, 0) /
        janela.length;

        return {
        ...leitura,
        pressao: pressaoMedia,
        };
    });
}

function media(valores: number[]): number | null {
    if (valores.length === 0) return null;

    return valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
}

function desvioPadrao(valores: number[]): number | null {
    if (valores.length < 2) return null;

    const valorMedio = media(valores);

    if (valorMedio === null) return null;

    const variancia =
        valores.reduce(
        (soma, valor) => soma + Math.pow(valor - valorMedio, 2),
        0
        ) / valores.length;

    return Math.sqrt(variancia);
}

function arredondar(valor: number | null): number | null {
    if (valor === null || !Number.isFinite(valor)) return null;

    return Number(valor.toFixed(2));
}

function metricasVazias(): MetricasRespiratorias {
    return {
        frAtual: null,
        frMedia: null,
        frDesvioPadrao: null,

        ieMedia: null,
        tiMedio: null,
        teMedio: null,

        pressaoMedia: null,
        pressaoDesvioPadrao: null,

        totalCiclos: 0,
        ciclosAtipicos: 0,
    };
}