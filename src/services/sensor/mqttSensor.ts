import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import {
    ErroDispositivo,
    LeituraSensor,
    MqttConfig,
    StatusDispositivo,
} from "./types";

type CallbacksSensorMqtt = {
    onLeitura?: (leitura: LeituraSensor) => void;
    onStatus?: (status: StatusDispositivo) => void;
    onErroDispositivo?: (erro: ErroDispositivo) => void;
    onErroMqtt?: (erro: string) => void;
    onConectado?: (conectado: boolean) => void;
};

export class MqttSensorClient {
    private unlisteners: UnlistenFn[] = [];
    private conectado = false;

    async conectar(config: MqttConfig, callbacks: CallbacksSensorMqtt) {
        await this.registrarListeners(callbacks);

        await invoke("mqtt_conectar", {
        config,
        });
    }

    async desconectar() {
        await invoke("mqtt_desconectar");

        this.conectado = false;

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

            callbacks.onLeitura?.({
            ...leitura,
            timestamp: leitura.timestamp ?? Date.now(),
            origem: "mqtt",
            });
        }
    );

    const unlistenStatus = await listen<StatusDispositivo>(
        "sensor://status",
        (event) => {
            callbacks.onStatus?.(event.payload);
        }
    );

    const unlistenErroDispositivo = await listen<ErroDispositivo>(
        "sensor://erro",
        (event) => {
            callbacks.onErroDispositivo?.(event.payload);
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
        unlistenStatus,
        unlistenErroDispositivo,
        unlistenErroMqtt,
        unlistenConectado
    );
  }
}