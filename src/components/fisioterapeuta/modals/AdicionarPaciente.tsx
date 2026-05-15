import "../../../styles/fisioterapeuta/modalpacientesAdd.css"
import { CgClose } from "react-icons/cg";
import { criarPaciente, Genero } from "../../../database/services/pacientes";
import { useAuth } from "../../../contexts/AuthContext";
import { useState } from "react";

type Props = {
    onFechar: () => void;
    onPacienteCriado: () => void;
}

function AdicionarPaciente({ onFechar, onPacienteCriado }: Props) {
    const { usuario } = useAuth();

    const [nome, setNome] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [genero, setGenero] = useState<Genero | "">("");
    const [diagnostico, setDiagnostico] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    async function handleSalvar() {
        try {
            setErro("");

            if (!usuario) {
                setErro("Usuário não autenticado.");
                return;
            }
            if (usuario.papel !== "fisioterapeuta") {
                setErro("Apenas fisioterapeutas podem criar pacientes.");
                return;
            }
            if (!nome.trim()) {
                setErro("O nome do paciente é obrigatório.");
                return;
            }
            if (!dataNascimento) {
                setErro("A data de nascimento é obrigatória.");
                return;
            }
            
            setSalvando(true);

            await criarPaciente({
                nome: nome.trim(),
                data_nascimento: dataNascimento,
                genero: genero || undefined,
                diagnostico: diagnostico.trim() || undefined,
                fisioterapeuta_id: usuario.id,
            });

            await onPacienteCriado();
            onFechar();
        } catch (e) {
            console.error("Erro ao criar paciente:", e);
            setErro("Ocorreu um erro ao criar o paciente. Tente novamente.");
        } finally {
            setSalvando(false);
        }
    }
    return (
        <div className="modal-overlay" onClick={onFechar}>
            <div className="modal sm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Adicionar Paciente</h2>
                    <span onClick={onFechar}>
                        <CgClose />
                    </span>
                </div>
                <div className="modal-body">
                    {erro && <p className="modal-erro">{erro}</p>}

                    <div className="campo">
                        <label>Nome Completo</label>
                        <input 
                            type="text"
                            placeholder="Digite o nome completo do paciente"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </div>
                    <div className="campos-row">
                        <div className="campo">
                            <label>Data de Nascimento</label>
                            <input
                                type="date"
                                value={dataNascimento}
                                onChange={(e) => setDataNascimento(e.target.value)}
                            />
                        </div>
                        <div className="campo">
                            <label>Gênero</label>
                            <select
                                value={genero}
                                onChange={(e) => setGenero(e.target.value as Genero | "")}
                            >
                                <option value="">Selecione o gênero</option>
                                <option value="masculino">Masculino</option>
                                <option value="feminino">Feminino</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                    </div>
                    <div className="campo">
                        <label>Diagnóstico (opcional)</label>
                        <textarea 
                            placeholder="Digite o diagnóstico do paciente, se houver"
                            value={diagnostico}
                            onChange={(e) => setDiagnostico(e.target.value)}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary-white" onClick={onFechar}>Cancelar</button>
                    <button className="btn btn-primary-white" onClick={handleSalvar} disabled={salvando}>
                        {salvando ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdicionarPaciente;