import "../styles/enfermeiro/pageEnf.css";
import logo from "../assets/upOxyElit.png";
import { useNavigate } from "react-router-dom";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
// import { FaCog } from "react-icons/fa";
import { FaHospitalUser } from "react-icons/fa";
import VisaoGeral from "../components/enfermeiro/VisaoGeral";
import Monitoramento from "../components/enfermeiro/Monitoramento";
import Relatorios from "../components/enfermeiro/Relatorios";
import VerMonitoramento from "../components/enfermeiro/MonitoramentoReal";

export interface DadosPaciente {
  nome: string;
  ie: string;
  fr: number;
  vpress: number;
  hpress: number;
  status: string;
}

function PageEnf() {
    const navigate = useNavigate();
    const [paginaAtiva, setPaginaAtiva] = useState("Visão geral");
    const [pacienteSelecionado, setPacienteSelecionado] = useState<DadosPaciente | null>(null);
    const titulosHeader: Record<string, string> = {
        "Visão geral": "Visão Geral: Resumo do plantão",
        "Moitoramento": "Central de monitoramento em tempo real",
        "Relatórios": "Histórico e emissão de relatórios"
    };
    const handleSair = async () => {
        try {
            await invoke("redimensionar_janela");
            await new Promise(resolve => setTimeout(resolve, 200));
            const appWindow = getCurrentWindow();
            await appWindow.center();
            
        } catch (e) {
            console.error("Erro:", e);
        }
        navigate('/');
    };
    
    return (
        <main className="page-enf">
            <div className="painel-enf">
                <div className="logo-painel-enf">
                    <img src={logo} alt="Logo OxyElit" />
                    <div>
                        <h1>OXYELIT</h1>
                        <p>Sistema inteligente de oxigenoterapia</p>
                    </div>
                </div>

                {/* MENU DE NAVEGAÇÃO */}
                <div className="menu-enf">
                    <ul>
                        {["Visão geral", "Monitoramento", "Relatórios"].map((item) => (
                        <li
                            key={item}
                            className={paginaAtiva === item ? "menu-item ativo" : "menu-item"}
                            onClick={() => setPaginaAtiva(item)}
                        >
                            {item}
                        </li>
                        ))}
                    </ul>
                </div>
                <div className="painel-button-enf">
                    <button onClick={handleSair} className="sair-button-enf">
                        Sair
                    </button>
                </div>

                <div className="credits-enf">
                    <p>Acesso restrito a profissionais autorizados</p>
                    <p>2026 OXYELIT - Uso Hospitalar</p>
                </div>
            </div>
            
            {/* CONTEÚDO PRINCIPAL */}
            <div className="conteudo-enf">
                <div className="header-enf">
                    <span className="header-titulo-e">{titulosHeader[paginaAtiva]}</span>
                    <div className="header-right-e">
                        <p className="user-badge-e"><FaHospitalUser size={16}/> Enf. Joana (COREN B123)</p>
                        {/* <span className="icone-config-e">
                            <FaCog size={20} />
                        </span> */}
                    </div>
                </div>

                <div className="pagina-conteudo-e">
                    {paginaAtiva === "Visão geral" && <VisaoGeral onNavegar={setPaginaAtiva}/>}
                    {paginaAtiva === "Monitoramento" && (
                        // Se houver um paciente selecionado, mostra VerMonitoramento. 
                        // Caso contrário, mostra a lista (Monitoramento).
                        pacienteSelecionado ? (
                        <VerMonitoramento 
                            nome={pacienteSelecionado.nome}
                            ie={pacienteSelecionado.ie}
                            fr={pacienteSelecionado.fr} 
                            vpress={pacienteSelecionado.vpress}
                            hpress={pacienteSelecionado.hpress}
                            status={pacienteSelecionado.status}
                            aoVoltar={() => setPacienteSelecionado(null)} 
                        />
                        ) : (
                        <Monitoramento aoSelecionarPaciente={(dados) => setPacienteSelecionado(dados)} />
                        )
                    )}
                    {paginaAtiva === "Relatórios" && <Relatorios />}
                </div>
            </div>
            
        </main>
    );
}

export default PageEnf;