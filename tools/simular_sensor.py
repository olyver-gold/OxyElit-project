import sys
import time
import json
import math
import random
from paho.mqtt import client as mqtt

BROKER = "localhost"
PORT = 1883
DEVICE_ID = "esp32-001"

TOPIC_LEITURAS = f"oxyelit/dispositivos/{DEVICE_ID}/leituras"
TOPIC_STATUS = f"oxyelit/dispositivos/{DEVICE_ID}/status"

# Uso:
# python simular_sensor.py normal 35
# python simular_sensor.py fr_alta 35
# python simular_sensor.py evolucao_1 35
#
# Segundo argumento = duração em segundos

CENARIO = sys.argv[1] if len(sys.argv) > 1 else "normal"
DURACAO_SEGUNDOS = float(sys.argv[2]) if len(sys.argv) > 2 else 35.0

CENARIOS = {
    "normal": {
        "rpm": 16,
        "ie_inspiracao": 1,
        "ie_expiracao": 2,
        "pressao_pico": 4.0,
        "ruido": 0.06,
        "variacao_rpm": 0.5,
    },

    "fr_alta": {
        "rpm": 25,
        "ie_inspiracao": 1,
        "ie_expiracao": 2,
        "pressao_pico": 4.3,
        "ruido": 0.10,
        "variacao_rpm": 1.5,
    },

    "fr_baixa": {
        "rpm": 9,
        "ie_inspiracao": 1,
        "ie_expiracao": 2,
        "pressao_pico": 3.8,
        "ruido": 0.06,
        "variacao_rpm": 0.4,
    },

    "obstrutivo": {
        "rpm": 18,
        "ie_inspiracao": 1,
        "ie_expiracao": 3,
        "pressao_pico": 4.8,
        "ruido": 0.12,
        "variacao_rpm": 1.2,
    },

    "instavel": {
        "rpm": 18,
        "ie_inspiracao": 1,
        "ie_expiracao": 2,
        "pressao_pico": 4.8,
        "ruido": 0.20,
        "variacao_rpm": 4.0,
    },

    # Cenários para demonstrar evolução gradual no módulo preditivo
    "evolucao_1": {
        "rpm": 23,
        "ie_inspiracao": 1,
        "ie_expiracao": 3,
        "pressao_pico": 5.2,
        "ruido": 0.18,
        "variacao_rpm": 3.0,
    },

    "evolucao_2": {
        "rpm": 21,
        "ie_inspiracao": 1,
        "ie_expiracao": 2.7,
        "pressao_pico": 4.9,
        "ruido": 0.15,
        "variacao_rpm": 2.3,
    },

    "evolucao_3": {
        "rpm": 19,
        "ie_inspiracao": 1,
        "ie_expiracao": 2.5,
        "pressao_pico": 4.6,
        "ruido": 0.12,
        "variacao_rpm": 1.8,
    },

    "evolucao_4": {
        "rpm": 17,
        "ie_inspiracao": 1,
        "ie_expiracao": 2.2,
        "pressao_pico": 4.3,
        "ruido": 0.09,
        "variacao_rpm": 1.0,
    },

    "evolucao_5": {
        "rpm": 16,
        "ie_inspiracao": 1,
        "ie_expiracao": 2,
        "pressao_pico": 4.0,
        "ruido": 0.05,
        "variacao_rpm": 0.5,
    },
}

if CENARIO not in CENARIOS:
    print(f"Cenário inválido: {CENARIO}")
    print("Cenários disponíveis:")
    for nome in CENARIOS.keys():
        print(f" - {nome}")
    sys.exit(1)

config = CENARIOS[CENARIO]

client = mqtt.Client(client_id=f"simulador-{DEVICE_ID}-{int(time.time())}")
client.connect(BROKER, PORT, 60)

client.publish(
    TOPIC_STATUS,
    json.dumps({
        "deviceId": DEVICE_ID,
        "status": "online",
        "modo": "simulado",
        "cenario": CENARIO,
        "timestamp": int(time.time() * 1000),
    }),
    qos=1,
)

print("Simulação respiratória iniciada.")
print(f"Cenário: {CENARIO}")
print(f"Duração: {DURACAO_SEGUNDOS} segundos")
print(f"FR base: {config['rpm']} rpm")
print(
    f"I:E alvo simulada: "
    f"{config['ie_inspiracao']}:{config['ie_expiracao']}"
)

TAXA_AMOSTRAGEM_HZ = 10
INTERVALO = 1 / TAXA_AMOSTRAGEM_HZ

inicio_execucao = time.time()
inicio_ciclo = time.time()

rpm_ciclo = config["rpm"]
duracao_ciclo = 60 / rpm_ciclo

def preparar_novo_ciclo():
    rpm_atual = config["rpm"] + random.uniform(
        -config["variacao_rpm"],
        config["variacao_rpm"]
    )

    rpm_atual = max(5, rpm_atual)
    duracao = 60 / rpm_atual

    return rpm_atual, duracao

try:
    while time.time() - inicio_execucao < DURACAO_SEGUNDOS:
        agora = time.time()
        tempo_no_ciclo = agora - inicio_ciclo

        if tempo_no_ciclo >= duracao_ciclo:
            inicio_ciclo = agora
            rpm_ciclo, duracao_ciclo = preparar_novo_ciclo()
            tempo_no_ciclo = 0

        soma_ie = config["ie_inspiracao"] + config["ie_expiracao"]
        duracao_inspiracao = (
            duracao_ciclo * config["ie_inspiracao"] / soma_ie
        )
        duracao_expiracao = duracao_ciclo - duracao_inspiracao

        if tempo_no_ciclo <= duracao_inspiracao:
            # Fase inspiratória: curva positiva com pico suave.
            fase = tempo_no_ciclo / duracao_inspiracao
            pressao = config["pressao_pico"] * (
                math.sin(math.pi * fase) ** 1.35
            )
        else:
            # Fase expiratória: retorno com pequena deflexão negativa.
            fase = (
                (tempo_no_ciclo - duracao_inspiracao)
                / duracao_expiracao
            )
            pressao = -0.35 * config["pressao_pico"] * (
                math.sin(math.pi * fase) ** 1.20
            )

        ruido = random.uniform(-config["ruido"], config["ruido"])
        pressao_final = round(pressao + ruido, 3)

        payload = {
            "deviceId": DEVICE_ID,
            "timestamp": int(time.time() * 1000),
            "pressao": pressao_final,
            "unidade": "cmH2O",
            "origem": "simulado",
            "cenario": CENARIO,
        }

        client.publish(
            TOPIC_LEITURAS,
            json.dumps(payload),
            qos=0,
        )

        print(payload)

        time.sleep(INTERVALO)

finally:
    client.publish(
        TOPIC_STATUS,
        json.dumps({
            "deviceId": DEVICE_ID,
            "status": "offline",
            "modo": "simulado",
            "cenario": CENARIO,
            "timestamp": int(time.time() * 1000),
        }),
        qos=1,
    )

    client.disconnect()
    print("Simulação encerrada.")