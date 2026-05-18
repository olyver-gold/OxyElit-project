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

type CicloRespiratorio = {
    inicio: number;
    pico: number;
    fim: number;
    pressaoPico: number;
    duracao: number;
};

export function processarMetricasRespiratorias( leituras: LeituraSensor[] ): MetricasRespiratorias {
    if (leituras.length < 5) {
        return criarMetricasVazias();
    }

    const leiturasOrdenadas = [...leituras].sort(
        (a, b) => a.timestamp - b.timestamp
    );

    const pressoes = leiturasOrdenadas.map((l) => l.pressao);

    const pressaoMedia = calcularMedia(pressoes);
    const pressaoDesvioPadrao = calcularDesvioPadrao(pressoes);

    const ciclos = detectarCiclos(leiturasOrdenadas);

    const totalCiclos = ciclos.length;

    if (totalCiclos < 2) {
        return {
        ...criarMetricasVazias(),
        pressaoMedia,
        pressaoDesvioPadrao,
        totalCiclos,
        ciclosAtipicos: 0,
        };
    }

    const duracoesCiclosSegundos = ciclos.map((ciclo) => ciclo.duracao / 1000);

    const frPorCiclo = duracoesCiclosSegundos
        .filter((duracao) => duracao > 0)
        .map((duracao) => 60 / duracao);

    const frMedia = calcularMedia(frPorCiclo);
    const frDesvioPadrao = calcularDesvioPadrao(frPorCiclo);

    const frAtual =
        frPorCiclo.length > 0 ? frPorCiclo[frPorCiclo.length - 1] : null;

    const ciclosAtipicos = ciclos.filter((ciclo) => {
        const duracaoSegundos = ciclo.duracao / 1000;

        return duracaoSegundos < 1.5 || duracaoSegundos > 8;
    }).length;

    return {
        frAtual: arredondar(frAtual),
        frMedia: arredondar(frMedia),
        frDesvioPadrao: arredondar(frDesvioPadrao),

        // Esta primeira versão ainda não calcula Ti/Te de forma robusta.
        // Vamos preencher depois com detecção de fase inspiratória/expiratória.
        ieMedia: null,
        tiMedio: null,
        teMedio: null,

        pressaoMedia: arredondar(pressaoMedia),
        pressaoDesvioPadrao: arredondar(pressaoDesvioPadrao),

        totalCiclos,
        ciclosAtipicos,
    };
}

function detectarCiclos(leituras: LeituraSensor[]): CicloRespiratorio[] {
    const ciclos: CicloRespiratorio[] = [];

    if (leituras.length < 5) return ciclos;

    const pressoes = leituras.map((l) => l.pressao);

    const pressaoMedia = calcularMedia(pressoes) ?? 0;
    const pressaoMax = Math.max(...pressoes);

    const limiarPico = pressaoMedia + (pressaoMax - pressaoMedia) * 0.45;

    let ultimoPicoTimestamp = 0;

    for (let i = 1; i < leituras.length - 1; i++) {
        const anterior = leituras[i - 1];
        const atual = leituras[i];
        const proxima = leituras[i + 1];

        const ehPico =
        atual.pressao > anterior.pressao &&
        atual.pressao >= proxima.pressao &&
        atual.pressao >= limiarPico;

        if (!ehPico) continue;

        const distanciaMinimaEntrePicosMs = 1500;

        if (atual.timestamp - ultimoPicoTimestamp < distanciaMinimaEntrePicosMs) {
            continue;
        }

        ultimoPicoTimestamp = atual.timestamp;

        const pico = atual.timestamp;

        const inicio = buscarInicioCiclo(leituras, i, pressaoMedia);
        const fim = buscarFimCiclo(leituras, i, pressaoMedia);

        ciclos.push({
            inicio,
            pico,
            fim,
            pressaoPico: atual.pressao,
            duracao: fim - inicio,
        });
    }

    return ciclos.filter((ciclo) => ciclo.duracao > 0);
}

function buscarInicioCiclo( leituras: LeituraSensor[], indicePico: number, linhaBase: number ): number {
    for (let i = indicePico; i >= 0; i--) {
        if (leituras[i].pressao <= linhaBase) {
        return leituras[i].timestamp;
        }
    }

    return leituras[Math.max(0, indicePico - 1)].timestamp;
}

function buscarFimCiclo( leituras: LeituraSensor[], indicePico: number, linhaBase: number ): number {
    for (let i = indicePico; i < leituras.length; i++) {
        if (leituras[i].pressao <= linhaBase) {
        return leituras[i].timestamp;
        }
    }

    return leituras[Math.min(leituras.length - 1, indicePico + 1)].timestamp;
    }

function calcularMedia(valores: number[]): number | null {
    if (valores.length === 0) return null;

    const soma = valores.reduce((total, valor) => total + valor, 0);

    return soma / valores.length;
    }

function calcularDesvioPadrao(valores: number[]): number | null {
    if (valores.length < 2) return null;

    const media = calcularMedia(valores);

    if (media === null) return null;

    const variancia =
        valores.reduce((total, valor) => total + Math.pow(valor - media, 2), 0) /
        valores.length;

    return Math.sqrt(variancia);
}

function arredondar(valor: number | null): number | null {
    if (valor === null || !Number.isFinite(valor)) return null;

    return Number(valor.toFixed(2));
}

function criarMetricasVazias(): MetricasRespiratorias {
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