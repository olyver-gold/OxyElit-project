import { useState } from "react";
import "../../styles/VisaoGeral.css";
import NotificacoesModal from "./modal/Notificacoes";


function VisaoGeral({ onNavegar}: { onNavegar: (pagina: string) => void}) {
    const [modalAberto, setModalAberto] = useState(false);

    return (
        <div className="visao-geral">
            {/* CARDS DE INFORMAÇÕES BÁSICAS INICIAIS */}
            <div className="metric-cards-row">
                <div className="metric-card">
                    <span className="mc-title">Pacientes ativos</span>
                    <span className="mc-value">3</span>
                    <span className="mc-sub warn">1 com prescrição expirada</span>
                </div>
                <div className="metric-card">
                    <span className="mc-title">Prescrições a revisar</span>
                    <span className="mc-value warn">2</span>
                    <span className="mc-sub warn">requerem atualização</span>
                </div>
                <div className="metric-card">
                    <span className="mc-title">Relatórios recebidos</span>
                    <span className="mc-value">5</span>
                    <span className="mc-sub muted">1 não lido(s)</span>
                </div>
            </div>

            {/* CARDS DE INFORMAÇÕES ADICIONAIS ABAIXO ESTILO "TABELA" */}
            <div className="info-cards-row">
                {/* pacientes */}
                <div className="card">
                    <h1>Pacientes e prescrições</h1>
                    <div className="card-body">
                        <div className="paciente-row">
                            <div>
                                <p className="paciente-nome">Paciente A</p>
                                <p className="paciente-info">Prescrição ativa · válida até 10/04</p>
                            </div>
                            <span className="tag t-ok">Em dia</span>
                        </div>
                        <div className="paciente-row">
                            <div>
                                <p className="paciente-nome">Paciente B</p>
                                <p className="paciente-info">Prescrição vence em 2 dias</p>
                            </div>
                            <span className="tag t-warn">Renovar</span>
                        </div>
                        <div className="paciente-row">
                            <div>
                                <p className="paciente-nome">Paciente C</p>
                                <p className="paciente-info">Prescrição expirada · sem cobertura</p>
                            </div>
                            <span className="tag t-danger">Expirada</span>
                        </div>
                        <div className="paciente-row">
                            <div>
                                <p className="paciente-nome">Paciente D</p>
                                <p className="paciente-info">Prescrição ativa · válida até 15/04</p>
                            </div>
                            <span className="tag t-ok">Em dia</span>
                        </div>
                        
                    </div>
                    <button 
                        className="ver-todos"
                        onClick={() => onNavegar("Pacientes")}
                    >
                        Ver todos →
                    </button>
                </div>

                {/* notificações */}
                <div className="card">
                    <h1>Notificações</h1>
                    <div className="card-body">
                        <div className="alertas-row">
                            <span className="alerta a-danger"></span>
                            <div>
                                <p className="alerta-texto">Paciente C - Prescrição expirada</p>
                                <p className="alerta-tempo">Há 1h</p>
                            </div>
                        </div>
                        <div className="alertas-row">
                            <span className="alerta a-ok"></span>
                            <div>
                                <p className="alerta-texto">Relatório de Paciente A recebido</p>
                                <p className="alerta-tempo">Hoje, 08:15</p>
                            </div>
                        </div>
                        <div className="alertas-row">
                            <span className="alerta a-warn"></span>
                            <div>
                                <p className="alerta-texto">Paciente B - Prescrição vence em 2 dias</p>
                                <p className="alerta-tempo">Hoje, 07:51</p>
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
                    <NotificacoesModal
                        onFechar={() => setModalAberto(false)}
                        onNavegar={onNavegar}
                    />
                )}
            </div>
        </div>
    );
}

export default VisaoGeral;