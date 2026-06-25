import "../../../styles/fisioterapeuta/modalposSessao.css"
import { FormEvent, useEffect, useState } from "react";
import { MetricasRespiratorias } from "../../../services/processarMetRespiratorias";

export interface DadosAvaliacaoFinal {
  spo2Inicial: number;
  spo2Final: number;

  borgInicial: number;
  borgFinal: number;

  fcFinal: number;
  fcRecuperacao: number;
}

type Props = {
  aberto: boolean;
  metricas: MetricasRespiratorias;
  salvando?: boolean;
  onFechar: () => void;
  onConfirmar: (dados: DadosAvaliacaoFinal) => Promise<void>;
};

type CamposFormulario = {
  spo2Inicial: string;
  spo2Final: string;
  borgInicial: string;
  borgFinal: string;
  fcFinal: string;
  fcRecuperacao: string;
};

const CAMPOS_INICIAIS: CamposFormulario = {
  spo2Inicial: "",
  spo2Final: "",
  borgInicial: "",
  borgFinal: "",
  fcFinal: "",
  fcRecuperacao: "",
};

function ModalPosSessao({ aberto, metricas, salvando = false, onFechar, onConfirmar }: Props) {
  const [campos, setCampos] = useState<CamposFormulario>(CAMPOS_INICIAIS);
  const [erro, setErro] = useState("");

    useEffect(() => {
        if (aberto) {
            setCampos(CAMPOS_INICIAIS);
            setErro("");
        }
    }, [aberto]);

    if (!aberto) return null;

    function alterarCampo(
        campo: keyof CamposFormulario,
        valor: string
    ) {
        setCampos((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));
    }

    async function confirmarEncerramento(event: FormEvent) {
        event.preventDefault();
        setErro("");
        
        if (
            !campos.spo2Inicial ||
            !campos.spo2Final ||
            !campos.borgInicial ||
            !campos.borgFinal ||
            !campos.fcFinal ||
            !campos.fcRecuperacao
        ) {
            setErro("Preencha todos os dados clínicos obrigatórios.");
            return;
        }

        const dados: DadosAvaliacaoFinal = {
            spo2Inicial: Number(campos.spo2Inicial),
            spo2Final: Number(campos.spo2Final),
            borgInicial: Number(campos.borgInicial),
            borgFinal: Number(campos.borgFinal),
            fcFinal: Number(campos.fcFinal),
            fcRecuperacao: Number(campos.fcRecuperacao),
        };

        if (
            dados.spo2Inicial < 50 ||
            dados.spo2Inicial > 100 ||
            dados.spo2Final < 50 ||
            dados.spo2Final > 100
        ) {
            setErro("A SpO₂ deve estar entre 50% e 100%.");
            return;
        }

        if (
            dados.borgInicial < 0 ||
            dados.borgInicial > 10 ||
            dados.borgFinal < 0 ||
            dados.borgFinal > 10
        ) {
            setErro("A escala de Borg deve estar entre 0 e 10.");
            return;
        }

        if (
            dados.fcFinal < 30 ||
            dados.fcFinal > 220 ||
            dados.fcRecuperacao < 30 ||
            dados.fcRecuperacao > 220
        ) {
            setErro("Informe frequências cardíacas válidas.");
            return;
        }

        await onConfirmar(dados);
    }

    return (
        <div className="modal-overlay">
            <div
                className="modal md"
                onSubmit={confirmarEncerramento}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Sessão encerrada com sucesso!</h2>
                </div>

                <div className="modal-body">
                    <h3>Confirme as métricas calculadas e informe os dados clínicos complementares.</h3>

                    <div className="metricas-calculadas-grid">
                        <div>
                            <span>FR média</span>
                            <strong>
                                {metricas.frMedia !== null
                                ? `${metricas.frMedia.toFixed(1)} rpm`
                                : "—"}
                            </strong>
                        </div>
                        <div>
                            <span>Estabilidade FR</span>
                            <strong>
                                {metricas.frDesvioPadrao !== null
                                ? `DP ${metricas.frDesvioPadrao.toFixed(2)}`
                                : "—"}
                            </strong>
                        </div>
                        <div>
                            <span>Razão I:E</span>
                            <strong>
                                {metricas.ieMedia !== null
                                ? `1:${(1 / metricas.ieMedia).toFixed(1)}`
                                : "—"}
                            </strong>
                        </div>
                        <div>
                            <span>Pressão média</span>
                            <strong>
                                {metricas.pressaoMedia !== null
                                ? `${metricas.pressaoMedia.toFixed(2)} cmH₂O`
                                : "—"}
                            </strong>
                        </div>
                    </div>

                    <h3>Avaliação clínica complementar</h3>

                    <div className="avaliacao-grid">
                        <label>
                        <span>SpO₂ inicial (%)</span>
                        <input
                            type="number"
                            min="50"
                            max="100"
                            value={campos.spo2Inicial}
                            onChange={(event) =>
                            alterarCampo("spo2Inicial", event.target.value)
                            }
                        />
                        </label>
                        <label>
                        <span>SpO₂ final (%)</span>
                        <input
                            type="number"
                            min="50"
                            max="100"
                            value={campos.spo2Final}
                            onChange={(event) =>
                            alterarCampo("spo2Final", event.target.value)
                            }
                        />
                        </label>
                        <label>
                        <span>Borg inicial</span>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={campos.borgInicial}
                            onChange={(event) =>
                            alterarCampo("borgInicial", event.target.value)
                            }
                        />
                        </label>
                        <label>
                        <span>Borg final</span>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={campos.borgFinal}
                            onChange={(event) =>
                            alterarCampo("borgFinal", event.target.value)
                            }
                        />
                        </label>
                        <label>
                        <span>FC final (bpm)</span>
                        <input
                            type="number"
                            min="30"
                            max="220"
                            value={campos.fcFinal}
                            onChange={(event) =>
                            alterarCampo("fcFinal", event.target.value)
                            }
                        />
                        </label>
                        <label>
                        <span>FC após 1 min (bpm)</span>
                        <input
                            type="number"
                            min="30"
                            max="220"
                            value={campos.fcRecuperacao}
                            onChange={(event) =>
                            alterarCampo("fcRecuperacao", event.target.value)
                            }
                        />
                        </label>
                    </div>
                </div>

                {erro && <p className="modal-erro">{erro}</p>}

                <div className="modal-footer">
                    <button
                        className="btn btn-secondary"
                        onClick={onFechar}
                        disabled={salvando}
                    >
                        Fechar
                    </button>

                    <button
                        onClick={confirmarEncerramento}
                        className="btn btn-primary"
                        disabled={salvando}
                    >
                        {salvando ? "Salvando..." : "Salvar e encerrar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
export default ModalPosSessao;