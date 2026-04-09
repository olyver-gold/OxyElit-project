import "../styles/medico/pageMed.css";
import logo from "../assets/upOxyElit.png";
import { useNavigate } from "react-router-dom";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
// import { FaCog } from "react-icons/fa";
import { FaHospitalUser } from "react-icons/fa";
import VisaoGeral from "../components/medico/VisaoGeral";
import Relatorios from "../components/medico/Relatorios";
import Prescricoes from "../components/medico/Prescricoes";
import Pacientes from "../components/medico/Pacientes";

function PageMed() {
    const navigate = useNavigate();
    const [paginaAtiva, setPaginaAtiva] = useState("Visão geral");
    const titulosHeader: Record<string, string> = {
        "Visão geral": "Visão Geral: Resumo do plantão",
        "Pacientes": "Central de cadastro de pacientes",
        "Prescrições": "Central de prescrições",
        "Relatórios": "Histórico e leitura de relatórios"
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
        <main className="page-med">
            <div className="painel-med">
                <div className="logo-painel-med">
                    <img src={logo} alt="Logo OxyElit" />
                    <div>
                        <h1>OXYELIT</h1>
                        <p>Sistema inteligente de oxigenoterapia</p>
                    </div>
                </div>

                {/* MENU DE NAVEGAÇÃO */}
                <div className="menu-med">
                    <ul>
                        {["Visão geral", "Pacientes", "Prescrições", "Relatórios"].map((item) => (
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

                <div className="painel-button-med">
                    <button onClick={handleSair} className="sair-button-med">
                        Sair
                    </button>
                </div>

                <div className="credits-med">
                    <p>Acesso restrito a profissionais autorizados</p>
                    <p>2026 OXYELIT - Uso Hospitalar</p>
                </div>
            </div>
            
            {/* CONTEÚDO PRINCIPAL */}
            <div className="conteudo-med">
                <div className="header-med">
                    <span className="header-titulo-m">{titulosHeader[paginaAtiva]}</span>
                    <div className="header-right-m">
                        <p className="user-badge-m"><FaHospitalUser size={16}/> Dr. Evaristo (CRM A123)</p>
                        {/* <span className="icone-config-m">
                            <FaCog size={20} />
                        </span> */}
                    </div>
                </div>

                <div className="pagina-conteudo-m">
                    {paginaAtiva === "Visão geral" && <VisaoGeral onNavegar={setPaginaAtiva} />}
                    {paginaAtiva === "Pacientes" && <Pacientes onNavegar={setPaginaAtiva} />}
                    {paginaAtiva === "Prescrições" && <Prescricoes />}
                    {paginaAtiva === "Relatórios" && <Relatorios />}
                </div>
            </div>
        </main>
    );
}

export default PageMed;