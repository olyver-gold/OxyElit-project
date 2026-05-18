import "../../styles/fisioterapeuta/preditivo.css"
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  AnalisePreditivaPaciente,
  listarPacientesPreditivo,
  buscarAnalisePreditivaPaciente,
  PacientePreditivoResumo,
  SessaoPreditiva
 } from "../../database/services/preditivo";
import {
  formatarDataSQLite,
  formatarDataHoraSQLite
} from "../../utils/data"

function Preditivo() {
  const { usuario } = useAuth();

  const [pacientes, setPacientes] = useState<PacientePreditivoResumo[]>([]);
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState< number | null>(null);

  const [busca, setBusca] = useState("");
  const [analise, setAnalise] = useState<AnalisePreditivaPaciente | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");


  async function CarregarPacientes() {
    if (!usuario) {
      setPacientes([]);
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);
      setErro('');

      const resultado = await listarPacientesPreditivo(usuario.id);
      setPacientes(resultado);        
    } catch (error) {
      console.error("Erro ao carregar pacientes para análise preditiva:", error);
      setErro("Não foi possível carregar os pacientes.");
    } finally {
      setCarregando(false);
    }
  }
  
  async function SelecionarPaciente(pacienteId: number) {
    try {
      setCarregando(true);
      setErro("");

      setPacienteSelecionadoId(pacienteId);

      const resultado = await buscarAnalisePreditivaPaciente(pacienteId);

      if (!resultado) {
        setErro("Paciente não encontrado.")
        setAnalise(null);
        return;
      }

      setAnalise(resultado);
    } catch (error) {
      console.error("Não foi possível carregar análise preditiva:", error);
      setErro("Não foi possível carregar a análise preditiva.");
      setAnalise(null);
    } finally {
      setCarregando(false);
    }
  }

  function voltarParaSelecao() {
    setPacienteSelecionadoId(null);
    setAnalise(null);
    setErro("");
  }

  useEffect(() => {
    CarregarPacientes();
  }, [usuario]);
    
  const pacientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return pacientes;
    return pacientes.filter((paciente) =>
      paciente.nome.toLowerCase().includes(termo)
    );
  }, [busca, pacientes]);

  if (carregando && !pacienteSelecionadoId) {
    return (
      <div className="preditivo">
        <p>Carregando análise preditiva...</p>
      </div>
    );
  }

  if (!pacienteSelecionadoId) {
    return (
      <div className="preditivo">

        <div className="preditivo-header">
          <div>
            <h2>Análises Preditivas</h2>
            <span>Selecione um paciente para visualizar</span>
          </div>
        </div>

        {erro && <div className="preditivo-erro">{erro}</div>}

         <div className="preditivo-conteudo">
          <div className="card">
            <h3>Pacientes</h3>
            <span>Pacientes com menos de 5 sessões podem não ter predição disponível.</span>

            <input
              type="text"
              placeholder="Buscar paciente pelo nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <div className="lista-pacientes">
              {pacientesFiltrados.length === 0 ? (
                <div className="lista-vazia">
                  Nenhum paciente encontrado
                </div>
              ) : (
                pacientesFiltrados.map((paciente) => 
                  <button
                    key={paciente.id}
                    className={
                      pacienteSelecionadoId === paciente.id 
                        ? "preditivo-paciente-item selecionado" 
                        : "preditivo-paciente-item"
                    }
                    onClick={() => SelecionarPaciente(paciente.id)}
                  >
                    <div className="paciente-avatar">
                      <span>{gerarIniciais(paciente.nome)}</span>
                    </div>

                    <div className="paciente-info">
                      <strong>{paciente.nome}</strong>
                      
                      <span>{paciente.diagnostico ?? "Sem diagnóstico informado/disponível"}</span>

                      <small>
                        {paciente.total_sessoes} sessões encerradas
                        {paciente.ultima_sessao ? ` · última em ${formatarDataSQLite(paciente.ultima_sessao)}` : ""};
                      </small>
                    </div>

                    <span className={paciente.status_predicao === "disponivel" ? "preditivo-badge disponivel" : "preditivo-badge insuficiente"}>
                      {paciente.status_predicao === "disponivel" ? "Disponível" : "Poucas sessões"}

                    </span>
                  </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (carregando) {
    return (
      <div className="preditivo">
        <p>Carregando dados do paciente</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="preditivo">

        <div className="preditivo-header linha">
          <div>
            <h2>Análise Preditiva</h2>
            <p>Houve um problema ao carregar os dados</p>
          </div>

          <button className="btn btn-secondary-white" onClick={voltarParaSelecao}>
            Trocar paciente
          </button>
        </div>

        <div className="preditivo-erro">{erro}</div>
      </div>
    );
  }

  if (!analise) {
    return (
      <div className="preditivo">
        <p>Nenhuma análise encontrada.</p>
      </div>
    );
  }

  if (!analise.dados_suficientes) {
    return (
      <EstadoDadosInsuficientes
        analise={analise}
        onTrocarPaciente={voltarParaSelecao}
      />
    );
  }

  return (
    <EstadoAnaliseDisponivel
      analise={analise}
      onTrocarPaciente={voltarParaSelecao}
    />
  );
}

function EstadoDadosInsuficientes({ analise, onTrocarPaciente }: {
  analise: AnalisePreditivaPaciente;
  onTrocarPaciente: () => void;
}) {
  const progresso = (analise.total_sessoes / analise.sessoes_necessarias) * 100;

  return (
    <div className="preditivo">
      
      <div className="preditivo-header linha">
        <div>
          <h2>Análise preditiva - {analise.nome}</h2>
          <p>
            {analise.diagnostico ?? "Sem diagnóstico informado"} ·{""}
            {analise.total_sessoes} sessões encerradas
          </p>
        </div>

        <button className="btn btn-primary-blue" onClick={onTrocarPaciente}>
          Trocar paciente
        </button>
      </div>

      <div className="preditivo-conteudo">

        <div className="preditivo-metricas">
          <MetricCard
            titulo="Sessões realizadas"
            valor={analise.total_sessoes}
            subtitulo={`de ${analise.sessoes_necessarias} necessárias`}
          />

          <MetricCard
            titulo="FR média geral"
            valor={analise.fr_media_geral?.toFixed(0) ?? "—"}
            subtitulo="rpm"
          />

          <MetricCard titulo="Score atual" valor="—" subtitulo="insuficiente" />
        </div>

        <div className="card-insuficiente">
          <h3>Predição ainda não disponível</h3>

          <p>
            São necessárias pelo menos{" "}
            <strong>{analise.sessoes_necessarias} sessões concluídas</strong> para
            calcular uma tendência mais confiável. Faltam{" "}
            <strong>{analise.sessoes_faltantes} sessões</strong>.
          </p>
          
          <div className="progresso-linha">
            <span>Progresso</span>
            <strong>
              {analise.total_sessoes} / {analise.sessoes_necessarias}
            </strong>
          </div>

          <div className="progresso-barra">
            <div style={{ width: `${Math.min(100, progresso)}%` }} />
          </div>
        </div>
        
        <HistoricoSessoes sessoes={analise.sessoes} />
        
      </div>
    </div>
  );
}

function EstadoAnaliseDisponivel({ analise, onTrocarPaciente }: {
  analise: AnalisePreditivaPaciente;
  onTrocarPaciente: () => void;
}) {
  return (
    <div className="preditivo">
      <div className="preditivo-header linha">
        <div>
          <h2>Análise preditiva — {analise.nome}</h2>
          <p>
            {analise.diagnostico ?? "Sem diagnóstico informado"} ·{" "}
            {analise.total_sessoes} sessões encerradas
          </p>
        </div>

        <button className="btn btn-primary-blue" onClick={onTrocarPaciente}>
          Trocar paciente
        </button>
      </div>

      <div className="preditivo-conteudo">
        <div className="preditivo-metricas quatro">
          <MetricCard
            titulo="Score atual"
            valor={analise.score_atual?.toFixed(1) ?? "—"}
            subtitulo="de 10"
            destaque
          />
          <MetricCard
            titulo="Tendência"
            valor={formatarTendencia(analise.tendencia)}
            subtitulo="estimativa"
          />
          <MetricCard
            titulo="FR média geral"
            valor={analise.fr_media_geral?.toFixed(0) ?? "—"}
            subtitulo="rpm"
          />
          <MetricCard
            titulo="Previsão de alta"
            valor={analise.previsao_alta ?? "—"}
            subtitulo="estimativa"
          />
        </div>
        <div className="preditivo-grid">
          <div className="card grafico-evolucao">
            <h3>Curva de evolução</h3>
            <p>
              Evolução do score calculado a partir das sessões encerradas do
              paciente.
            </p>
            <GraficoEvolucaoSimples sessoes={analise.sessoes} />
          </div>
          <div className="preditivo-lateral">
            <div className="card">
              <h3>Componentes do score</h3>
              <ComponenteScore
                nome="FR média"
                valor={
                  analise.componentes.fr_media.valor !== null
                    ? `${analise.componentes.fr_media.valor.toFixed(1)} rpm`
                    : "—"
                }
                nota={analise.componentes.fr_media.nota}
                classificacao={analise.componentes.fr_media.classificacao}
              />
              <ComponenteScore
                nome="Estabilidade da FR"
                valor={
                  analise.componentes.estabilidade_fr.valor !== null
                    ? `DP ${analise.componentes.estabilidade_fr.valor.toFixed(2)}`
                    : "—"
                }
                nota={analise.componentes.estabilidade_fr.nota}
                classificacao={analise.componentes.estabilidade_fr.classificacao}
              />
              <ComponenteScore
                nome="Qualidade I:E"
                valor={
                  analise.componentes.qualidade_ie.valor !== null
                    ? analise.componentes.qualidade_ie.valor.toFixed(2)
                    : "—"
                }
                nota={analise.componentes.qualidade_ie.nota}
                classificacao={analise.componentes.qualidade_ie.classificacao}
              />
              <ComponenteScore
                nome="SpO₂"
                valor={
                  analise.componentes.spo2.valor !== null
                    ? `${analise.componentes.spo2.valor.toFixed(0)}%`
                    : "—"
                }
                nota={analise.componentes.spo2.nota}
                classificacao={analise.componentes.spo2.classificacao}
              />
              <ComponenteScore
                nome="Borg"
                valor={
                  analise.componentes.borg.valor !== null
                    ? `Δ ${analise.componentes.borg.valor.toFixed(1)}`
                    : "—"
                }
                nota={analise.componentes.borg.nota}
                classificacao={analise.componentes.borg.classificacao}
              />
              <ComponenteScore
                nome="FC recuperação"
                valor={
                  analise.componentes.fc_recuperacao.valor !== null
                    ? `${analise.componentes.fc_recuperacao.valor.toFixed(0)} bpm`
                    : "—"
                }
                nota={analise.componentes.fc_recuperacao.nota}
                classificacao={analise.componentes.fc_recuperacao.classificacao}
              />
            </div>
            <div className="card">
              <h3>Classificação</h3>
              <div
                className={`classificacao-card classificacao-${analise.tendencia}`}
              >
                <strong>{formatarClassificacaoTitulo(analise.tendencia)}</strong>
                <span>{formatarClassificacaoDescricao(analise.tendencia)}</span>
              </div>
            </div>
          </div>
        </div>
        <HistoricoSessoes sessoes={analise.sessoes} />

      </div>
    </div>
  );
}

function MetricCard({ titulo, valor, subtitulo, destaque = false,}: {
  titulo: string;
  valor: string | number;
  subtitulo: string;
  destaque?: boolean;
}) {
  return (
    <div className={destaque ? "preditivo-metrica-card destaque" : "preditivo-metrica-card"}>
      <span>{titulo}</span>
      <strong>{valor}</strong>
      <small>{subtitulo}</small>
    </div>
  );
}

function ComponenteScore({ nome, valor, nota, classificacao }: {
  nome: string;
  valor: string;
  nota: number | null;
  classificacao: string;
}) {
  return (
    <div className="componente-score">
      <div>
        <span>{nome}</span>
        <small>{valor}</small>
      </div>

      <div className="componente-score-resultado">
        <strong>{nota !== null ? nota.toFixed(1) : "—"}</strong>
        <small>{classificacao}</small>
      </div>
    </div>
  );
}

function HistoricoSessoes({ sessoes }: { sessoes: SessaoPreditiva[] }) {
  return (
    <div className="card">
      <h3>Sessões registradas</h3>

      {sessoes.length === 0 ? (
        <p className="preditivo-muted">Nenhuma sessão encerrada registrada.</p>
      ) : (
        <div className="sessoes-preditivas-lista">
          {sessoes.map((sessao, index) => (
            <div className="sessao-preditiva-item" key={sessao.sessao_id}>
              <div>
                <strong>Sessão {index + 1}</strong>
                <span>
                  {sessao.inicio
                    ? formatarDataHoraSQLite(sessao.inicio)
                    : "Sem data"}
                </span>
              </div>

              <div>
                <span>FR média</span>
                <strong>
                  {sessao.fr_media !== null
                    ? `${sessao.fr_media.toFixed(1)} rpm`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Score</span>
                <strong>
                  {sessao.score_evolucao !== null
                    ? sessao.score_evolucao.toFixed(1)
                    : "—"}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GraficoEvolucaoSimples({
  sessoes,
}: {
  sessoes: SessaoPreditiva[];
}) {
  const sessoesComScore = sessoes.filter(
    (sessao) => sessao.score_evolucao !== null
  );

  if (sessoesComScore.length === 0) {
    return (
      <div className="grafico-placeholder">
        <span>Sem scores disponíveis para montar a curva.</span>
      </div>
    );
  }

  const maxScore = 10;

  return (
    <div className="grafico-evolucao-simples">
      {sessoesComScore.map((sessao, index) => {
        const score = sessao.score_evolucao ?? 0;
        const altura = Math.max(8, (score / maxScore) * 100);

        return (
          <div className="grafico-barra-item" key={sessao.sessao_id}>
            <div className="grafico-barra-track">
              <div
                className="grafico-barra"
                style={{ height: `${altura}%` }}
                title={`Sessão ${index + 1}: ${score.toFixed(1)}`}
              />
            </div>

            <span>{index + 1}</span>
          </div>
        );
      })}
    </div>
  );
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

function formatarTendencia(tendencia: string): string {
  const mapa: Record<string, string> = {
    melhora: "Melhora",
    estavel: "Estável",
    piora: "Atenção",
    insuficiente: "Insuficiente",
  };

  return mapa[tendencia] ?? tendencia;
}

function formatarClassificacaoTitulo(tendencia: string): string {
  if (tendencia === "melhora") return "Melhora gradual";
  if (tendencia === "piora") return "Requer atenção";
  if (tendencia === "estavel") return "Estável";

  return "Dados insuficientes";
}

function formatarClassificacaoDescricao(tendencia: string): string {
  if (tendencia === "melhora") {
    return "O paciente apresenta evolução positiva nas sessões analisadas.";
  }

  if (tendencia === "piora") {
    return "Os indicadores sugerem necessidade de acompanhamento mais próximo.";
  }

  if (tendencia === "estavel") {
    return "Os dados indicam manutenção do quadro, sem grande variação.";
  }

  return "Ainda não há sessões suficientes para estimar tendência.";
}

export default Preditivo;