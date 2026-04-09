import { useState } from "react";
import AlertasModal from "./modal/AlertasModal";

function VisaoGeral({ onNavegar}: { onNavegar: (pagina: string) => void}) {
    const [modalAberto, setModalAberto] = useState(false);

    return(
        <div className="visao-geral">
            <div className="metric-cards-row">
                <div className="metric-card">
                    <span className="mc-title">Pacientes monitorados</span>
                    <span className="mc-value">4</span>
                    <span className="mc-sub ok">2 estáveis</span>
                </div>
                <div className="metric-card">
                    <span className="mc-title">Alertas ativos</span>
                    <span className="mc-value warn">2</span>
                    <span className="mc-sub warn">Requerem atenção</span>
                </div>
                <div className="metric-card">
                    <span className="mc-title">Relatórios enviados hoje</span>
                    <span className="mc-value">1</span>
                    <span className="mc-sub muted">último há 1h</span>
                </div>
            </div>

            <div className="info-cards-row">
                <div className="card">
                    <h1>Monitoramento ativo</h1>
                    <p className="desc">Em ordem de nível de emergência</p>
                    <div className="card-body">
                        <div className="paciente-row">
                            <div>
                                <p className="paciente-nome">Paciente B</p>
                                <p className="paciente-info">Alerta de equipamento · 6L/min</p>
                            </div>
                            <span className="tag t-danger">Crítico</span>
                        </div>
                        <div className="paciente-row">
                            <div>
                                <p className="paciente-nome">Paciente C</p>
                                <p className="paciente-info">Alerta de fluxo · 2L/min</p>
                            </div>
                            <span className="tag t-warn">Atenção</span>
                        </div>
                        <div className="paciente-row">
                            <div>
                                <p className="paciente-nome">Paciente A</p>
                                <p className="paciente-info">Sem alertas · 2L/min</p>
                            </div>
                            <span className="tag t-ok">Estável</span>
                        </div>
                        <div className="paciente-row">
                            <div>
                                <p className="paciente-nome">Paciente D</p>
                                <p className="paciente-info">Sem alertas · 1L/min</p>
                            </div>
                            <span className="tag t-ok">Estável</span>
                        </div>
                    </div>
                    <button
                        className="ver-todos"
                        onClick={() => onNavegar("Monitoramento")}
                    >
                        Ver todas →
                    </button>
                </div>

                <div className="card">
                    <h1>Alertas recentes</h1>
                    <div className="card-body">
                        <div className="alertas-row">
                            <span className="alerta a-danger"></span>
                            <div>
                                <p className="alerta-texto">Paciente B - Pressão próxima de zero, verificar urgentemente!</p>
                                <p className="alerta-tempo">Há 10min</p>
                            </div>
                        </div>
                        <div className="alertas-row">
                            <span className="alerta a-warn"></span>
                            <div>
                                <p className="alerta-texto">Paciente C - Esforço respiratório recorrente.</p>
                                <p className="alerta-tempo">Há 30min</p>
                            </div>
                        </div>
                    </div>
                    <button
                        className="ver-todos"
                        onClick={() => setModalAberto(true)}
                    >
                        Ver todas →
                    </button>
                </div>
                {/* modal de notificacoes */}
                {modalAberto && (
                    <AlertasModal
                        onFechar={() => setModalAberto(false)}
                    />
                )}
            </div>
        </div>


    )
}

export default VisaoGeral;