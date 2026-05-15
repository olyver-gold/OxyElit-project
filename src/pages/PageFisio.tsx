import "../styles/pages/fisio.css";
import logo from "../assets/upOxyElit.png";
import { LuLayoutDashboard } from "react-icons/lu";
import { TbHeartRateMonitor } from "react-icons/tb";
import { FaUserPlus, FaChartLine, FaFileMedical } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { JSX, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getCurrentWindow } from "@tauri-apps/api/window";
import VisaoGeral from "../components/fisioterapeuta/VisaoGeral";
import Monitoramento from "../components/fisioterapeuta/Monitoramento";
import Pacientes from "../components/fisioterapeuta/Pacientes";
import Preditivo from "../components/fisioterapeuta/Preditivo";
import Relatorios from "../components/fisioterapeuta/Relatorios";

function PageFisio() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [menuAtivo, setMenuAtivo] = useState(1);
  const [pacientePreSelecionadoId, setPacientePreSelecionadoId] = useState<number | null>(null);

  const componentesMenu: Record<number, JSX.Element> = {
    1: <VisaoGeral onNavegar={setMenuAtivo}/>,
    2: <Monitoramento pacientePreSelecionadoId={pacientePreSelecionadoId}/>,
    3: <Pacientes onNavegar={setMenuAtivo} onSelecionarPacienteParaSessao={setPacientePreSelecionadoId}/>,
    4: <Preditivo />,
    5: <Relatorios />,
  };

  // pega as iniciais do nome para o avatar
  const iniciais = usuario?.nome
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '??';

  const handleSair = async () => {
    try {
      const appWindow = getCurrentWindow();
      logout();
      await appWindow.unmaximize();
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate("/login");
    } catch (e) {
      console.error("Erro ao sair:", e);
    }
  };

  const itensMenu = [
    { id: 1, nome: "Visão Geral",   icone: <LuLayoutDashboard /> },
    { id: 2, nome: "Monitoramento", icone: <TbHeartRateMonitor /> },
    { id: 3, nome: "Pacientes",     icone: <FaUserPlus /> },
    { id: 4, nome: "Análises",      icone: <FaChartLine /> },
    { id: 5, nome: "Relatórios",    icone: <FaFileMedical /> },
  ];

  return (
    <main className="page-fisio">
      <div className="painel-fisio">

        {/* LOGO + TÍTULO */}
        <div className="painel-logo">
          <img src={logo} alt="Logo OxyElit" />
          <div className="painel-titulo">
            <h1>OXYELIT</h1>
            <p>Monitoramento respiratório clínico</p>
          </div>
        </div>

        {/* MENU */}
        <div className="painel-menu">
          <ul>
            {itensMenu.map((item) => (
              <li 
                key={item.id}
                onClick={() => setMenuAtivo(item.id)}
                className={menuAtivo === item.id ? "ativo" : ""}
              >
                <span className="icone">{item.icone}</span>
                <span className="item">{item.nome}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* USER + LOGOUT */}
        <div className="painel-fim">
            
          {usuario && (
            <div className="painel-usuario">
              <div className="avatar">{iniciais}</div>
              <div className="painel-usuario-info">
                <span className="painel-usuario-nome">{usuario.nome}</span>
                <span className="painel-usuario-papel">Fisioterapeuta</span>
              </div>
            </div>
          )}

          <div className="logout-button">
            <button 
              className="btn btn-primary-blue"
              style={{width: "100%"}}
              onClick={handleSair}
            >
              Sair
            </button> 

          </div>

          <div className="painel-creditos">
            <p>Acesso restrito a profissionais autorizados</p>
            <p>2026 OXYELIT - Fisioterapia respiratória</p>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL - MENU ATIVO */}
        <div className="conteudo-fisio">
          {componentesMenu[menuAtivo]}
        </div>

    </main>
  );
}

export default PageFisio;