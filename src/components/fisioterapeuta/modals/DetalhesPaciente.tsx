import "../../../styles/fisioterapeuta/modalpacientesDetail.css"
import { CgClose } from "react-icons/cg";
import { useEffect, useState } from "react";
import {
    buscarDetalhesPaciente,
    DetalhesPacienteDados
} from "../../../database/services/detalhePaciente";
import {
    formatarDataHoraSQLite,
} from  "../../../utils/data"

type Props = {
    pacienteId: number
    onFechar: () => void;
    onIniciarSessao?: (pacienteId: number) => void;
}

function calcularIdade(dataNascimento: string | null): string {
    if (!dataNascimento) return "-";

    const nascimento = new Date(dataNascimento + "T00:00:00");
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    return `${idade} anos`;
}

function formatarGenero(genero: string | null): string {
    if (!genero) return "-";

    const generos: Record<string, string> = {
        masculino: "Masculino",
        feminino: "Feminino",
        outro: "Outro",
    };

    return generos[genero] ?? genero;
}

function formatarEvolucao(valor?: string | null): string {
  if (!valor) return "Sem dados suficientes";

  const textos: Record<string, string> = {
    melhora: "Melhora gradual",
    estavel: "Estável",
    piora: "Atenção",
    indefinida: "Indefinida",
  };

  return textos[valor] ?? valor;
}

function DetalhesPaciente({ pacienteId, onFechar, onIniciarSessao  }: Props) {
    const [dados, setDados] = useState<DetalhesPacienteDados | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    async function carregarDetalhes() {
        console.log("Paciente ID recebido no modal:", pacienteId);

        if (!pacienteId) {
            setErro("ID do paciente não informado.");
            setCarregando(false);
            return;
        }

        try {
            setCarregando(true);
            setErro('');

            const resultado = await buscarDetalhesPaciente(pacienteId);

            if (!resultado) {
                setErro("Paciente não encontrado.");
                setDados(null);
                return;
            }

            setDados(resultado);
        } catch (error) {
            console.error("Erro ao carregar detalhes do paciente:", error);
            setErro("Não foi possível carregar os detalhes do paciente.");
            setDados(null);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarDetalhes();
    }, [pacienteId]); 

    return (
        <div className="modal-overlay" onClick={onFechar}>
            <div className="modal lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        Detalhes {dados ? `— ${dados.nome}` : ""}
                    </h2>
                    <span onClick={onFechar}>
                        <CgClose />
                    </span>
                </div>

                <div className="modal-body">
                    {carregando && <p>Carregando detalhes...</p>}

                    {!carregando && erro && (<p className="modal-erro">{erro}</p>)}

                    {!carregando && dados && (
                        <>
                            <h3 className="titulo-dados">Dados do paciente</h3>
                            <div className="dados-row">
                                <div className="card-dado">
                                    <p>Nome completo</p>
                                    <span>{dados.nome}</span>
                                </div>

                                <div className="card-dado">
                                    <p>Idade</p>
                                    <span>{calcularIdade(dados.data_nascimento)}</span>
                                </div>

                                <div className="card-dado">
                                    <p>Gênero</p>
                                    <span>{formatarGenero(dados.genero)}</span>
                                </div>

                                <div className="card-dado">
                                    <p>Status</p>
                                    <span className={dados.ativo ? "span sucesso" : "span neutro"}>{dados.ativo ? "Ativo" : "Inativo"}</span>
                                </div>
                            </div>      

                            <h3>Resumo de sessão</h3>
                            <div className="dados-row">
                                <div className="card-dado">
                                    <p>Última sessão</p>
                                    <span>
                                        {dados.ultima_sessao ? formatarDataHoraSQLite(dados.ultima_sessao) : "Nenhuma"}
                                    </span>
                                </div>

                                <div className="card-dado">
                                    <p>Total de sessões</p>
                                    <span>{dados.total_sessoes}</span>
                                </div>

                                <div className="card-dado">
                                    <p>Evolução geral</p>
                                    <span className="span neutro">{formatarEvolucao((dados as any).evolucao_geral)}</span>
                                </div>

                                <div className="card-dado">
                                    <p>Sessão</p>
                                    <span className={dados.sessao_ativa_inicio ? "span sucesso" : "span neutro"}>
                                        {dados.sessao_ativa_inicio ? "Em andamento" : "Sem sessão ativa"}
                                    </span>
                                </div>  
                            </div>

                            <div className="dados">
                                <p>Última observação de sessão</p>
                                <div className="card-texto">
                                    <span>{dados.ultima_observacao ?? "Nenhuma observação registrada."}</span>
                                </div>

                                <p>Diagnóstico registrado</p>
                                <div className="card-texto">
                                    <span>{dados.diagnostico ?? "Nenhum diagnóstico informado."}</span> 
                                </div>    
                            </div>
                        </>  
                    )}             
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary-white" onClick={onFechar}>Fechar</button>
                    <button
                        className="btn btn-primary-white"
                        disabled={!dados || !!dados.sessao_ativa_inicio}
                        onClick={() => {
                            if (!dados) return;
                            onIniciarSessao?.(pacienteId)
                        }}
                    >
                        {dados?.sessao_ativa_inicio ? "Sessão em andamento" : "Iniciar Sessão"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DetalhesPaciente;