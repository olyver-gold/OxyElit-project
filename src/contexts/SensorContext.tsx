import {
    createContext,
    ReactNode,
    useContext,
    useRef,
    useState,
    useEffect
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { MqttSensorClient } from "../services/sensor/mqttSensor";
import {
    LeituraSensor,
    MetricasSessao,
} from "../services/sensor/types";

type SensorContextType = {
    leiturasSensor:  LeituraSensor[];
    ultimaLeitura:   LeituraSensor | null;
    metricasSessao:  MetricasSessao | null;

    sessaoAtivaId:   number | null;              
    iniciarSessao:   (id: number) => void;        
    encerrarSessao:  () => void;                  

    mqttConectado:   boolean;
    statusSensor:    string;
    erroSensor:      string | null;

    conectarMqtt:    () => Promise<void>;
    desconectarMqtt: () => Promise<void>;
    limparLeituras:  () => void;
};

const SensorContext = createContext<SensorContextType | null>(null);

export function SensorProvider({ children }: { children: ReactNode }) {
    // Instancia o cliente MQTT de forma a persistir entre renderizações
    const mqttClientRef = useRef<MqttSensorClient>(new MqttSensorClient());

    const [leiturasSensor, setLeiturasSensor] = useState<LeituraSensor[]>([]);
    const [ultimaLeitura, setUltimaLeitura] = useState<LeituraSensor | null>(null);
    const [metricasSessao, setMetricasSessao] = useState<MetricasSessao | null>(null);

    // Gestão da Sessão
    const [sessaoAtivaId, setSessaoAtivaId] = useState<number | null>(null);

    const [mqttConectado, setMqttConectado] = useState(false);
    const [statusSensor, setStatusSensor] = useState("desconectado");
    const [erroSensor, setErroSensor] = useState<string | null>(null);

    const sessaoAtualRef = useRef<number | null>(null);
    useEffect(() => {
        sessaoAtualRef.current = sessaoAtivaId;
    }, [sessaoAtivaId]);

    function iniciarSessao(id: number) {
        setSessaoAtivaId(id);
    }

    function encerrarSessao() {
        setSessaoAtivaId(null);
    }

    async function conectarMqtt() {
        try {
            setStatusSensor("conectando");
            setErroSensor(null);

            const config = {
                host: "localhost",
                port: 1883,
                client_id: "desktop_app_" + Math.random().toString(16).substring(2, 8),
                device_id: "esp32-001"
            };

            await mqttClientRef.current.conectar(config, {
                onLeitura: (leitura) => {
                    setUltimaLeitura(leitura);
                    
                    setLeiturasSensor((prev) => {
                        const novaLista = [...prev, leitura];
                        // Limite de pontos para o gráfico ser super fluido (150 pontos = 30 seg a 5Hz)
                        if (novaLista.length > 150) novaLista.shift();
                        return novaLista;
                    });

                    // Se houver uma sessão a decorrer, grava imediatamente no SQLite via Rust!
                    if (sessaoAtualRef.current !== null) {
                        invoke("gravar_leitura_sensor", {
                            sessaoId: sessaoAtualRef.current,
                            pressao: leitura.pressao,
                            limiar: leitura.limiar,
                            solenoide: leitura.solenoide,
                            ts: leitura.ts
                        }).catch((err) => console.error("Erro no background ao guardar telemetria:", err));
                    }
                },
                onMetricas: (metricas) => {
                    setMetricasSessao(metricas);
                },
                onConectado: (conectado) => {
                    setMqttConectado(conectado);
                    setStatusSensor(conectado ? "conectado" : "desconectado");
                },
                onErroMqtt: (erro) => {
                    console.error("Broker MQTT reportou erro:", erro);
                    setErroSensor(erro);
                    setStatusSensor("erro mqtt");
                }
            });

        } catch (error) {
            console.error("Erro fatal ao ligar MQTT:", error);
            setMqttConectado(false);
            setStatusSensor("erro mqtt");
            setErroSensor("Não foi possível estabelecer ligação ao broker MQTT.");
        }
    }

    async function desconectarMqtt() {
        try {
            await mqttClientRef.current?.desconectar();
            setMqttConectado(false);
            setStatusSensor("desconectado");
        } catch (error) {
            console.error("Falha ao desligar MQTT:", error);
            setErroSensor("Ocorreu um erro ao desligar o MQTT.");
        }
    }

    function limparLeituras() {
        setLeiturasSensor([]);
        setUltimaLeitura(null);
        setMetricasSessao(null);
    }

    return (
        <SensorContext.Provider
            value={{
                leiturasSensor,
                ultimaLeitura,
                metricasSessao,

                sessaoAtivaId,
                iniciarSessao,
                encerrarSessao,

                mqttConectado,
                statusSensor,
                erroSensor,

                conectarMqtt,
                desconectarMqtt,
                limparLeituras,
            }}
        >
            {children}
        </SensorContext.Provider>
    );
}

export function useSensor() {
    const ctx = useContext(SensorContext);
    if (!ctx) {
        throw new Error("useSensor tem de ser usado dentro de um SensorProvider");
    }
    return ctx;
}