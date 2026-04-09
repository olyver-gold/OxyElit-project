import "../../styles/enfermeiro/Monitoramento.css";
import { DadosPaciente } from "../../pages/PageEnf";

// const pacientes: Detalhes[] = [
//     { id: 1, nome: "Paciente A", ie: "1:2", fr: 15, vpress: 10, hpress: 15 },
//     { id: 2, nome: "Paciente B", ie: "0:0", fr: 0, vpress: 1, hpress: 5 },
//     { id: 3, nome: "Paciente C", ie: "2:2", fr: 22, vpress: 15, hpress: 17 },
//     { id: 4, nome: "Paciente D", ie: "1:1", fr: 18, vpress: 11, hpress: 15 }
// ]

interface MonitoramentoProps {
    aoSelecionarPaciente: (dados: DadosPaciente) => void;
}

function Monitoramento({ aoSelecionarPaciente}: MonitoramentoProps) {

    return(
        <div className="monitoramento">
            <h1>Ordenado por nível de emergência:</h1>
            <div className="cards-row">

                <div className="card-paciente" onClick={()=> aoSelecionarPaciente({nome: "Paciente B", ie: "0:0", fr: 0, vpress: 1, hpress: 5, status: "Crítico"})}>
                    <div className="lateral-esq danger"></div>
                    <div className="card-conteudo">
                        <div className="card-header">
                            <span className="nome">Paciente B</span>
                            <span className="status danger">Crítico</span>
                        </div>
                        <span className="analise danger">Pressão próxima a zero, possível desconexão.</span>
                        <p className="info"><strong>Média recente</strong> de FR: <strong>0</strong> rpm.</p>
                        <p className="clique">Clique para acessar o monitoramento</p>
                    </div>
                </div>

                <div className="card-paciente" onClick={()=> aoSelecionarPaciente({nome: "Paciente C", ie: "2:2", fr: 22, vpress: 15, hpress: 17, status: "Atenção"})}>
                    <div className="lateral-esq warn"></div>
                    <div className="card-conteudo">
                        <div className="card-header">
                            <span className="nome">Paciente C</span>
                            <span className="status warn">Atenção</span>
                        </div>
                        <span className="analise warn">Esforço respiratório elevado e recorrente.</span>
                        <p className="info"><strong>Média recente</strong> de FR: <strong>22</strong> rpm.</p>
                        <p className="clique">Clique para acessar o monitoramento</p>
                    </div>
                </div>

                <div className="card-paciente"onClick={()=> aoSelecionarPaciente({nome: "Paciente A", ie: "1:2", fr:  15, vpress: 10, hpress: 15, status: "Estável"})}>
                    <div className="lateral-esq ok"></div>
                    <div className="card-conteudo">
                        <div className="card-header">
                            <span className="nome">Paciente A</span>
                            <span className="status ok">Estável</span>
                        </div>
                        <span className="analise ok">Análises recentes dentro dos parâmetros.</span>
                        <p className="info"><strong>Média recente</strong> de FR: <strong>18</strong> rpm.</p>
                        <p className="clique">Clique para acessar o monitoramento</p>
                    </div>
                </div>

                <div className="card-paciente" onClick={()=> aoSelecionarPaciente({nome: "Paciente D", ie: "1:1", fr: 18, vpress: 11, hpress: 15, status: "Estável"})}>
                    <div className="lateral-esq ok"></div>
                    <div className="card-conteudo">
                        <div className="card-header">
                            <span className="nome">Paciente D</span>
                            <span className="status ok">Estável</span>
                        </div>
                        <span className="analise ok">Análises recentes dentro dos parâmetros.</span>
                        <p className="info"><strong>Média recente</strong> de FR: <strong>15</strong> rpm.</p>
                        <p className="clique">Clique para acessar o monitoramento</p>
                    </div>
                </div>

            </div>

        </div>
    )
}

export default Monitoramento;