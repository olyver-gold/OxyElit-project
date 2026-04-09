import { useState } from "react";
import "../../styles/medico/Relatorios.css";
import RelatorioModal from "./modal/RelatorioModal";

function Relatorios() {
    const [modalAberto, setModalAberto] = useState(false);

    return (
        <div className="relatorios">
            <div className="cards-rel">
                <div>
                    <span className="nometitulo">Paciente A - Relatorio de evolução</span>
                    <p className="origem">Enf. Joana · Hoje, 08:15</p>
                </div>
                <div>
                    <span className="status novo">Novo</span>
                    <button className="btn-ler" onClick={() => setModalAberto(true)}>Ler relatório</button>
                </div>
            </div>
            <div className="cards-rel">
                <div>
                    <span className="nometitulo">Paciente B - Relatorio de atenção</span>
                    <p className="origem">Enf. Joana · Ontem, 15:30</p>
                </div>
                <div>
                    <span className="status lido">Lido</span>
                    <button className="btn-ler" onClick={() => setModalAberto(true)}>Ler relatório</button>
                </div>
            </div>
            <div className="cards-rel">
                <div>
                    <span className="nometitulo">Paciente D - Relatorio de observação</span>
                    <p className="origem">Enf. Joana · 05/04/2026, 19:44</p>
                </div>
                <div>
                    <span className="status lido">Lido</span>
                    <button className="btn-ler" onClick={() => setModalAberto(true)}>Ler relatório</button>
                </div>
            </div>  
            <div className="cards-rel">
                <div>
                    <span className="nometitulo">Paciente C - Relatorio de evolução</span>
                    <p className="origem">Enf. Joana · 01/04/2026, 10:20</p>
                </div>
                <div>
                    <span className="status lido">Lido</span>
                    <button className="btn-ler" onClick={() => setModalAberto(true)}>Ler relatório</button>
                </div>
            </div>
            <div className="cards-rel">
                <div>
                    <span className="nometitulo">Paciente A - Relatorio de atenção</span>
                    <p className="origem">Enf. Joana · 30/03/2026, 07:18</p>
                </div>
                <div>
                    <span className="status lido">Lido</span>
                    <button className="btn-ler" onClick={() => setModalAberto(true)}>Ler relatório</button>
                </div>
            </div>  
            

            {modalAberto && (
                <RelatorioModal onFechar={() => setModalAberto(false)} />
            )}
        </div>

    );
}

export default Relatorios;