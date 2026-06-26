import "../../styles/fisioterapeuta/monitoramento.css";
import { useEffect, useState, useRef } from "react"; // ADICIONADO useRef
import { useAuth } from "../../contexts/AuthContext";
import {
  Sessao,
  iniciarSessao,
  encerrarSessao,
  buscarSessaoAtivaPorFisioterapeuta,
  debugValidarIds
} from "../../database/services/sessoes";
import { Paciente , listarPacientesPorFisioterapeuta} from "../../database/services/pacientes";
import Alertas from "../compartilhado/Alertas";
import {
  AlertaSessao,
  listarAlertasSessao,
  ignorarAlertaSessao,
  resolverAlertaSessao,
} from "../../database/services/alertasSessao";
import { registrarLogSessao } from "../../database/services/logsSessao";
import { registrarAjusteValvula } from "../../database/services/ajustesValvula";
import { criarParametrosAlvoSessao } from "../../database/services/parametros";
import { useSensor } from "../../contexts/SensorContext";
import { processarMetricasRespiratorias } from "../../services/processarMetRespiratorias";
import { salvarMetricasSessao } from "../../database/services/metricasSessao";
import { salvarAvaliacaoClinicaSessao } from "../../database/services/avaliacaoSessao";
import { calcularScoreEvolucaoSessao } from "../../services/calcularScore";
import ModalEncerramento, { DadosAvaliacaoFinal } from "./modals/ModalEncerramento";
import { formatarDataHoraSQLite } from "../../utils/data";
import { calcularDuracaoSessao } from "../../utils/data";

import GraficoPressao from "../compartilhado/GraficoPressao";

type Props = {
  pacientePreSelecionadoId?: number | null;
}

function gerarIniciais(nome: string): string {
  if (!nome) return "??";

  const partes = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) return "??";

  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase();
  }

  const primeira = partes[0][0];
  const segunda = partes[1][0];

  return `${primeira}${segunda}`.toUpperCase();
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

function Monitoramento({ pacientePreSelecionadoId }: Props) {
  const { usuario } = useAuth();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);

  const [frMin, setFrMin] = useState("");
  const [frMax, setFrMax] = useState("");

  const [ieInspiracao, setIeInspiracao] = useState("1");
  const [ieExpiracao, setIeExpiracao] = useState("2");

  const [pressaoMin, setPressaoMin] = useState("");
  const [pressaoMax, setPressaoMax] = useState("");

  const [carregandoSessao, setCarregandoSessaoAtiva] = useState(true);
  const [observacoesSessao, setObservacoesSessao] = useState("");
  const [sessaoAtiva, setSessaoAtiva] = useState<Sessao | null>(null);
  const [_sessaoEncerradaId, setSessaoEncerradaId] = useState<number | null>(null);

  const [alertasSessao, setAlertasSessao] = useState<AlertaSessao[]>([]);
  const [agora, setAgora] = useState(new Date());

  const {
    leiturasSensor,
    mqttConectado,
    statusSensor,
    conectarMqtt,
    desconectarMqtt,
    limparLeituras,
    iniciarSessao: iniciarSessaoContexto,
    encerrarSessao: encerrarSessaoContexto,
  } = useSensor();

  // CORREÇÃO DE DESEMPENHO: Otimização de CPU para não congelar os painéis
  const [metricasRespiratorias, setMetricasRespiratorias] = useState(() => processarMetricasRespiratorias([]));
  const leiturasRef = useRef(leiturasSensor);

  // Mantém a referência atualizada a 20Hz silenciosamente
  useEffect(() => {
    leiturasRef.current = leiturasSensor;
  }, [leiturasSensor]);

  // Executa a matemática pesada apenas 1 vez por segundo
  useEffect(() => {
    const intervaloMatematica = setInterval(() => {
      setMetricasRespiratorias(processarMetricasRespiratorias(leiturasRef.current));
    }, 1000);

    return () => clearInterval(intervaloMatematica);
  }, []);

  const duracaoSessaoAtiva = sessaoAtiva
    ? calcularDuracaoSessao(sessaoAtiva.inicio)
    : "0min 00s";

  void agora;

  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modalEncerramentoAberto, setModalEncerramentoAberto] = useState(false);

  const [salvandoEncerramento, setSalvandoEncerramento] = useState(false);

  async function carregarDadosIniciais() {
    if (!usuario) {
      setSessaoAtiva(null);
      setPacienteSelecionado(null);
      setPacientes([]);
      setCarregandoSessaoAtiva(false);
      return;
    }

    try {
      setCarregandoSessaoAtiva(true);

      const pacientesDoFisio = await listarPacientesPorFisioterapeuta(usuario.id);
      setPacientes(pacientesDoFisio);
      
      const sessao = await buscarSessaoAtivaPorFisioterapeuta(usuario.id);
      setSessaoAtiva(sessao);

      if (sessao) {
        const pacienteDaSessao = pacientesDoFisio.find(
          (p) => p.id === sessao.paciente_id
        );

        setPacienteSelecionado(pacienteDaSessao ?? null);
      } else {
        setPacienteSelecionado(null);
      }

      if (pacientePreSelecionadoId) {
        const pacientePreSelecionado = pacientesDoFisio.find(
          (p) => p.id === pacientePreSelecionadoId
        );

        if (pacientePreSelecionado) {
          setPacienteSelecionado(pacientePreSelecionado);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados iniciais do monitoramento:", error);
      setSessaoAtiva(null);
      setPacienteSelecionado(null);
    } finally {
      setCarregandoSessaoAtiva(false);
    }
  }

  async function carregarAlertas(sessaoId: number) {
    const alertas = await listarAlertasSessao(sessaoId);
    setAlertasSessao(alertas);
  }

  useEffect(() => {
    carregarDadosIniciais();
  }, [usuario, pacientePreSelecionadoId]);
  
  useEffect(() => {
    if (!sessaoAtiva) return;

    carregarAlertas(sessaoAtiva.id);
  }, [sessaoAtiva]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  function numeroOuUndefined(valor: string): number | undefined {
    if (valor.trim() === "") return undefined;
    return Number(valor);
  }

  function valorOuTraco(valor: number | null | undefined) {
    return valor !== null && valor !== undefined ? valor : "--";
  }

  function validarParametros() {
    if (!pacienteSelecionado) {
      alert("Selecione um paciente.");
      return false;
    }

    if (!frMin || !frMax) {
      alert("Informe a faixa de frequência respiratória.");
      return false;
    }

    if (!ieInspiracao || !ieExpiracao) {
      alert("Informe a razão I:E alvo.");
      return false;
    }

    if (!pressaoMin || !pressaoMax) {
      alert("Informe a faixa de pressão.");
      return false;
    }

    const frMinNum = numeroOuUndefined(frMin);
    const frMaxNum = numeroOuUndefined(frMax);
    const pressaoMinNum = numeroOuUndefined(pressaoMin);
    const pressaoMaxNum = numeroOuUndefined(pressaoMax);

    if (frMinNum !== undefined && frMaxNum !== undefined && frMinNum > frMaxNum) {
      alert("A FR mínima não pode ser maior que a FR máxima.");
      return false;
    }

    if (
      pressaoMinNum !== undefined &&
      pressaoMaxNum !== undefined &&
      pressaoMinNum > pressaoMaxNum
    ) {
      alert("A pressão mínima não pode ser maior que a pressão máxima.");
      return false;
    }

    return true;
  }

  async function handleIniciarSessao() {
    if (!usuario) {
      alert("Usuário não autenticado");
      return;
    }
    if (usuario.papel !== "fisioterapeuta") {
      alert("Apenas fisioterapeutas podem iniciar sessões");
      return;
    }
    if (!pacienteSelecionado) {
      alert("Selecione um paciente para iniciar a sessão");
      return;
    }
    if (!validarParametros()) {
      return;
    }

    try {
      setCarregando(true);

      console.log("USUÁRIO:", usuario);
      console.log("PACIENTE:", pacienteSelecionado);

      if (!usuario?.id) {
        throw new Error("Usuário logado sem ID válido.");
      }

      if (!pacienteSelecionado?.id) {
        throw new Error("Paciente selecionado sem ID válido.");
      }
       
      await debugValidarIds(usuario.id, pacienteSelecionado.id);

      console.log("Criando parâmetros...");

      const prescricaoId = await criarParametrosAlvoSessao({
        paciente_id: pacienteSelecionado.id,
        fr_min: Number(frMin),
        fr_max: Number(frMax),
        ie_inspiracao: Number(ieInspiracao),
        ie_expiracao: Number(ieExpiracao),
        pressao_min: Number(pressaoMin),
        pressao_max: Number(pressaoMax),
        observacoes: observacoesSessao.trim() || undefined,
        criado_por: usuario.id,
      });

      console.log("PRESCRIÇÃO CRIADA:", prescricaoId);

      if (!prescricaoId || prescricaoId <= 0) {
        throw new Error("ID da prescrição inválido. A sessão não será iniciada.");
      }

      console.log("Criando sessão...");

      const novaSessao = await iniciarSessao(
        pacienteSelecionado.id,
        usuario.id,
        prescricaoId,
        observacoesSessao
      );

      console.log("SESSÃO CRIADA:", novaSessao);

      limparLeituras();
      setSessaoAtiva(novaSessao);

      if (novaSessao && novaSessao.id) {
        iniciarSessaoContexto(novaSessao.id);
      }
    } catch (error) {
      console.error("ERRO COMPLETO AO INICIAR SESSÃO:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(JSON.stringify(error));
      }
    } finally {
      setCarregando(false);
    }
  }

  async function handleRegistrarAjuste(alerta: AlertaSessao) {
    if (!usuario) {
      alert("Usuário não autenticado.");
      return;
    }

    const observacao = window.prompt("Descreva o ajuste realizado:");

    if (!observacao?.trim()) return;

    try {
      await registrarAjusteValvula({
        sessaoId: alerta.sessao_id,
        usuarioId: usuario.id,
        observacao: observacao.trim(),
      });

      await resolverAlertaSessao(alerta.id);

      await registrarLogSessao(
        alerta.sessao_id,
        "ajuste",
        `Ajuste registrado para alerta: ${alerta.mensagem}`
      );

      await carregarAlertas(alerta.sessao_id);
    } catch (error) {
      console.error("Erro ao registrar ajuste:", error);
      alert("Não foi possível registrar o ajuste.");
    }
  }

  async function handleIgnorarAlerta(alerta: AlertaSessao) {
    const confirmar = window.confirm("Deseja ignorar este alerta?");

    if (!confirmar) return;

    try {
      await ignorarAlertaSessao(alerta.id);

      await registrarLogSessao(
        alerta.sessao_id,
        "alerta",
        `Alerta ignorado: ${alerta.mensagem}`
      );

      await carregarAlertas(alerta.sessao_id);
    } catch (error) {
      console.error("Erro ao ignorar alerta:", error);
      alert("Não foi possível ignorar o alerta.");
    }
  }
  
  function handleSolicitarEncerramento() {
    if (!usuario) {
      alert("Usuário não autenticado.");
      return;
    }

    if (!sessaoAtiva) {
      alert("Nenhuma sessão ativa para encerrar.");
      return;
    }

    if (metricasRespiratorias.totalCiclos < 3) {
      alert(
        "Ainda não há ciclos respiratórios suficientes para consolidar os dados da sessão."
      );
      return;
    }

    setModalEncerramentoAberto(true);
  }

  async function handleConfirmarEncerramento( avaliacao: DadosAvaliacaoFinal ) {
    if (!usuario) {
      alert("Usuário não autenticado.");
      return;
    }

    if (!sessaoAtiva) {
      alert("Nenhuma sessão ativa encontrada.");
      return;
    }

    if (metricasRespiratorias.totalCiclos < 3) {
      alert(
        "A sessão ainda não possui ciclos respiratórios suficientes para calcular as métricas."
      );
      return;
    }

    try {
      setSalvandoEncerramento(true);

      const idEncerrado = sessaoAtiva.id;

      const frMinAlvo = sessaoAtiva.fr_min ?? null;
      const frMaxAlvo = sessaoAtiva.fr_max ?? null;
      const ieInspiracaoAlvo = sessaoAtiva.ie_inspiracao ?? null;
      const ieExpiracaoAlvo = sessaoAtiva.ie_expiracao ?? null;

      // FUNÇÃO DE PROTEÇÃO: Garante que valores inválidos ou NaN virem null para o banco
      const tratarNumero = (valor: any) => {
        const num = Number(valor);
        return Number.isNaN(num) || valor === null || valor === undefined ? null : num;
      };

      // 1. Calcula o Score usando os dados corretos (tratando possíveis nulls com ?? 0)
      const resultadoScore = calcularScoreEvolucaoSessao({
        frMedia: metricasRespiratorias.frMedia ?? 0,
        frMin: frMinAlvo,
        frMax: frMaxAlvo,

        frDesvioPadrao: metricasRespiratorias.frDesvioPadrao ?? 0,

        ieMedia: metricasRespiratorias.ieMedia ?? 0,
        ieInspiracaoAlvo,
        ieExpiracaoAlvo,

        // Usando o objeto 'avaliacao' que vem do Modal
        spo2Inicial: avaliacao.spo2Inicial,
        spo2Final: avaliacao.spo2Final,

        borgInicial: avaliacao.borgInicial,
        borgFinal: avaliacao.borgFinal,

        fcFinal: avaliacao.fcFinal,
        fcRecuperacao: avaliacao.fcRecuperacao,
      });

      // 2. Salva a Avaliação Clínica
      await salvarAvaliacaoClinicaSessao({
        sessaoId: idEncerrado,

        spo2Inicial: avaliacao.spo2Inicial,
        spo2Final: avaliacao.spo2Final,

        borgInicial: avaliacao.borgInicial,
        borgFinal: avaliacao.borgFinal,

        fcFinal: avaliacao.fcFinal,
        fcRecuperacao: avaliacao.fcRecuperacao,

        tempoRecuperacaoSegundos: 60,
      });

      // 3. Salva as Métricas passando o objeto original intacto
      await salvarMetricasSessao({
        sessaoId: idEncerrado,
        metricas: metricasRespiratorias,
        scoreEvolucao: resultadoScore.score,
      });

      // 4. Salva as Métricas
      await salvarMetricasSessao({
        sessaoId: idEncerrado,
        metricas: metricasRespiratorias,
        scoreEvolucao: tratarNumero(resultadoScore?.score),
      });

      // 5. Atualiza o status da sessão para encerrada
      await encerrarSessao(sessaoAtiva.id);

      limparLeituras();
      encerrarSessaoContexto();

      setSessaoEncerradaId(idEncerrado);

      setModalEncerramentoAberto(false);
      setSessaoAtiva(null);
      setPacienteSelecionado(null);
      setAlertasSessao([]);

      alert(
        `Sessão encerrada com sucesso. Score calculado: ${
          resultadoScore?.score !== null && resultadoScore?.score !== undefined
            ? resultadoScore.score.toFixed(1)
            : "não disponível"
        }`
      );
    } catch (error) {
      console.error("Erro detalhado ao encerrar sessão:", error);
      
      // EXIBE O ERRO REAL NA TELA PARA DIAGNÓSTICO RÁPIDO
      alert(
        `Não foi possível salvar os dados e encerrar a sessão.\n\n` +
        `Motivo técnico: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setSalvandoEncerramento(false);
    }
  }

  const pacientesFiltrados = pacientes.filter((paciente) =>
    paciente.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregandoSessao) {
    return <p>Carregando sessão...</p>;
  }

  if (sessaoAtiva) {
    return (
      <div className="monitoramento">
        
        <div className="monitoramento-header">
          <div>
            <h2>Monitoramento</h2>
            <span>Sessão em andamento</span>
          </div>
          <button 
            className="btn btn-red"
            onClick={() => {
              console.log("BOTÃO ENCERRAR FOI CLICADO");
              handleSolicitarEncerramento();
            }}
          >
            Encerrar sessão
          </button>
        </div>

        <div className='monitor-conteudo'>
          <div className="paciente-sessao">
            <div className="paciente-avatar">
              <span>{gerarIniciais(sessaoAtiva.paciente_nome)}</span>
              <div>
                <strong>{sessaoAtiva.paciente_nome}</strong>
                <p>
                  {(sessaoAtiva.diagnostico ?? "Sem diagnóstico informado").length > 30
                    ? (sessaoAtiva.diagnostico ?? "Sem diagnóstico informado").substring(0, 27) + "..."
                    : (sessaoAtiva.diagnostico ?? "Sem diagnóstico informado")
                  } · FR alvo: {sessaoAtiva.fr_min ?? "--"} - {sessaoAtiva.fr_max ?? "--"} rpm
                </p>
              </div>
            </div>
            
            <div className="divisao-card">
              <div className="coluna">
                <span>Duração</span>
                <p className="duração">{duracaoSessaoAtiva}</p>
              </div>
              <div className="coluna">
                <span>Início</span>
                <p className="inicio">{formatarDataHoraSQLite(sessaoAtiva.inicio)}</p>
              </div>
              <div className="coluna">
                <span className="bola"></span>
                 <p className="cor">Ativa</p>
              </div>
            </div>
          </div>
          
          <div className="monitor-grid">
            <div className="monitor-left">
              <div className="card waveform-box">
                <GraficoPressao
                  leituras={leiturasSensor.map((leitura) => leitura.pressao)}
                  altura={240}
                  mostrarControles
                />
                <p>Total de ciclos: {metricasRespiratorias.totalCiclos}</p>
                <p>Ciclos atípicos: {metricasRespiratorias.ciclosAtipicos}</p>
                <p>Desvio FR: {metricasRespiratorias.frDesvioPadrao ?? "--"}</p>
              </div>

              <div className="cards-metricas">
                <div className="metrica-card">
                  <span className="metrica-label">FR atual</span>
                  <strong className="metrica-valor">
                    {metricasRespiratorias.frAtual !== null
                      ? metricasRespiratorias.frAtual.toFixed(0)
                      : "--"}
                  </strong>
                  <span className="metrica-unidade">rpm</span>
                </div>

                <div className="metrica-card">
                  <span className="metrica-label">Razão I:E</span>
                  <strong className="metrica-valor">
                    {formatarRazaoIE(metricasRespiratorias.ieMedia)}
                  </strong>
                  <span className="metrica-unidade">estimada</span>
                </div>

                <div className="metrica-card">
                  <span className="metrica-label">Ti / Te</span>
                  <strong className="metrica-valor">
                    {metricasRespiratorias.tiMedio !== null
                      ? `${metricasRespiratorias.tiMedio.toFixed(1)}s`
                      : "--"}
                  </strong>
                  <span className="metrica-unidade">
                    {metricasRespiratorias.teMedio !== null
                      ? `Te: ${metricasRespiratorias.teMedio.toFixed(1)}s`
                      : "Te: --"}
                  </span>
                </div>

                <div className="metrica-card">
                  <span className="metrica-label">P. média</span>
                  <strong className="metrica-valor">
                    {metricasRespiratorias.pressaoMedia !== null
                      ? metricasRespiratorias.pressaoMedia.toFixed(1)
                      : "--"}
                  </strong>
                  <span className="metrica-unidade">cmH₂O</span>
                </div>
              </div>
            </div>

            <div className="monitor-right">
              <Alertas
                alertas={alertasSessao}
                modo="operacional"
                onRegistrarAjuste={handleRegistrarAjuste}
                onIgnorar={handleIgnorarAlerta}
              />

              <div className="card">
                <h3>Parâmetros-alvo da sessão</h3>
                
                <div className="parametros-alvo-lista">
                  <div className="parametro-alvo-item">
                    <span>FR alvo</span>
                    <strong>
                      {valorOuTraco(sessaoAtiva.fr_min)}–{valorOuTraco(sessaoAtiva.fr_max)}
                    </strong>
                    <small>rpm</small>
                  </div>  

                  <div className="parametro-alvo-item">
                    <span>I:E alvo</span>
                    <strong>
                      {valorOuTraco(sessaoAtiva.ie_inspiracao)}–{valorOuTraco(sessaoAtiva.ie_expiracao)}
                    </strong>
                    <small>razão</small>
                  </div>

                  <div className="parametro-alvo-item">
                    <span>Pressão alvo</span>
                    <strong>
                      {valorOuTraco(sessaoAtiva.pressao_min)}–{valorOuTraco(sessaoAtiva.pressao_max)}
                    </strong>
                    <small>cmH₂O</small>
                  </div>
                </div>
              </div>

              {/* <div className="card painel-card">
                <h3>Log da sessão</h3>
                
              </div> */}
            </div>
          </div>

        </div>

        <ModalEncerramento
          aberto={modalEncerramentoAberto}
          metricas={metricasRespiratorias}
          salvando={salvandoEncerramento}
          onFechar={() => setModalEncerramentoAberto(false)}
          onConfirmar={handleConfirmarEncerramento}
        />

      </div>
    );  
  }
  return (
    <div className="monitoramento">
      <div className="monitoramento-header">
        <div>
          <h2>Monitoramento</h2>
          <span>Selecione um paciente para iniciar</span>
        </div>
      </div>
      
      <div className="monitor-conteudo">
        <div className="card">
          <h3>Pacientes</h3>
          <input
            type="text"
            placeholder="Buscar paciente pelo nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <div className="lista-pacientes">
            {pacientesFiltrados.map((paciente) => (
              <button
                key={paciente.id}
                className={
                  pacienteSelecionado?.id === paciente.id 
                    ? "paciente-item selecionado" 
                    : "paciente-item"
                }
                onClick={() => setPacienteSelecionado(paciente)}
              >
                <div className="paciente-avatar">
                  <span>{gerarIniciais(paciente.nome)}</span>
                  <strong>{paciente.nome}</strong>
                </div>
                <span>{paciente.diagnostico ?? "Sem diagnóstico informado/disponível"}</span>
              </button>
            ))}
          </div>
        </div>
        
        {pacienteSelecionado && (
          <div className="card">
            <div className="parametros">
               <h3>Inserir parâmetros alvo - {pacienteSelecionado?.nome}</h3>
              <span>Defina as faixas de referência que serão usadas para acompanhar esta sessão.</span>
            </div>
            <div className="parametros-grid">

              <div className="card-parametro">
                <div className="parametro-item">
                  <label>Frequência respiratória (min):</label>
                  <input
                    type="number"
                    placeholder="Ex: 12"
                    value={frMin}
                    onChange={(e) => setFrMin(e.target.value)}
                  />
                  <small>rpm</small>
                </div>
                <div className="parametro-item">
                  <label>Frequência respiratória (max):</label>
                  <input
                    type="number"
                    placeholder="Ex: 20"
                    value={frMax}
                    onChange={(e) => setFrMax(e.target.value)}
                  />
                  <small>rpm</small>
                </div>
              </div>

              <div className="card-parametro">
                <div className="parametro-item">
                  <label>I:E Alvo (inspiração):</label>
                  <input
                    type="number"
                    placeholder="Ex: 1"
                    value={ieInspiracao}
                    onChange={(e) => setIeInspiracao(e.target.value)}
                  />
                </div>
                <div className="parametro-item">
                  <label>I:E Alvo (expiração):</label>
                  <input
                    type="number"
                    placeholder="Ex: 2"
                    value={ieExpiracao}
                    onChange={(e) => setIeExpiracao(e.target.value)}
                  />
                </div>
              </div>

              <div className="card-parametro">
                <div className="parametro-item">
                  <label>Pressão (mínima):</label>
                  <input
                    type="number"
                    placeholder="Ex: 10"
                    value={pressaoMin}
                    onChange={(e) => setPressaoMin(e.target.value)}
                  />
                  <small>cmH₂O</small>
                </div>
                <div className="parametro-item">
                  <label>Pressão (máxima):</label>
                  <input
                    type="number"
                    placeholder="Ex: 20"
                    value={pressaoMax}
                    onChange={(e) => setPressaoMax(e.target.value)}
                  />
                  <small>cmH₂O</small>
                </div>
              </div>
            </div>
            
            <div className="observacoes">
              <label>Observação clínica da sessão:</label>
              <textarea
                placeholder="Ex: Paciente apresentou desconforto respiratório durante a última sessão."
                value={observacoesSessao}
                onChange={(e) => setObservacoesSessao(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="card">
            <h3>Sensor MQTT</h3>

            <div className="sensor-info">
              <div>
                <span>Broker</span>
                <strong>localhost:1883</strong>
              </div>

              <div>
                <span>Dispositivo</span>
                <strong>esp32-001</strong>
              </div>

              <div>
                <span>Status</span>
                <strong className={mqttConectado ? "status-ok" : "status-off"}>
                  {statusSensor}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary-white"
              onClick={mqttConectado ? desconectarMqtt : conectarMqtt}
            >
              {mqttConectado ? "Desconectar MQTT" : "Conectar MQTT"}
            </button>

            <p className="sensor-status-text">
              {mqttConectado
                ? "Recebendo dados do broker MQTT."
                : "Conecte ao broker MQTT para receber leituras do sensor."}
            </p>
        </div>

        <div className="botao">
          <button
            className="btn btn-primary-white"
            onClick={() => handleIniciarSessao()}
            disabled={!pacienteSelecionado || carregando}
          >
            {carregando ? "Iniciando..." : "Iniciar Sessão"}
          </button>
                </div>
        </div>
    </div>
  );
}

export default Monitoramento;