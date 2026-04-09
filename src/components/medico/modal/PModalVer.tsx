import "../../../styles/medico/modals/PModalVer.css";

type Paciente = {
    id: number;
    nome: string;
    nascimento: string;
    cid: string;
};

type Props = {
    paciente: Paciente;
    onFechar: () => void;
    onNavegar: (pagina: string) => void;
};

function PModalVer({ paciente, onFechar, onNavegar }: Props) {
    const handleNovaPrescricao = () => {
        onFechar();
        setTimeout(() => {
            onNavegar("Prescrições");
        }, 50); 
    }
    
    return (
        <div className="modal-overlay" onClick={onFechar}>
            <div className="modal-v" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-titulo">{paciente.nome}</span>
                    <button className="modal-fechar" onClick={onFechar}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <div className="dados">

                        {/* Dados básicos primeiro */}
                        <h1 className="titulo">Dados de Cadastro</h1>
                        <div className="dados-row">
                            <div className="dados-card">
                                <span className="dc-title">Nome</span>
                                <span className="dc-value">{paciente.nome}</span>
                            </div>
                            <div className="dados-card">
                                <span className="dc-title">Nascimento</span>
                                <span className="dc-value">{paciente.nascimento}</span>
                            </div>
                            <div className="dados-card">
                                <span className="dc-title">CID</span>
                                <span className="dc-value">{paciente.cid}</span>
                            </div>
                        </div>

                        {/* Dados de histórico de prescrições */}
                        <h1 className="titulo">Prescrições</h1>
                        <div className="dados-prescricao">
                            <div className="prescricao-row">
                                <div>
                                    <p className="prescricao-value">2L/min · Oxigenoterapia contínua</p>
                                    <p className="prescricao-validade">Válida até 10/05/2026</p>
                                </div>
                                <span className="tag ativa">Ativa</span>
                            </div>
                            <div className="prescricao-row">
                                <div>
                                    <p className="prescricao-value">3L/min · Oxigenoterapia noturna</p>
                                    <p className="prescricao-validade">Expirou em 01/05/2026</p>
                                </div>
                                <span className="tag expirada">Expirada</span>
                            </div>
                        </div>

                        {/* Dados de histórico de relatórios */}
                        <h1 className="titulo">Relatórios</h1>
                        <div className="dados-relatorio">
                            <div className="relatorio-row">
                                <div>
                                    <p className="relatorio-nome">Relatório de Evolução - Enf. Joana</p>
                                    <p className="relatorio-data">Hoje 08:15 </p>
                                </div>
                                <span className="tag t-new">Novo</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={onFechar}>
                        Fechar
                    </button>
                    <button className="btn-nova" onClick={handleNovaPrescricao}>
                        + Nova prescrição
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PModalVer;