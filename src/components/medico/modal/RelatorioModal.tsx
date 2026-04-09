import "../../../styles/medico/modals/RelatorioModal.css";

type Props = {
    onFechar: () => void;
};

function RelatorioModalMed({ onFechar }: Props) {
    return (
        <div className="modal-overlay" onClick={onFechar}>
            <div className="modal-relatorio" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <span className="modal-titulo">Relatório - Paciente A</span>
                        <p className="modal-sub">Enf. Joana · Hoje 08:15</p>
                    </div>
                    <button className="modal-fechar" onClick={onFechar}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <p>
                        Paciente estável durante o turno. Fluxo de O₂ mantido em 2L/min conforme prescrição. Frequência respiratória variando entre 15 a 18rpm. Sem picos de variação de pressão e intercorrências registradas.
                    </p>

                </div>
                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={onFechar}>
                        Fechar
                    </button>
                    <button className="btn-lido">Marcar como lido</button>
                </div>
            </div>
            
        </div>
    );
}
export default RelatorioModalMed;