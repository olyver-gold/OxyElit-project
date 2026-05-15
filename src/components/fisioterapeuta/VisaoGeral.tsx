import "../../styles/fisioterapeuta/visaogeral.css";
import { LuTriangleAlert } from "react-icons/lu";
import { PiMonitor } from "react-icons/pi";
// import { FaRegCheckCircle } from "react-icons/fa";

import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  buscarDadosVisaoGeral,
  buscarResumoClinicoPaciente,
  ResumoClinicoPaciente,
  DadosVisaoGeral,
} from "../../database/services/visaogeral";
// import {
//   buscarSessaoAtivaPorFisioterapeuta,
//   Sessao,
// } from '../../database/services/sessoes';

import { formatarDataSQLite } from "../../utils/data";
import GraficoPressao   from "../compartilhado/GraficoPressao";
// import Alerta         from "../compartilhado/Alertas";

function calcularTempoSessao(inicio: string, agora: Date) {
  const inicioData = new Date(inicio);

  const diferencaMs = agora.getTime() - inicioData.getTime();
  const totalSegundos = Math.max(0, Math.floor(diferencaMs / 1000));

  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;

  return `${minutos}min ${segundos.toString().padStart(2, "0")}s`;
}

function formatarTendencia(tendencia: string | null) {
  if (!tendencia) return "Sem dados suficientes";

  const mapa: Record<string, string> = {
    melhora: "Melhora gradual",
    estavel: "Estável",
    atencao: "Requer atenção",
    piora: "Piora",
    indefinida: "Indefinida",
  };

  return mapa[tendencia] ?? tendencia;
}

function VisaoGeral({ onNavegar }: { onNavegar: (pagina: number) => void }) {
  const dataHoje = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' 
  }); 

  const { usuario } = useAuth();
  const [dados, setDados] = useState<DadosVisaoGeral>({
    sessoesHoje: 0,
    pacientesAtivos: 0,
    pacientesComSessaoHoje: 0,
    alertasAtivos: 0,
    sessaoAtiva: null,
  });

  const [resumoClinico, setResumoClinico] = useState<ResumoClinicoPaciente>({
    ultima_sessao: null,
    total_sessoes: 0,
    tendencia: null,
    observacao: null,
  });

  const [carregando, setCarregando] = useState(true);
  const [agora, setAgora] = useState(new Date());
  
  const sessaoAtiva = dados.sessaoAtiva;

  const iniciais = sessaoAtiva?.paciente_nome
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '??';

  async function carregarDados() {
    if (!usuario) {
      setDados({
        sessoesHoje: 0,
        pacientesAtivos: 0,
        pacientesComSessaoHoje: 0,
        alertasAtivos: 0,
        sessaoAtiva: null,
      });

      setResumoClinico({
        ultima_sessao: null,
        total_sessoes: 0,
        tendencia: null,
        observacao:null
      })

      return;
    }

    try {
      setCarregando(true);

      const resultado = await buscarDadosVisaoGeral(usuario.id);
      console.log("Dados da visão geral:", resultado);

      setDados(resultado);

      if (resultado.sessaoAtiva) {
        const resumo = await buscarResumoClinicoPaciente(
          resultado.sessaoAtiva.paciente_id
        );

        setResumoClinico(resumo);
      } else {
        setResumoClinico({
          ultima_sessao: null,
          total_sessoes: 0,
          tendencia: null,
          observacao: null,
        });
      }
    } catch (e) {
      console.error("Erro ao carregar dados da visão geral:", e);

      setDados({
        sessoesHoje: 0,
        pacientesAtivos: 0,
        pacientesComSessaoHoje: 0,
        alertasAtivos: 0,
        sessaoAtiva: null,
      });

      setResumoClinico({
        ultima_sessao: null,
        total_sessoes: 0,
        tendencia: null,
        observacao:null
      })
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (!usuario) {
      setCarregando(false);
      return;
    }

    carregarDados();
  }, [usuario]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="visao-geral">

      <div className="visao-header">
        <div>
          <h2>Visão Geral</h2>
          <span>{dataHoje}</span>
        </div>
        <button className="btn btn-primary-blue" onClick={() => onNavegar(2)}>
          + Nova Sessão
        </button>
      </div>

      <div className="visao-conteudo">

        <div className="metric-cards-row">
          <div className="metric-card">
            <span className="mc-title">Sessões Hoje</span>
            <span className="mc-value">{dados.sessoesHoje}</span>
            {sessaoAtiva ? (
              <span className="mc-sub ok">1 em andamento</span>
            ) : (
              <span className="mc-sub muted">Nenhuma em andamento</span>
            )}
              
          </div>
          <div className="metric-card">
            <span className="mc-title">Pacientes ativos</span>
            <span className="mc-value">{dados.pacientesAtivos}</span>
            <span className="mc-sub muted">{dados.pacientesComSessaoHoje} com sessão hoje</span>
          </div>
          {sessaoAtiva ? (
            <div className="metric-card">
              <span className="mc-title">Alertas ativos</span>
              <span className="mc-value warn">-</span>
              <span className="mc-sub warn">Monitorando parâmetros</span>
            </div>
          ) : (
            <div className="metric-card">
              <span className="mc-title">Alertas ativos</span>
              <span className="mc-value ok">-</span>
              <span className="mc-sub ok">Nenhum alerta</span>
            </div>
          )}
          <div className="metric-card">
            <span className="mc-title">Evolução Geral</span>
            <span className="mc-value">-</span>
            <span className="mc-sub muted">Vs. sessão anterior</span>
          </div>
        </div>

        <div className="visao-grid">

          {sessaoAtiva ? (
            <div className="card-sessao">
              
              <div className="card-header">
                <span className="card-titulo">Sessão ativa</span>
                <div className="status-ativa">
                  <span className="dot-ativo"></span>
                  Em andamento · {calcularTempoSessao(sessaoAtiva.inicio, agora)}
                </div>
              </div>

              <div className="sessao-paciente">
                <div className="avatar-paciente">{iniciais}</div>
                <div className="sessao-paciente-info">
                  <strong>{sessaoAtiva.paciente_nome}</strong>
                  <span>
                    {(sessaoAtiva.diagnostico ?? "Sem diagnóstico informado").length > 30
                      ? (sessaoAtiva.diagnostico ?? "Sem diagnóstico informado").substring(0, 27) + "..."
                      : (sessaoAtiva.diagnostico ?? "Sem diagnóstico informado")
                    } · FR alvo: {sessaoAtiva.fr_min ?? "--"} - {sessaoAtiva.fr_max ?? "--"} rpm
                  </span>
                </div>
                <button 
                  className="btn btn-secondary-white"
                  onClick={() => onNavegar(2)}
                >
                  Ver monitor
                </button>
              </div>

              <div className="sessao-metricas">
                <div className="sessao-metrica">
                  <span className="sm-label">FR atual</span>
                  <span className="sm-value ok">16</span>
                  <span className="sm-unit">rpm</span>
                </div>
                <div className="sessao-metrica">
                  <span className="sm-label">Razão I:E</span>
                  <span className="sm-value ok">1:2</span>
                  <span className="sm-unit">normal</span>
                </div>
                <div className="sessao-metrica">
                  <span className="sm-label">Ti / Te</span>
                  <span className="sm-value ok">1.2s</span>
                  <span className="sm-unit">2.4s</span>
                </div>
                <div className="sessao-metrica">
                  <span className="sm-label">P. média</span>
                  <span className="sm-value ok">3.2</span>
                  <span className="sm-unit">cmH₂O</span>
                </div>
              </div>

              <div className="waveform-box">
                <GraficoPressao 
                  leituras={[0, 0.5, -0.3, 0.8, -0.1, 0.2, -0.4, 0.6, -0.2, 0.1]} 
                  altura={100} 
                  mostrarControles={false} 
                />
              </div>
            </div>

          ) : (
            <div className="card-vazio">
              <PiMonitor className="monitor-icon"/>
              <p>Nenhuma sessão em andamento</p>
              <span>Clique em "Nova sessão" para iniciar</span>
              <div>
                <button 
                  className="btn btn-outline"
                  onClick={() => onNavegar(2)}
                >
                  Nova sessão
                </button>
              </div>
            </div>
          )}
          
          {sessaoAtiva ? (
            <div className="visao-col-direita">
              <div className="card-alerta">
                <div>
                  <div className="alerta-header">
                    <LuTriangleAlert className="alert"/>
                    <span>Alerta de parâmetro</span>
                  </div>
                  <p>João Silva · FR acima do esperado nas últimas 3 leituras (21 rpm). Verifique o ajuste da válvula.</p>
                </div>
                <button className="btn btn-outline" style={{ width: '100%' }}>
                  Registrar ajuste
                </button>
              </div>

              <div className="card-resumo">
                <span className="resumo-titulo">Resumo clínico</span>
                <div className="resumo-lista">
                  <div className="resumo-item">
                    <span className="resumo-label">Última sessão</span>
                    <span className="resumo-valor muted">
                      {resumoClinico.ultima_sessao 
                        ? formatarDataSQLite(resumoClinico.ultima_sessao)
                        : "Nenhuma"}
                    </span>
                  </div>
                  <div className="resumo-item">
                    <span className="resumo-label">Total de sessões</span>
                    <span className="resumo-valor">{resumoClinico.total_sessoes} sessões</span>
                  </div>
                  <div className="resumo-item">
                    <span className="resumo-label">Tendência</span>
                    <span className="resumo-valor ok">{formatarTendencia(resumoClinico.tendencia)}</span>
                  </div>
                  <div className="resumo-item">
                    <span className="resumo-label">Observação</span>
                    <span className="resumo-valor">{resumoClinico.observacao ?? "Nenhuma observação registrada"}</span>
                  </div>
                </div>
              </div>

              <div className="card-log">
                <span className="card-log-titulo">Log da sessão</span>
                <div className="log-lista">
                  <div className="log-item">
                    <span className="log-hora">08:04</span>
                    <span className="log-texto">Início da sessão</span>
                  </div>
                  <div className="log-item">
                    <span className="log-hora">08:17</span>
                    <span className="log-texto warn">FR elevada detectada</span>
                  </div>
                  <div className="log-item">
                    <span className="log-hora">08:30</span>
                    <span className="log-texto">Ajuste da válvula</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="visao-col-direita">
              <div className="card-resumo vazio">
                <span className="resumo-titulo">Resumo clínico</span>
                <div className="resumo-lista">
                  <div className="resumo-item">
                    <span className="resumo-label">Última sessão</span>
                    <span className="resumo-valor muted">-</span>
                  </div>
                  <div className="resumo-item">
                    <span className="resumo-label">Total de sessões</span>
                    <span className="resumo-valor">-</span>
                  </div>
                  <div className="resumo-item">
                    <span className="resumo-label">Tendência</span>
                    <span className="resumo-valor ok">-</span>
                  </div>
                  <div className="resumo-item">
                    <span className="resumo-label">Observação</span>
                    <span className="resumo-valor">-</span>
                  </div>
                </div>
              </div>

              <div className="card-log vazio">
                <span className="card-log-titulo">Log da sessão</span>
                <div className="log-lista">
                  <div className="log-item">
                    <span className="log-hora">-</span>
                    <span className="log-texto">Nenhum log disponível</span>
                  </div>
                </div>
              </div>
            </div>
          )}
            

        </div>
      </div>
    </div>
  );
}

export default VisaoGeral;