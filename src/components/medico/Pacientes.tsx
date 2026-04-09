import "../../styles/medico/Pacientes.css";
import { useState } from "react";
import PModalAdd from "./modal/PModalAdd";
import PModalVer from "./modal/PModalVer";

type Paciente = {
    id: number;
    nome: string;
    nascimento: string;
    cid: string;
};

function Pacientes({ onNavegar}: { onNavegar: (pagina: string) => void}) {
    const pacientes = [
        { id: 1, nome: "Paciente A", nascimento: "15/03/1980", cid: "J96.0"},
        { id: 2, nome: "Paciente B", nascimento: "22/07/1975", cid: "J96.1"},
        { id: 3, nome: "Paciente C", nascimento: "05/11/1990", cid: "J44.1"},
        { id: 4, nome: "Paciente D", nascimento: "30/01/1985", cid: "J96.9"}, 
        
    ];

    const [busca, setBusca] = useState("");

    // filtra o array conforme a busca
    const pacientesFiltrados = pacientes.filter((p) =>
        p.nome.toLowerCase().includes(busca.toLowerCase())
    );

    const [modalAberto, setModalAberto] = useState(false);
    const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);

    // const getBadgeClass = (status: string) => {
    //     if (status === "Estável") return "badge badge-ok";
    //     if (status === "Atenção") return "badge badge-warn";
    //     return "badge badge-danger";
    // };

    return (
        <div className="pacientes">
            <div className="top-row">
                <div>
                    <input
                        className="busca"
                        type="text"
                        placeholder="Buscar paciente..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                     />
                </div>
                <div>
                    <button className="add-paciente" onClick={() => setModalAberto(true)}>+ Adicionar Paciente</button>
                </div>
            </div>

            <div className="pacientes-tabela-wrapper">
                <table className="pacientes-tabela">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Data de nascimento</th>
                            <th>CID</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pacientesFiltrados.map((p) => (
                            <tr key={p.id}>
                                <td>{p.nome}</td>
                                <td>{p.nascimento}</td>
                                <td>{p.cid}</td>
                                <td><button className="botao-ver" onClick={() => setPacienteSelecionado(p)}>Ver</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>  

            {/* modal de adicionar pacientes */}
            {modalAberto && (
                <PModalAdd 
                    onFechar={() => setModalAberto(false)}
                />
            )}

            {/* modal de visualização de paciente */}
            {pacienteSelecionado && (
                <PModalVer 
                    paciente={pacienteSelecionado}
                    onFechar={() => setPacienteSelecionado(null)}
                    onNavegar={onNavegar}
                />
            )}

        </div>
        
    );
}

export default Pacientes;