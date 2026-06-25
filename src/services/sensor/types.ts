export type UnidadePressao = "cmH2O" | "Pa";
export type OrigemLeitura = "mqtt" | "simulado";

export interface LeituraSensor {
    pressao:   number;
    limiar:    number;
    solenoide: number;      // 0 = desligada, 1 = ativa
    ts:        number;      // millis do ESP32 (usado só para intervalo)
    timestamp: number;      // Unix ms — preenchido pelo frontend no onLeitura
    origem:    OrigemLeitura;
}

export interface MetricasSessao {
    inspiracao:    number;   // contador sequencial da sessão
    pressao:       number;   // pressão no disparo (kPa)
    limiar:        number;   // limiar cruzado (V)
    freq:          number;   // FR instantânea (rpm)
    freq_media:    number;   // FR média da sessão
    pressao_media: number;   // pressão média da sessão
    ts:            number;   // millis do ESP32
}

export interface MqttConfig {
    host: string;
    port: number;
    client_id: string;
    username?: string;
    password?: string;
    device_id: string;
}