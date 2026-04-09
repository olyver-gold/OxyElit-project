import imgcard from '../assets/card.png';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getCurrentWindow} from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { useState } from 'react';

function LoginMed() {
  const navigate = useNavigate();
  const [crm, setCrm] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = async () => {
    setErro("");

    try {
      await invoke("login_medico", { crm, password });

      try {
        const appWindow = getCurrentWindow();
        await appWindow.maximize();
        // essa merda resolve o problema do maximize não aplicar antes da navegação
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.error("Erro ao maximizar:", e);
      }

      navigate('/page-med');

    } catch (error) {
      setErro(error as string);
    }
  };

  return (
    <div className="background container">
      <div className="login-card">
        <div className="login-left">
          <div className="login-header">
            <span style={{ cursor: "pointer" }} onClick={() => window.history.back()}>
              <FaArrowLeft size={24} />
            </span>
            <h1>Acesso Médico</h1>
          </div>
          <p>Utilize suas credenciais institucionais para acessar o sistema.</p>
          <div className='input-med-enf'>
            <input
              required 
              type="text" 
              placeholder="Digite seu CRM"
              value={crm}
              onChange={(e) => setCrm(e.target.value)}
            />
            <input 
              required
              type="password" 
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {erro && <p style={{ color: "red", fontSize: "13px" }}>{erro}</p>}

          </div>
          <div className="button-login">
            <button onClick={handleLogin}>Entrar</button>
          </div>
          <div className='credits'>
            <p>Acesso restrito a profissionais autorizados</p>
            <p>2026 OXYELIT - Uso Hospitalar</p>
          </div>
        </div>
        <div className="login-right">
          <img src={imgcard} alt="Imagem de card" />
        </div>
      </div>
    </div>
  );
}

export default LoginMed;