import { useState } from "react";
import "../../styles/components/graficopressao.css";

type Janela = "30s" | "2min" | "5min";

interface GraficoPressaoProps {
    leituras: number[];
    altura?: number;
    janelaInicial?: Janela;
    mostrarControles?: boolean;
}

const MAX_PONTOS: Record<Janela, number> = {
    "30s": 150,     // ~5 leituras/s x 30s
    "2min": 600,
    "5min": 1500,
};

function GraficoPressao({
    leituras,
    altura = 120,
    janelaInicial = "30s",
    mostrarControles = false,
} : GraficoPressaoProps) {
    const [janela, setJanela] = useState<Janela>(janelaInicial);

    const max       = MAX_PONTOS[janela];
    const recorte   = leituras.slice(-max);
    // const WIDTH     = recorte.length > 1 ? 300 / (recorte.length - 1) : 300;
    const WIDTH     = 560;
    const HEIGHT    = altura;
    const MEIO      = HEIGHT / 2;
    const ESCALA    = (HEIGHT * 0.4);

    // normaliza os valores para o viewBox
    const valMax    = Math.max(...recorte, 1);
    const valMin    = Math.min(...recorte, -1);
    const range     = valMax - valMin || 1;

    const pontos = recorte.map((val, i) => {
        const x = (i / (recorte.length - 1)) * WIDTH;
        const y = MEIO - ((val - (valMin + range / 2)) / range) * ESCALA;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

    const areaFill = recorte.map((val, i) => {
        const x = (i / (max - 1)) * WIDTH;
        const y = MEIO - ((val - (valMin + range / 2)) / range) * ESCALA;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const areaPath = areaFill.length > 0 
        ? `M ${areaFill[0]} L ${areaFill.join(" L")} L ${WIDTH},${MEIO} L0,${MEIO} Z`
        : "";

    return (
        <div className="grafico-pressao">
            <div className="grafico-pressao-header">
                <span className="gp-titulo">Curva de pressão ao vivo</span>
                {mostrarControles && (
                    <div className="gp-janelas">
                        {(["30s", "2min", "5min"] as Janela[]).map((j) => (
                            <button
                                key={j}
                                className={`gp-janela-btn ${janela === j ? "ativo" : ""}`}
                                onClick={() => setJanela(j)}
                            >
                                {j}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <svg
                width="100%"
                height={altura}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="none"
                className="grafico-svg"
            >
                {/* faixa de referência */}
                <rect
                x="0" y={MEIO * 0.4}
                width={WIDTH} height={MEIO * 1.1}
                fill="#0062c4" opacity="0.04"
                />

                {/* grade horizontal */}
                {[0.25, 0.5, 0.75].map((f, i) => (
                <line
                    key={i}
                    x1="0" y1={HEIGHT * f}
                    x2={WIDTH} y2={HEIGHT * f}
                    stroke={f === 0.5 ? '#e2e8f0' : '#f1f5f9'}
                    strokeWidth={f === 0.5 ? '0.8' : '0.5'}
                    strokeDasharray={f === 0.5 ? '4 3' : undefined}
                />
                ))}

                {/* grade vertical */}
                {[0.25, 0.5, 0.75].map((f, i) => (
                <line
                    key={i}
                    x1={WIDTH * f} y1="0"
                    x2={WIDTH * f} y2={HEIGHT}
                    stroke="#f1f5f9" strokeWidth="0.5"
                />
                ))}

                {/* área sob a curva */}
                {areaPath && (
                <path d={areaPath} fill="#0062c4" opacity="0.07"/>
                )}

                {/* curva principal */}
                {pontos && (
                <polyline
                    points={pontos}
                    fill="none"
                    stroke="#0062c4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                )}

                {/* labels eixo X */}
                <text x="4"         y={HEIGHT - 4} fontSize="8" fill="#94a3b8">
                -{janela}
                </text>
                <text x={WIDTH - 28} y={HEIGHT - 4} fontSize="8" fill="#94a3b8">
                agora
                </text>

                {/* labels eixo Y */}
                <text x="4" y="12"         fontSize="8" fill="#94a3b8">+</text>
                <text x="4" y={MEIO + 3}   fontSize="8" fill="#94a3b8">0</text>
                <text x="4" y={HEIGHT - 4} fontSize="8" fill="#94a3b8">-</text>
            </svg>
        </div>
    );
}

export default GraficoPressao;    