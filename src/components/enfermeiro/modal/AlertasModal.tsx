import "../../../styles/enfermeiro/modals/AlertasModal.css";

type Notificacao = {
  id: number;
  texto: string;
  tempo: string;
  lida: boolean;
  cor: string;
};

const notificacoes: Notificacao[] = [
  { id: 1, texto: "Paciente B - Pressão próxima de zero, verificar urgente!", tempo: "Há 10 minutos", lida: false, cor: "#ff5454" },
  { id: 2, texto: "Paciente C - Esforço respiratório recorrente.", tempo: "Há 30 minutos", lida: true, cor: "#ba9c17" },
]

type Props = {
  onFechar: () => void;
};

function AlertasModal({ onFechar }: Props) {
    return (
        <div>
            <div className="modal-overlay" onClick={onFechar}>
                <div className="modal-notif" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <span className="modal-titulo">Notificações</span>
                        <button className="modal-fechar" onClick={onFechar}>×</button>
                    </div>
                    <div className="modal-body-notif">
                        {notificacoes.map((n) => (
                            <div
                            key={n.id}
                            className={`notif-item ${!n.lida ? "nao-lida" : ""}`}
                            >
                            <span className="notif-dot" style={{ background: n.cor }}></span>
                            <div className="notif-content">
                                <p className="notif-texto">{n.texto}</p>
                                <div className="notif-meta">
                                <span className="notif-tempo">{n.tempo}</span>
                                </div>
                            </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AlertasModal;