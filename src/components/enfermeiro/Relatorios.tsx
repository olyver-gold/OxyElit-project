import "../../styles/enfermeiro/Relatorios.css";
import RelatorioModal from "./modal/RelatorioModal";
import { useState } from "react";
import RelModalEsc from "./modal/RelModalEsc";

function Relatorios() {
    const [modalAberto, setModalAberto] = useState(false);
    const [modalEscrever, setModalEscrever] = useState(false);

    return(
        <div className="relatorios">
            <div className="top-row">
                <button className="btn-escrever" onClick={() => setModalEscrever(true)}>
                    + Escrever Relatório
                </button>
            </div>
            <div className="cards-rel">
                <div>
                    <span className="nometitulo">Paciente A - Relatorio de evolução</span>
                    <p className="origem">Para Dr. Evaristo · Hoje, 08:15</p>
                </div>
                <button className="btn-ver" onClick={() => setModalAberto(true)}>
                    Ver relatório
                </button>
            </div>
            <div className="cards-rel">
                <div>
                    <span className="nometitulo">Paciente B - Relatorio de atenção</span>
                    <p className="origem">Para Dr. Evaristo · Ontem, 15:30</p>
                </div>
                <button className="btn-ver" onClick={() => setModalAberto(true)}>
                    Ver relatório
                </button>
            </div>
            <div className="cards-rel">
                <div>
                    <span className="nometitulo">Paciente D - Relatorio de observação</span>
                    <p className="origem">Para Dr. Evaristo · 05/04/2026, 19:44</p>
                </div>
                <button className="btn-ver" onClick={() => setModalAberto(true)}>
                    Ver relatório
                </button>
            </div>
            <div className="cards-rel">
                <div>
                    <span className="nometitulo">Paciente C - Relatorio de evolução</span>
                    <p className="origem">Para Dr. Evaristo · 01/04/2026, 10:20</p>
                </div>
                <button className="btn-ver" onClick={() => setModalAberto(true)}>
                    Ver relatório
                </button>
            </div>
            <div className="cards-rel">
                <div>
                    <span className="nometitulo">Paciente A - Relatorio de atenção</span>
                    <p className="origem">Para Dr. Evaristo · 30/03/2026, 07:18</p>
                </div>
                <button className="btn-ver" onClick={() => setModalAberto(true)}>
                    Ver relatório
                </button>
            </div>

            {modalAberto && (
                <RelatorioModal onFechar={() => setModalAberto(false)} />
            )}
            {modalEscrever && (
                <RelModalEsc onFechar={() => setModalEscrever(false)} />
            )}
        </div>
    )
}

export default Relatorios;