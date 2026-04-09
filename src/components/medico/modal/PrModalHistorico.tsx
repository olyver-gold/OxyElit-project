import "../../../styles/medico/modals/PrModalHistorico.css";

type Prescricao = {
    id: number;
    tipo: string;
    fluxo: string;
    validade: string;
    criadaEm: string;
    status: "Ativa" | "Expirada";
    observacoes?: string;
};

type Props = {
    paciente: { nome: string; cid: string };
    onFechar: () => void;
    onNovaPrescricao: () => void;
};

function PrModalHistorico({ paciente, onFechar, onNovaPrescricao }: Props) {
    const prescricoes: Prescricao[] = [
        { id: 1, tipo: "Contínua", fluxo: "3", validade: "10/05/2026", criadaEm: "01/04/2026", status: "Ativa", observacoes: "Manter monitoramento noturno." },
        { id: 2, tipo: "Noturna", fluxo: "2", validade: "01/04/2026", criadaEm: "28/03/2026", status: "Expirada" },
        { id: 3, tipo: "Contínua", fluxo: "4", validade: "28/03/2026", criadaEm: "20/03/2026", status: "Expirada", observacoes: "Reduzir fluxo gradualmente." },
    ];

    const getBadgeClass = (status: string) => {
        if (status === "Ativa") return "tag ativa";
        return "tag expirada";
    }

    return (
        <div className="modal-overlay" onClick={onFechar}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <span className="modal-titulo">Histórico de Prescrições</span>
                        <p className="modal-sub">{paciente.nome} · CID {paciente.cid}</p>
                    </div>
                    <button className="modal-fechar" onClick={onFechar}>×</button>
                </div>
                <div className="modal-body">
                    {prescricoes.length === 0 ? (
                        <p className="sem-prescricoes">Nenhuma prescrição encontrada para este paciente.</p>
                    ) : (
                        <div className="prescricoes-lista">
                            {prescricoes.map((p, index) => (
                                <div key={p.id} className="presc-card">
                                    <div className="presc-card-header">
                                        <h1 className="presc-card-titulo">
                                            {index === 0 ? "Prescrição Atual" : "Prescrição Anterior"}
                                        </h1>
                                        <div className="presc-card-header-d">
                                            <span className="presc-card-data">Criada em {p.criadaEm}</span>
                                            <span className={getBadgeClass(p.status)}>{p.status}</span>
                                        </div>
                                    </div>
                                    <div className="presc-card-body">
                                        <div className="dado">
                                            <span className="dado-label">Tipo:</span>
                                            <span className="dado-valor">{p.tipo}</span>
                                        </div>
                                        <div className="dado">
                                            <span className="dado-label">Fluxo de O₂:</span>
                                            <span className="dado-valor">{p.fluxo} L/min</span>
                                        </div>
                                        <div className="dado">
                                            <span className="dado-label">Validada até:</span>
                                            <span className="dado-valor">{p.validade}</span>
                                        </div>
                                    </div>
                                    {p.observacoes && (
                                        <div className="presc-obs">
                                            Obs: {p.observacoes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div> // termina a div da lista de prescrições
                    )}

                </div>

                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={onFechar}>Fechar</button>
                    <button className="btn-nova" onClick={onNovaPrescricao}>
                        + Nova Prescrição
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PrModalHistorico;