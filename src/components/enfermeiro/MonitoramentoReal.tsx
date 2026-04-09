
import "../../styles/enfermeiro/MonitoramentoReal.css";

interface VerMonitoramentoProps {
    nome: string;
    ie: string;
    fr: number;
    vpress: number;
    hpress: number;
    status: string;
    aoVoltar: () => void;
}

function VerMonitoramento({ nome, ie, fr, vpress, hpress, status, aoVoltar}: VerMonitoramentoProps) {
    // Simulando um estado de alerta para o protótipo
    // const [nivelAlerta, setNivelAlerta] = useState(3); // 1: OK, 2: Médio, 3: Crítico
    const handleAlerta = () => {
        if (status === "Estável") {
            return 1;
        } else if (status === "Atenção") {
            return 2;
        } else {
            return 3;
        }
    }

    return (
        <div className="ver-monitoramento">
            <header className={`monitor-header nivel-${handleAlerta()}`}>
                <button onClick={aoVoltar} className="btn-voltar">
                    ← Voltar para a lista
                </button>
                <h1 className='monitor-titulo'>Monitorando agora: {nome}</h1>
                <span className={`badge-status nivel-${handleAlerta()}`}>
                    {status}
                </span> 
            </header>

            {/* 2. BANNER DE ALERTA (Aparece se houver anomalia) */}
            {/* {nivelAlerta === 3 && (
                <div className="banner-emergencia">
                🚨 <strong>ALERTA NÍVEL 3:</strong> Apneia detectada ou Desconexão do sistema!
                </div>
            )} */}

            <div className="monitor-grid-principal">
                {/* 3. COLUNA DE SINAIS VITAIS (Cards Numeros Grandes) */}
                <aside className="vitor-vitais">
                    <div className={`card-vital nivel-${handleAlerta()}`}>
                        <label>FR (Frequência)</label>
                        <p className="valor">{fr} <span>rpm</span></p>
                    </div>
                    <div className={`card-vital nivel-${handleAlerta()}`}>
                        <label>Relação I:E</label>
                        <p className="valor">{ie}</p>
                    </div>
                    <div className={`card-vital nivel-${handleAlerta()}`}>
                        <label>Pressão de Pico</label>
                        <p className="valor">{hpress} <span>cmH₂O</span></p>
                    </div>
                    <div className={`card-vital nivel-${handleAlerta()}`}>
                        <label>Variação de Pressão (Esforço)</label>
                        <p className="valor">{vpress} <span>cmH₂O</span></p>
                    </div>
                </aside>

                {/* 4. ÁREA DO GRÁFICO (Onde a onda vai "correr") */}
                <section className="area-grafico">
                    <div className="grafico-placeholder">
                        {/* Aqui entrará a biblioteca de gráficos no futuro */}
                        <p>Gráfico de Pressão x Tempo (Onda Respiratória)</p>
                        <div className="linha-onda-fake"></div>
                    </div>
                    <div className="info-adicional">
                        <p><strong>Pressão Mínima:</strong> 5 cmH₂O (Vazamento: Não detectado)</p>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default VerMonitoramento;