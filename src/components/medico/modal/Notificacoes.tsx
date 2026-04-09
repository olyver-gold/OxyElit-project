import "../../../styles/medico/modals/Notificacoes.css";

type Notificacao = {
  id: number;
  texto: string;
  tempo: string;
  tipo: "prescricao" | "relatorio";
  lida: boolean;
  cor: string;
};

const notificacoes: Notificacao[] = [
  { id: 1, texto: "Paciente C — prescrição expirada, ação necessária", tempo: "Há 1h", tipo: "prescricao", lida: false, cor: "#ff5454" },
  { id: 2, texto: "Relatório de Paciente A recebido", tempo: "Hoje, 08:15", tipo: "relatorio", lida: true, cor: "#1D9E75" },
  { id: 3, texto: "Paciente B — prescrição vence em 2 dias", tempo: "Hoje, 07:51", tipo: "prescricao", lida: true, cor: "#ba9c17" }

]

// Props para serem acessadas por outros arquivos/paginas
type Props = {
  onFechar: () => void;
  onNavegar: (pagina: string) => void;
};

function NotificacoesModal({ onFechar, onNavegar }: Props) {
  const handleClicarNotificacao = (tipo: "prescricao" | "relatorio") => {
    onFechar();
    onNavegar(tipo === "prescricao" ? "Prescrições" : "Relatórios");
  };

  return (
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
              onClick={() => handleClicarNotificacao(n.tipo)}
            >
              <span className="notif-dot" style={{ background: n.cor }}></span>
              <div className="notif-content">
                <p className="notif-texto">{n.texto}</p>
                <div className="notif-meta">
                  <span className="notif-tempo">{n.tempo}</span>
                  <span className={`notif-tag ${n.tipo === "prescricao" ? "tag-presc" : "tag-rel"}`}>
                    {n.tipo === "prescricao" ? "Prescrições →" : "Relatórios →"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificacoesModal;