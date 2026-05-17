import "../../styles/components/alerta.css";
// import { LuTriangleAlert } from "react-icons/lu";
import { FaRegCheckCircle } from "react-icons/fa";
import { AlertaSessao } from "../../database/services/alertasSessao";


type Props = {
    alertas: AlertaSessao[];
    titulo?: string;
    modo?: 'operacional' | 'resumo';
    onRegistrarAjuste?: (alerta: AlertaSessao) => void;
    onIgnorar?: (alerta: AlertaSessao) => void;
    onVerMonitor?: () => void;
};

function formatarTipoAlerta(tipo: string): string {
    const mapa: Record<string, string> = {
        fr_alta: "FR alta",
        fr_baixa: "FR baixa",
        pressao_alta: "Pressão alta",
        pressao_baixa: "Pressão baixa",
        ie_fora_faixa: "I:E fora da faixa",
        sensor_sem_leitura: "Sensor sem leitura",
        sensor_desconectado: "Sensor desconectado",
        ciclo_atipico: "Ciclo atípico",
    };

    return mapa[tipo] ?? tipo;
}

function formatarHoraSQLite(dataSQLite: string): string {
    const data = new Date(dataSQLite.replace(" ", "T") + "Z");

    return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function Alertas({
    alertas,
    titulo = "Alertas",
    modo = "operacional",
    onRegistrarAjuste,
    onIgnorar,
    onVerMonitor,
}: Props) {
    const alertasAtivos = alertas.filter((alerta) => alerta.resolvido === 0);

    if (alertasAtivos.length === 0) {
        return (
            <div className="alertas-vazio">
                <div className="alertas-icone-ok"><FaRegCheckCircle /></div>
                    
                <div>
                    <strong>Sem alertas ativos</strong>
                    <span>Tudo tranquilo por enquanto</span>
                </div>
            </div>
        )
    }

    return (
        <div className="alertas-card">
            <div className="alertas-header">
                <h3>{titulo}</h3>

                <span className="alertas-contador">
                    {alertasAtivos.length}
                </span>
            </div>

            <div className="alertas-lista">
                {alertasAtivos.map((alerta) => (
                <div
                    key={alerta.id}
                    className={`alerta-item severidade-${alerta.severidade}`}
                >
                    <div className="alerta-topo">
                    <div>
                        <strong>{formatarTipoAlerta(alerta.tipo)}</strong>
                        <span className="alerta-status ativo">Não resolvido</span>
                    </div>

                    <span className="alerta-hora">
                        {formatarHoraSQLite(alerta.criado_em)}
                    </span>
                    </div>

                    <p>{alerta.mensagem}</p>

                    {/* { {(alerta.valor_atual !== null ||
                    alerta.limite_min !== null ||
                    alerta.limite_max !== null) && (
                    <div className="alerta-detalhes">
                        {alerta.valor_atual !== null && (
                        <span>Atual: {alerta.valor_atual}</span>
                        )}

                        {(alerta.limite_min !== null ||
                        alerta.limite_max !== null) && (
                        <span>
                            Alvo: {alerta.limite_min ?? "--"}–
                            {alerta.limite_max ?? "--"}
                        </span>
                        )}
                    </div>
                    )} } */}
                    {modo === "operacional" ? (
                        <div className="alerta-acoes">
                            <button
                                type="button"
                                className="btn btn-primary-white"
                                onClick={() => onRegistrarAjuste?.(alerta)}
                            >
                                Registrar ajuste
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary-white"
                                onClick={() => onIgnorar?.(alerta)}
                            >
                                Ignorar
                            </button>
                        </div>
                    ) : (
                        <div className="alerta-acoes">
                            <button
                                type="button"
                                className="btn-secondary-white"
                                onClick={onVerMonitor}
                            >
                                Ver monitor
                            </button>
                        </div>
                    )}

                </div>
                ))}
            </div>
        </div>
    );
}

export default Alertas;