import "../styles/pages/fisio.css";
import logo from "../assets/upOxyElit.png";

import { LuLayoutDashboard } from "react-icons/lu";
import { TbHeartRateMonitor } from "react-icons/tb";
import { FaUserPlus, FaChartLine } from "react-icons/fa";
import { CgChevronRight } from "react-icons/cg";

import { useLocation, useNavigate } from "react-router-dom";
import { JSX, useState, useEffect, useRef} from "react";
import { useAuth } from "../contexts/AuthContext";
import { buscarOutrosUsuarios } from "../database/services/auth";
import { getCurrentWindow } from "@tauri-apps/api/window";

import VisaoGeral from "../components/fisioterapeuta/VisaoGeral";
import Monitoramento from "../components/fisioterapeuta/Monitoramento";
import Pacientes from "../components/fisioterapeuta/Pacientes";
import Preditivo from "../components/fisioterapeuta/Preditivo";

interface UsuarioSimples {
  id: number;
  nome: string;
  email: string;
}

function PageFisio() {
  const navigate = useNavigate();
  const location = useLocation();

  const { usuario, logout } = useAuth();

  const [menuAtivo, setMenuAtivo] = useState(1);
  const [popoverAberto, setPopoverAberto] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [outrosUsuarios, setOutrosUsuarios] = useState<UsuarioSimples[]>([]);
  const [pacientePreSelecionadoId, setPacientePreSelecionadoId] = useState<number | null>(null);

  const componentesMenu: Record<number, JSX.Element> = {
    1: <VisaoGeral onNavegar={setMenuAtivo}/>,
    2: <Monitoramento pacientePreSelecionadoId={pacientePreSelecionadoId}/>,
    3: <Pacientes onNavegar={setMenuAtivo} onSelecionarPacienteParaSessao={setPacientePreSelecionadoId}/>,
    4: <Preditivo />,
  };

  // pega as iniciais do nome para o avatar
  const iniciais = (nome: string) => nome
    .split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() ?? '??';

  const itensMenu = [
    { id: 1, nome: "Visão Geral",   icone: <LuLayoutDashboard /> },
    { id: 2, nome: "Monitoramento", icone: <TbHeartRateMonitor /> },
    { id: 3, nome: "Pacientes",     icone: <FaUserPlus /> },
    { id: 4, nome: "Análises",      icone: <FaChartLine /> },
  ];

  // navegação vinda de outra tela (ex: fim de sessão - análise)
  useEffect(() => {
    if (location.state?.aba) {
      setMenuAtivo(location.state.aba);
    }
  }, [location.state]);

  // fecha popover ao clicar fora
  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverAberto(false);
      }
    }
    if (popoverAberto) {
      document.addEventListener('mousedown', handleClickFora);
    }
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, [popoverAberto]);

  const handleAbrirPopover = async () => {
    try {
      if (!popoverAberto && usuario) {
        const lista = await buscarOutrosUsuarios(usuario.id);
        setOutrosUsuarios(lista);
      }

      setPopoverAberto(prev => !prev);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);

      setOutrosUsuarios([]);
      setPopoverAberto(prev => !prev);
    }
  };

  const handleTrocarUsuario = async () => {
    try {
      const appWindow = getCurrentWindow();
      logout();
      await appWindow.unmaximize();
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate("/login");
    } catch (e) {
      console.error("Erro ao trocar de usuário:", e);
    }
  };

  const handleAdicionarUsuario = async () => {
    try {
      const appWindow = getCurrentWindow();
      setPopoverAberto(false);
      await appWindow.unmaximize();
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/setup');
    } catch (e) {
      console.error("Erro ao etornar para adicionar usuário:", e);
    }
      
  };

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
        
        {/* USER + LOGOUT + POPOVER */}
        <div className="painel-fim" ref={popoverRef}>

          {popoverAberto && (
            <div className="usuario-popover">
              <div className="popover-titulo">Trocar usuário</div>

              {outrosUsuarios.length === 0 ? (
                <div className="popover-vazio">Nenhum outro usuário cadastrado</div>
              ) : (
                outrosUsuarios.map(u => (
                  <div
                    key={u.id}
                    className="popover-item"
                    onClick={handleTrocarUsuario}
                  >
                    <div className="popover-avatar">{iniciais(u.nome)}</div>
                    <div>
                      <div className="popover-nome">{u.nome}</div>
                      <div className="popover-email">{u.email}</div>
                    </div>
                  </div>
                ))
              )}

              <div className="popover-add" onClick={handleAdicionarUsuario}>
                <span className="popover-add-icon">+</span>
                <span>Adicionar usuário</span>
              </div>

              <div className="popover-sair" onClick={handleSair}>
                <span>Sair do sistema</span>
              </div>
            </div>
          )}

          {usuario && (
            <div className="painel-usuario" onClick={handleAbrirPopover}>
              <div className="avatar">{iniciais(usuario.nome)}</div>
              <div className="painel-usuario-info">
                <span className="painel-usuario-nome">{usuario.nome}</span>
                <span className="painel-usuario-papel">Fisioterapeuta</span>
              </div>
              <span className={`painel-usuario-chevron ${popoverAberto ? 'aberto' : ''}`}>
                <CgChevronRight />
              </span>
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