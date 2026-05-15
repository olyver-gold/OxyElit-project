import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import RotaProtegida from "./RotaProtegida";
import Login from "./pages/Login";
import PageAdmin from "./pages/PageAdmin";
import PageFisio from "./pages/PageFisio";
// import PageTecnico from "./pages/PageTecnico";
import { getDb } from "./database/db";
import { useEffect } from "react";


function App() {
  useEffect(() => {
    // Inicializa o banco de dados quando o aplicativo for carregado
    getDb().then(db => {
      console.log("Banco de dados inicializado:", db);
    }).catch(error => {
      console.error("Erro ao inicializar o banco de dados:", error);
    });
  }, []);
  
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/page-admin" 
          element={
            <RotaProtegida>
              <PageAdmin />
            </RotaProtegida>
          } 
        />
        <Route path="/page-fisio" 
          element={
            <RotaProtegida>
              <PageFisio />
            </RotaProtegida>
          } 
        />
        {/* <Route path="/page-tecnico" element={<RotaProtegida><PageTecnico /></RotaProtegida>} /> */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;