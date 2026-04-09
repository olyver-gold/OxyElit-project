import "../styles/HomeLogin.css";
import { useNavigate } from "react-router-dom";
import logo from "../assets/upOxyElit.png";
import imgcard from "../assets/card.png";

function Home(){
  const navigate = useNavigate();

  return (
    <div className="background container">
      <div className="login-card">
        <div className="login-left">
          <div className="logo">
            <img src={logo} alt="Logo OxyElit" />
            <div className="logo-textos">
              <h1>OXYELIT</h1>
              <p>Sistema inteligente de oxigenoterapia</p>
            </div>
          </div>
          <div className="descricao">
            <h2>Bem-vindo ao sistema OxyElit!</h2>
            <p>Selecione o tipo de usuário:</p>
          </div>
          <div className="button-container">
            <button onClick={()=> navigate("/login-med")}>Médico</button>
            <button onClick={()=> navigate("/login-enf")}>Enfermagem</button>
          </div>
          <div className="credits">
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

export default Home;
