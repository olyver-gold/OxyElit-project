import { useState } from "react";
import "../../styles/medico/Prescricoes.css";
import PrModalNova from "./modal/PrModalNova";
import PrModalHistorico from "./modal/PrModalHistorico";

type Prescricao = {
    id: number;
    paciente: string;
    cid: string;
    tipo: string;
    fluxo: string;
    validade: string;
    status: "Em dia" | "Renovar" | "Expirada";
};

function Prescricoes() {
    const prescricoes: Prescricao[] = [
        { id: 1, paciente: "Paciente A", cid: "J96.0", tipo: "Contínua", fluxo: "3 L/min", validade: "Válida até 10/04", status: "Em dia" },
        { id: 2, paciente: "Paciente B", cid: "J96.1", tipo: "Noturna", fluxo: "2 L/min", validade: "Vence em 2 dias", status: "Renovar" },
        { id: 3, paciente: "Paciente C", cid: "J44.1", tipo: "Contínua", fluxo: "4 L/min", validade: "Expirada em 05/04", status: "Expirada" },
        { id: 4, paciente: "Paciente D", cid: "J96.9", tipo: "Aguda", fluxo: "1 L/min", validade: "Válida até 15/04", status: "Em dia" },
    ];
    const [busca, setBusca] = useState("");

    // filtra o array conforme a busca
    const prescricoesFiltradas = prescricoes.filter((p) =>
        p.paciente.toLowerCase().includes(busca.toLowerCase())
    );

    const [modalAberto, setModalAberto] = useState(false);
    const [historicoAberto, setHistoricoAberto] = useState<Prescricao | null>(null);

    return (
        <div className="prescricoes">
            <div className="top-row">
                <div>
                    <input
                        className="busca"
                        type="text"
                        placeholder="Buscar prescrições..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
                <div>
                    <button className="add-presc" onClick={() => setModalAberto(true)}>+ Adicionar Prescrições</button>
                </div>
            </div>
            <div className="presc-tabela-wrapper">
                <table className="presc-tabela">
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Tipo</th>
                            <th>Fluxo O₂</th>
                            <th>Validade</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescricoesFiltradas.map((p) => (
                            <tr key={p.id}>
                                <td>{p.paciente}</td>
                                <td>{p.tipo}</td>
                                <td>{p.fluxo}</td>
                                <td>{p.validade}</td>
                                <td><span className={`tag t-${p.status === "Em dia" ? "ok" : p.status === "Renovar" ? "warn" : "danger"}`}>{p.status}</span></td>
                                <td><button className="botao-ver" onClick={() => setHistoricoAberto(p)}>
                                    Ver histórico
                                </button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* modal de nova prescrição */}
            {modalAberto && (
                <PrModalNova 
                    onFechar={() => setModalAberto(false)}
                 />
            )}

            {/* modal de histórico */}
            {historicoAberto && (
                <PrModalHistorico
                    paciente={{ nome: historicoAberto.paciente, cid: historicoAberto.cid }}
                    onFechar={() => setHistoricoAberto(null)}
                    onNovaPrescricao={() => {
                        setHistoricoAberto(null);
                        setTimeout(() => setModalAberto(true), 50);
                    }}
                />
            )}


        </div>
    );
}

export default Prescricoes;