import { useState } from "react";
import "../../../styles/medico/modals/PModalAdd.css";

type Props = {
    onFechar: () => void;
};

function PModalAdd({ onFechar }: Props) {
    const [nome, setNome] = useState("");
    const [nascimento, setNascimento] = useState("");
    const [cid, setCid] = useState("");

    const handleSalvar = () => {
        if (!nome || !nascimento || !cid) return
        console.log("Novo paciente:", { nome, nascimento, cid });
        onFechar();
    };

    return (
        <div className="modal-overlay" onClick={onFechar}>
            <div className="modal-ap" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-titulo">Adicionar Paciente</span>
                    <button className="modal-fechar" onClick={onFechar}>×</button>
                </div>
                <div className="modal-body-ap">
                    <div className="campo">
                        <label>Nome Completo</label>
                        <input 
                            type="text" 
                            placeholder="Insira o nome"
                            value={nome} 
                            onChange={(e) => setNome(e.target.value)} 
                        />
                    </div>
                    <div className="campo">
                        <label>Data de Nascimento</label>
                        <input 
                            type="date" 
                            value={nascimento} 
                            onChange={(e) => setNascimento(e.target.value)} 
                        />
                    </div>
                    <div className="campo">
                        <label>CID</label>
                        <input 
                            type="text" 
                            placeholder="Exemplo: J96"
                            value={cid} 
                            onChange={(e) => setCid(e.target.value)} 
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

export default PModalAdd;