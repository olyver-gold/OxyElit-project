import "../../styles/fisioterapeuta/pacientes.css";
import { useAuth } from "../../contexts/AuthContext";
import { listarPacientesPorFisioterapeuta, Paciente } from "../../database/services/pacientes";
import { useEffect, useState } from "react";
import { formatarDataSQLite } from "../../utils/data";
import AdicionarPaciente from "./modals/AdicionarPaciente";
import DetalhesPaciente from "./modals/DetalhesPaciente";

type Props = {
  onNavegar: (pagina: number) => void;
  onSelecionarPacienteParaSessao: (pacienteId: number) => void;
}

function Pacientes({ onNavegar, onSelecionarPacienteParaSessao }: Props) {
  const { usuario } = useAuth();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busca, setBusca] = useState("");

  const [detalhesAberto, setDetalhesAberto] = useState(false);
  const [pacienteDetalhesId, setPacienteDetalhesId] = useState<number | null>(null);
  
  const [modalAberto, setModalAberto] = useState(false);

  async function carregarPacientes() {
    if (!usuario) return;
    if (usuario.papel !== "fisioterapeuta") return;

    try {
      const dados = await listarPacientesPorFisioterapeuta(usuario.id);
      setPacientes(dados);
    } catch (e) {
      console.error("Erro ao carregar pacientes:", e);
    }
  }

  useEffect(() => {
    carregarPacientes();
  }, [usuario]);

  const pacientesFiltrados = pacientes.filter((paciente) =>
    paciente.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function formatarData(data: string) {
    if (!data) return "-";

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function formatarGenero(genero: string) {
    if (!genero) return "-";

    const generos: Record<string, string> = {
      masculino: "Masculino",
      feminino: "Feminino",
      outro: "Outro",
    };

    return generos[genero] ?? genero;
  }

  return (
    <div className="pacientes">
      
      <div className="pacientes-header">
        <div>
          <h2>Pacientes</h2>
          <span>Gerencie e visualize detalhes dos pacientes</span>
        </div>
      </div>
      
      <div className="pacientes-conteudo">
        <div className="top-row">
          <input 
            className="busca"
            type="text" 
            placeholder="Buscar paciente..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <button className="btn btn-primary-white" onClick={() => setModalAberto(true)}>
            Adicionar Paciente
          </button>
        </div>

        <div className="pacientes-tabela">
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Data de Nascimento</th>
                <th>Gênero</th>
                <th>Última Sessão</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="nenhum-paciente">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              ) : (
                pacientesFiltrados.map((paciente) => (
                <tr key={paciente.id}>
                  <td>{paciente.nome}</td>
                  <td>{formatarData(paciente.data_nascimento)}</td>
                  <td>{formatarGenero(paciente.genero)}</td>
                  <td>{formatarDataSQLite(paciente.ultima_sessao)}</td>
                  <td><button
                        className="btn btn-secondary-white"
                        onClick={() => {
                          setPacienteDetalhesId(paciente.id);
                          setDetalhesAberto(true);
                        }}
                      >
                        Detalhes
                      </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {modalAberto && (
          <AdicionarPaciente 
            onFechar={() => setModalAberto(false)} 
            onPacienteCriado={carregarPacientes}
          />
        )}

        {detalhesAberto && pacienteDetalhesId !== null && (
          <DetalhesPaciente
            pacienteId={pacienteDetalhesId}
            onFechar={() => {
              setDetalhesAberto(false);
              setPacienteDetalhesId(null);
              carregarPacientes();
            }}
            onIniciarSessao={(pacienteId) => {
              onSelecionarPacienteParaSessao(pacienteId);
              setDetalhesAberto(false);
              setPacienteDetalhesId(null);
              onNavegar(2);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Pacientes;