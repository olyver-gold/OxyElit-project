import "../styles/pages/login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { autenticar } from "../database/services/auth";
import { getCurrentWindow } from "@tauri-apps/api/window";
import logo from "../assets/upOxyElit.png";

function Login(){
  const navigate = useNavigate();
  const { salvarUsuario } = useAuth();
  

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      setErro("Por favor, preencha todos os campos.");
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      const usuario = await autenticar(email, senha);
      salvarUsuario(usuario);
      
      try {
        const appWindow = getCurrentWindow();
        await appWindow.maximize();
        // essa merda resolve o problema do maximize não aplicar antes da navegação
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.error("Erro ao maximizar:", e);
      }

      navigate('/app');
    } catch (e: any) {
      setErro(e.message || "Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div className="login-background">
      <div className="login-card">

        <div className="login-left">

          <div className="login-logo">
            <div className="login-logo icon">
              <img src={logo} alt="Logo OxyElit" />
            </div>

            <div className="login-logo-textos">
              <h1>OXYELIT</h1>
              <p>Monitoramento respiratório clínico</p>
            </div>
          </div>

          <div className="login-descricao">
            <h2>Bem-vindo ao sistema OxyElit</h2>
            <p>Insira suas credenciais para acessar o sistema de monitoramento:</p>
          </div>

          <div className="login-campo">
            <label htmlFor="email">Usuário</label>
            <input
              id="email"
              type="email" 
              placeholder="usuario@clinica.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <div className="login-campo">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password" 
              placeholder="********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>

          {erro && (
            <p style={{
              color: "var(--color-perigo)",
              fontSize: "12px",
              marginTop: "5px",
              textAlign: "center"
            }}>
              {erro}
            </p>
          )}

          <div className="login-button">
            <button 
              className="btn btn-primary-white" 
              style={{width: "100%"}} 
              onClick={handleLogin}
              disabled={carregando}
            >
              Entrar no sistema
            </button>
          </div>

          <div className="login-cadastro-link">
            <span>Sem conta? </span>
            <span
              className="login-cadastro-btn"
              onClick={() => navigate('/setup')}
            >
              Cadastre-se
            </span>
          </div>

          <div className="login-credits">
              <p>Acesso restrito a profissionais autorizados</p>
              <p>2026 OXYELIT - Fisioterapia respiratória</p>
          </div>

        </div>

        <div className="login-right">
          <svg viewBox="0 0 400 200" width="85%" opacity="0.25"
              xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 100 Q50 40 100 100 Q150 160 200 100 Q250 40 300 100 Q350 160 400 100"
              fill="none" stroke="white" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Login;