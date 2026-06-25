import {
    createContext,
    ReactNode,
    useContext,
    useRef,
    useState,
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

const LIMITE_BUFFER_MS = 5 * 60 * 1000;

export function SensorProvider({ children }: { children: ReactNode }) {
    const mqttClientRef = useRef<MqttSensorClient | null>(null);

    const [leiturasSensor, setLeiturasSensor] = useState<LeituraSensor[]>([]);
    const [ultimaLeitura, setUltimaLeitura] = useState<LeituraSensor | null>(null);
    const [metricasSessao, setMetricasSessao] = useState<MetricasSessao | null>(null);

    const [sessaoAtivaId, setSessaoAtivaId] = useState<number | null>(null);

    const [mqttConectado, setMqttConectado] = useState(false);
    const [statusSensor, setStatusSensor] = useState("desconectado");
    const [erroSensor, setErroSensor] = useState<string | null>(null);

    function iniciarSessao(id: number) {
        setSessaoAtivaId(id);
    }

    function encerrarSessao() {
        setSessaoAtivaId(null);
    }

    async function conectarMqtt() {
        try {
            setErroSensor(null);

            if (!mqttClientRef.current) {
                mqttClientRef.current = new MqttSensorClient();
            }

            await mqttClientRef.current.conectar(
                {
                    host: "localhost",
                    port: 1883,
                    client_id: `oxyelit-app-${Date.now()}`,
                    device_id: "esp32-001",
                },
                {
                    onConectado: (conectado: boolean) => {
                        console.log("MQTT conectado?", conectado);
                        setMqttConectado(conectado);
                        setStatusSensor(conectado ? "conectado" : "desconectado");
                    },

                    onLeitura: (leitura: LeituraSensor) => {
                        console.log("LEITURA MQTT RECEBIDA:", leitura);

                        const leituraNormalizada: LeituraSensor = {
                            ...leitura,
                            timestamp: Date.now(),
                            origem: "mqtt",
                        };

                        setUltimaLeitura(leituraNormalizada);
                        setLeiturasSensor((anteriores) => {
                            const proximas = [...anteriores, leituraNormalizada];
                            const limiteTempo = Date.now() - LIMITE_BUFFER_MS;
                            return proximas.filter((item) => item.timestamp >= limiteTempo);
                        });

                        // Persiste no SQLite se houver sessão ativa
                        setSessaoAtivaId((idAtual) => {
                            if (idAtual !== null) {
                                invoke("gravar_leitura_sensor", {
                                    sessaoId: idAtual,
                                    pressao:  leitura.pressao,
                                    limiar:   leitura.limiar,
                                    solenoide: leitura.solenoide,
                                    ts:       leitura.ts,
                                }).catch((e) => console.error("Erro ao gravar leitura:", e));
                            }
                            return idAtual; 
                        });
                    },

                    onMetricas: (metricas: MetricasSessao) => {
                        setMetricasSessao(metricas);
                    },

                    onErroMqtt: (erro: string) => {
                        console.error("ERRO MQTT:", erro);
                        setStatusSensor("erro mqtt");
                        setErroSensor(erro);
                    },
                }
            );
        } catch (error) {
            console.error("Erro ao conectar MQTT:", error);
            setMqttConectado(false);
            setStatusSensor("erro mqtt");
            setErroSensor("Não foi possível conectar ao broker MQTT.");
            throw error;
        }
    }

    async function desconectarMqtt() {
        try {
            await mqttClientRef.current?.desconectar();
            setMqttConectado(false);
            setStatusSensor("desconectado");
        } catch (error) {
            console.error("Erro ao desconectar MQTT:", error);
            setErroSensor("Erro ao desconectar MQTT.");
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
        throw new Error("useSensor deve ser usado dentro de SensorProvider");
    }
    return ctx;
}