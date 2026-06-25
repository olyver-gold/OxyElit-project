import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import {
    LeituraSensor,
    MetricasSessao,
    MqttConfig,
} from "./types";

type CallbacksSensorMqtt = {
    onLeitura?:          (leitura: LeituraSensor) => void;
    onMetricas?:         (metricas: MetricasSessao) => void;
    onErroMqtt?:         (erro: string) => void;
    onConectado?:        (conectado: boolean) => void;
};

export class MqttSensorClient {
    private unlisteners: UnlistenFn[] = [];
    private conectado = false;
    
    // Variável para guardar o Zero Clínico (Pressão ambiente)
    private taraCmH2O: number | null = null; 

    async conectar(config: MqttConfig, callbacks: CallbacksSensorMqtt) {
        this.taraCmH2O = null; 
        
        await this.registrarListeners(callbacks);

        await invoke("mqtt_conectar", {
            config,
        });
    }

    async desconectar() {
        await invoke("mqtt_desconectar");

        this.conectado = false;
        this.taraCmH2O = null;

        for (const unlisten of this.unlisteners) {
            unlisten();
        }

        this.unlisteners = [];
    }

    estaConectado() {
        return this.conectado;
    }

    private async registrarListeners(callbacks: CallbacksSensorMqtt) {
        for (const unlisten of this.unlisteners) {
            unlisten();
        }

        this.unlisteners = [];

        const unlistenLeitura = await listen<LeituraSensor>(
            "sensor://leitura",
            (event) => {
                const leitura = event.payload;

                const pressaoBrutaCmH2O = leitura.pressao * 10.1972;

                // 2. Sistema de Tara: Guarda a primeira leitura do ar ambiente como sendo o Zero
                if (this.taraCmH2O === null) {
                    this.taraCmH2O = pressaoBrutaCmH2O;
                }

                // 3. Subtrai o ruído/pressão base da leitura atual
                const pressaoRealCmH2O = pressaoBrutaCmH2O - this.taraCmH2O;

                callbacks.onLeitura?.({
                    ...leitura,
                    pressao: pressaoRealCmH2O, 
                    timestamp: Date.now(),     
                    origem: "mqtt",
                });
            }
        );

        const unlistenMetricas = await listen<MetricasSessao>(
            "sensor://metricas",
            (event) => {
                const metricas = event.payload;
                
                // Garante que a tara existe (se não existir, usa 0 por segurança)
                const taraAtual = this.taraCmH2O || 0; 

                callbacks.onMetricas?.({
                    ...metricas,
                    // Converte para cmH2O e zera as pressões do pacote de métricas do ESP32
                    pressao: (metricas.pressao * 10.1972) - taraAtual,
                    pressao_media: (metricas.pressao_media * 10.1972) - taraAtual,
                });
            }
        );

        const unlistenErroMqtt = await listen<string>(
            "mqtt://erro",
            (event) => {
                callbacks.onErroMqtt?.(event.payload);
            }
        );

        const unlistenConectado = await listen<boolean>(
            "mqtt://conectado",
            (event) => {
                this.conectado = event.payload;
                callbacks.onConectado?.(event.payload);
            }
        );

        this.unlisteners.push(
            unlistenLeitura,
            unlistenMetricas,
            unlistenErroMqtt,
            unlistenConectado
        );
    }
}