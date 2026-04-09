import "../../../styles/enfermeiro/modals/RelModalEsc.css";
import { useState } from "react";

type Props = {
    onFechar: () => void;
};

function RelModalEsc({ onFechar }: Props) {
    const [paciente, setPaciente] = useState("");
    const [tipo, setTipo] = useState("");
    const [escrever, setEscrever] = useState("");

    const handleSalvar = () => {
        if (!paciente || !tipo || !escrever) return
        console.log("Relatório Escrito:", { paciente, tipo, escrever });
        onFechar();
    }

    return(
        <div className="modal-overlay " onClick={onFechar}>
            <div className="modal-esc" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <span className="modal-titulo">Escrever relatório</span>
                    </div>
                    <button className="modal-fechar" onClick={onFechar}>
                        ×
                    </button>
                </div>
                <div className="modal-body-esc">
                    <div className="campo-esc">
                        <label>Paciente</label>
                        <select 
                            name="paciente" 
                            id="paciente" 
                            value={paciente} 
                            onChange={(e) => setPaciente(e.target.value)}
                        >
                            <option value="">Selecione um paciente</option>
                            <option value="Paciente A">Paciente A</option>
                            <option value="Paciente B">Paciente B</option>
                            <option value="Paciente C">Paciente C</option>
                            <option value="Paciente D">Paciente D</option>
                        </select>
                    </div>
                    <div className="campo-esc">
                        <label>Tipo</label>
                        <select 
                            name="tipo" 
                            id="tipo"
                            value={tipo} 
                            onChange={(e) => setTipo(e.target.value)} 
                        >
                            <option value="">Selecione um tipo</option>
                            <option value="Evolução">Evolução</option>
                            <option value="Atenção">Atenção</option>
                            <option value="Observação">Observação</option>
                        </select>
                    </div>
                    <div className="campo-esc">
                        <label>Escrever relatório</label>
                        <textarea 
                            name="escrever" 
                            id="escrever" 
                            value={escrever} 
                            onChange={(e) => setEscrever(e.target.value)} 
                            placeholder="Digite o conteúdo do relatório aqui..."
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={onFechar}>
                        Fechar
                    </button>
                    <button className="btn-salvar" onClick={handleSalvar}>
                        Concluir
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RelModalEsc;