import "../../styles/fisioterapeuta/visaogeral.css";
import { PiMonitor } from "react-icons/pi";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  buscarDadosVisaoGeral,
  buscarResumoClinicoPaciente,
  ResumoClinicoPaciente,
  DadosVisaoGeral,
} from "../../database/services/visaogeral";
import Alertas from "../compartilhado/Alertas";
import {
  AlertaSessao,
  listarAlertasNaoResolvidosSessao,
} from "../../database/services/alertasSessao";
import { useSensor } from "../../contexts/SensorContext";
import { processarMetricasRespiratorias } from "../../services/processarMetRespiratorias";
import GraficoPressao   from "../compartilhado/GraficoPressao";
import { formatarDataSQLite } from "../../utils/data";
import { calcularDuracaoSessao } from "../../utils/data";

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

function formatarRazaoIE(valorIE: number | null): string {
  if (valorIE === null || valorIE <= 0) return "--";
  
  if (valorIE < 1) {
    // Padrão normal (fisiológico)
    return `1:${(1 / valorIE).toFixed(1)}`;
  } else {
    // Padrão invertido (comum nos testes de bancada)
    return `${valorIE.toFixed(1)}:1`;
  }
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

  const {
    leiturasSensor,
    // ultimaLeitura,
    // mqttConectado,
    // statusSensor,
    // erroSensor,
    // conectarMqtt,
    // desconectarMqtt,
    // limparLeituras,
  } = useSensor();

  const metricasRespiratorias = useMemo(() => {
    return processarMetricasRespiratorias(leiturasSensor);
  }, [leiturasSensor]);

  const [alertasSessao, setAlertasSessao] = useState<AlertaSessao[]>([]);

  const [_carregando, setCarregando] = useState(true);
  const [agora, setAgora] = useState(new Date());
  
  const sessaoAtiva = dados.sessaoAtiva;

  const duracaoSessaoAtiva = sessaoAtiva
    ? calcularDuracaoSessao(sessaoAtiva.inicio)
    : "0min 00s";

  void agora;

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
        
        const alertas = await listarAlertasNaoResolvidosSessao (
          resultado.sessaoAtiva.id
        )

        setAlertasSessao(alertas);
        setResumoClinico(resumo);
      } else {
        setResumoClinico({
          ultima_sessao: null,
          total_sessoes: 0,
          tendencia: null,
          observacao: null,
        });
        setAlertasSessao([]);
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

      setAlertasSessao([]);
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
        {sessaoAtiva ? (
          <button 
            className="btn btn-red"
            onClick={() => onNavegar(2)}
          >
            Encerrar sessão
          </button>
        ) : (
          <button 
            className="btn btn-primary-blue"
            onClick={() => onNavegar(2)}
          >
            + Nova sesssão
          </button>
          
        )}
          
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
              <span className={dados.alertasAtivos > 0 ? "mc-value warn" : "mc-value ok"}>
                {dados.alertasAtivos > 0 ? dados.alertasAtivos : "-"}
              </span>
              
              <span className={dados.alertasAtivos > 0 ? "mc-sub warn" : "mc-sub ok"}>
                {dados.alertasAtivos > 0 ? "Requer atenção" : "Monitorando parâmetros"}
              </span>
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
                  Em andamento · {duracaoSessaoAtiva}
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
                  <span className="sm-value ok">
                    {metricasRespiratorias.frAtual !== null
                      ? metricasRespiratorias.frAtual.toFixed(0)
                      : "--"}
                  </span>
                  <span className="sm-unit">rpm</span>
                </div>
                <div className="sessao-metrica">
                  <span className="sm-label">Razão I:E</span>
                  <span className="sm-value ok">
                    {formatarRazaoIE(metricasRespiratorias.ieMedia)}
                  </span>
                  <span className="sm-unit">{metricasRespiratorias.ieMedia !== null ? "estimada" : "aguardando"}</span>
                </div>
                <div className="sessao-metrica">
                  <span className="sm-label">Ti / Te</span>
                  <span className="sm-value ok">{metricasRespiratorias.tiMedio !== null
                    ? `${metricasRespiratorias.tiMedio.toFixed(1)}s`
                    : "--"}
                  </span>
                  <span className="sm-unit">
                    {metricasRespiratorias.teMedio !== null
                      ? `Te: ${metricasRespiratorias.teMedio.toFixed(1)}s`
                      : "Te: --"}
                  </span>
                </div>
                <div className="sessao-metrica">
                  <span className="sm-label">P. média</span>
                  <span className="sm-value ok">
                    {metricasRespiratorias.pressaoMedia !== null
                      ? metricasRespiratorias.pressaoMedia.toFixed(1)
                      : "--"}
                  </span>
                  <span className="sm-unit">cmH₂O</span>
                </div>
              </div>

              <div className="waveform-box">
                <GraficoPressao 
                  leituras={leiturasSensor.map((leitura) => leitura.pressao)} 
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
              <Alertas
                alertas={alertasSessao}
                modo="resumo"
                titulo="Alerta da sessão"
                onVerMonitor={() => onNavegar(2)}
              />

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