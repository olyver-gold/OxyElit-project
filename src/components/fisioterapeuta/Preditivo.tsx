import "../../styles/fisioterapeuta/preditivo.css"
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Paciente , listarPacientesPorFisioterapeuta} from "../../database/services/pacientes";

function gerarIniciais(nome: string): string {
  if (!nome) return "??";

  const partes = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) return "??";

  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase();
  }

  const primeira = partes[0][0];
  const ultima = partes[partes.length - 1][0];

  return `${primeira}${ultima}`.toUpperCase();
}


function Preditivo() {
  const { usuario } = useAuth();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);

  const [busca, setBusca] = useState("");
  const pacientesFiltrados = pacientes.filter((paciente) =>
    paciente.nome.toLowerCase().includes(busca.toLowerCase())
  );

  async function carregarDadosIniciais() {
      if (!usuario) {
        setPacienteSelecionado(null);
        setPacientes([]);
        return;
      }
  
      try {
        const pacientesDoFisio = await listarPacientesPorFisioterapeuta(usuario.id);
        setPacientes(pacientesDoFisio);
        
      } catch (error) {
        console.error("Erro ao carregar dados iniciais do monitoramento:", error);
        setPacienteSelecionado(null);
      }
    }
  
    useEffect(() => {
      carregarDadosIniciais();
    }, [usuario]);
    

  return (
    <div className="preditivo">
      
      <div className="preditivo-header">
        <div>
          <h2>Análises Preditivas</h2>
          <span>Selecione um paciente para visualizar</span>
        </div>
      </div>

      <div className="preditivo-conteudo">
        <div className="card">
          <h3>Pacientes</h3>
          <input
            type="text"
            placeholder="Buscar paciente pelo nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <div className="lista-pacientes">
            {pacientesFiltrados.map((paciente) => (
              <button
                key={paciente.id}
                className={
                  pacienteSelecionado?.id === paciente.id 
                    ? "paciente-item selecionado" 
                    : "paciente-item"
                }
                onClick={() => setPacienteSelecionado(paciente)}
              >
                <div className="paciente-avatar">
                  <span>{gerarIniciais(paciente.nome)}</span>
                  <strong>{paciente.nome}</strong>
                </div>
                <span>{paciente.diagnostico ?? "Sem diagnóstico informado/disponível"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preditivo;