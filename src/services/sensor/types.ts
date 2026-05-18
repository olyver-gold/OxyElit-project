export type UnidadePressao = "cmH2O" | "Pa";

export interface LeituraSensor {
    deviceId: string;
    timestamp: number;
    pressao: number;
    unidade: UnidadePressao;
    origem: "mqtt" | "simulado";
}

export interface StatusDispositivo {
    deviceId: string;
    status: "online" | "offline" | "erro" | string;
    rssi?: number;
    timestamp?: number;
}

export interface ErroDispositivo {
    deviceId: string;
    codigo: string;
    mensagem: string;
    timestamp?: number;
}

export interface MqttConfig {
    host: string;
    port: number;
    client_id: string;
    username?: string;
    password?: string;
    device_id: string;
}