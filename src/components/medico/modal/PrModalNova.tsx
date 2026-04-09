import { useState } from "react";
import "../../../styles/medico/modals/PrModalNova.css";

type Props = {
    onFechar: () => void;
};

function PrModalNova({ onFechar }: Props) {
    const [paciente, setPaciente] = useState("");
    const [tipo, setTipo] = useState("");
    const [fluxo, setFluxo] = useState("");
    const [validade, setValidade] = useState("");
    const [observacoes, setObservacoes] = useState("");

    const handleSalvar = () => {
        if (!paciente || !fluxo || !validade) return
        console.log("Nova Prescrição:", { paciente, tipo, fluxo, validade, observacoes });
        onFechar();
    }

    return (
        <div className="modal-overlay" onClick={onFechar}>
            <div className="modal-nova" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-titulo">Nova Prescrição</span>
                    <button className="modal-fechar" onClick={onFechar}>×</button>
                </div>
                <div className="modal-body-nova">
                    <div className="campo">
                        <label>Paciente</label>
                        <select 
                            name="paciente" 
                            id="paciente" 
                            value={paciente} 
                            onChange={(e) => setPaciente(e.target.value)}>
                            <option value="">Selecione um paciente</option>
                            <option value="Paciente A">Paciente A</option>
                            <option value="Paciente B">Paciente B</option>
                            <option value="Paciente C">Paciente C</option>
                            <option value="Paciente D">Paciente D</option>
                        </select>
                    </div>
                    <div className="campo">
                        <label>Tipo</label>
                        <select 
                            name="tipo" 
                            id="tipo"
                            value={tipo} 
                            onChange={(e) => setTipo(e.target.value)} 
                        >
                            <option value="">Selecione um tipo</option>
                            <option value="Contínua">Contínua</option>
                            <option value="Intermitente">Intermitente</option>
                            <option value="Noturna">Noturna</option>
                            <option value="Aguda">Aguda</option>
                        </select>
                    </div>
                    <div className="campos-row">
                        <div className="campo">
                            <label>Fluxo de O₂ (L/min)</label>
                            <input
                                type="number"
                                placeholder="Ex: 2"
                                min="0.5"
                                max="15"
                                step="0.5"
                                value={fluxo}
                                onChange={(e) => setFluxo(e.target.value)}
                            />
                        </div>
                        <div className="campo">
                            <label>Válida até</label>
                            <input
                                type="date"
                                value={validade}
                                onChange={(e) => setValidade(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="campo">
                        <label>Observações</label>
                        <textarea 
                            placeholder="Insira observações..."
                            value={observacoes} 
                            onChange={(e) => setObservacoes(e.target.value)} 
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={onFechar}>Cancelar</button>
                    <button className="btn-salvar" onClick={handleSalvar}>Salvar</button> 
                </div>
            </div>
        </div>
    );
}

export default PrModalNova;