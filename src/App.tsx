import { getDb } from "./database/db";
// import { useAuth } from "./contexts/AuthContext";
import { verificarSetup } from "./database/services/auth";
import { useEffect, useState } from "react";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import RotaProtegida from "./RotaProtegida";
import PrimeiroAcesso from "./pages/PrimeiroAcesso";
import Login from "./pages/Login";
import PageFisio from "./pages/PageFisio";

const SETUP_KEY = 'oxyelit_setup_feito';

function App() {
  const [setupFeito, setSetupFeito] = useState<boolean | null>(() => {
    const salvo = localStorage.getItem(SETUP_KEY);
    return salvo === 'true' ? true : null;
  });

  useEffect(() => {
    // se já sabe pelo localStorage, não consulta o banco
    if (setupFeito !== null) return;

    const inicializar = async () => {
      try {
        await getDb();                        // 1. abre o banco primeiro
        const feito = await verificarSetup(); // 2. só então verifica
        if (feito) localStorage.setItem(SETUP_KEY, 'true');
        setSetupFeito(feito);
      } catch (error) {
        console.error('Erro ao inicializar:', error);
        setSetupFeito(false);
      }
    };

    inicializar();
  }, []);
  
  const handleSetupConcluido = () => {
    localStorage.setItem(SETUP_KEY, 'true');
    setSetupFeito(true);
  };

  // enquanto verifica o banco, não renderiza nada
  if (setupFeito === null) return null;

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={ setupFeito ? <Navigate to="/login"/> : <Navigate to="/setup"/>} 
        />
        <Route path="/setup" element={<PrimeiroAcesso onConcluido={handleSetupConcluido} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app/*" 
          element={
            <RotaProtegida>
              <PageFisio />
            </RotaProtegida>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;