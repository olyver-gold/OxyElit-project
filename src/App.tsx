import { HashRouter, Route, Routes} from "react-router-dom";
import LoginMed from "./pages/LoginMed";
import LoginEnf from "./pages/LoginEnf";
import PageEnf from "./pages/PageEnf";
import PageMed from "./pages/PageMed";
import Home from "./pages/Home";

function App(){
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login-med" element={<LoginMed />} />
        <Route path="/login-enf" element={<LoginEnf />} />
        <Route path="/page-enf" element={<PageEnf />} />
        <Route path="/page-med" element={<PageMed />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
