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

# Escolha o cenário:
# "normal", "fr_alta", "fr_baixa", "pressao_alta", "instavel"
CENARIO = "normal"

client = mqtt.Client(client_id=f"simulador-{DEVICE_ID}")
client.connect(BROKER, PORT, 60)

client.publish(
    TOPIC_STATUS,
    json.dumps({
        "deviceId": DEVICE_ID,
        "status": "online",
        "rssi": -45,
        "timestamp": int(time.time() * 1000)
    }),
    qos=1
)

print("Simulador MQTT iniciado.")
print(f"Cenário: {CENARIO}")
print(f"Publicando em: {TOPIC_LEITURAS}")


def configurar_cenario(cenario):
    if cenario == "normal":
        return {
            "rpm": 16,
            "pressao_max": 4.0,
            "ruido": 0.05,
            "instabilidade": 0.0
        }

    if cenario == "fr_alta":
        return {
            "rpm": 26,
            "pressao_max": 4.0,
            "ruido": 0.06,
            "instabilidade": 0.0
        }

    if cenario == "fr_baixa":
        return {
            "rpm": 8,
            "pressao_max": 4.0,
            "ruido": 0.05,
            "instabilidade": 0.0
        }

    if cenario == "pressao_alta":
        return {
            "rpm": 16,
            "pressao_max": 8.0,
            "ruido": 0.08,
            "instabilidade": 0.0
        }

    if cenario == "instavel":
        return {
            "rpm": 16,
            "pressao_max": 4.0,
            "ruido": 0.15,
            "instabilidade": 0.35
        }

    return {
        "rpm": 16,
        "pressao_max": 4.0,
        "ruido": 0.05,
        "instabilidade": 0.0
    }


config = configurar_cenario(CENARIO)

# intervalo entre leituras: 10 leituras por segundo
dt = 0.1

# frequência respiratória em ciclos por segundo
freq_hz_base = config["rpm"] / 60

tempo = 0.0

try:
    while True:
        rpm_atual = config["rpm"]

        if config["instabilidade"] > 0:
            rpm_atual += random.uniform(-6, 6)

        freq_hz = rpm_atual / 60

        # Sinal respiratório:
        # seno positivo elevado ao quadrado para simular ciclos de pressão.
        ciclo = max(0, math.sin(2 * math.pi * freq_hz * tempo)) ** 2

        pressao = ciclo * config["pressao_max"]

        ruido = random.uniform(-config["ruido"], config["ruido"])

        pressao_final = round(max(0, pressao + ruido), 2)

        payload = {
            "deviceId": DEVICE_ID,
            "timestamp": int(time.time() * 1000),
            "pressao": pressao_final,
            "unidade": "cmH2O"
        }

        client.publish(
            TOPIC_LEITURAS,
            json.dumps(payload),
            qos=0
        )

        print(payload)

        tempo += dt
        time.sleep(dt)

except KeyboardInterrupt:
    print("Encerrando simulador...")

    client.publish(
        TOPIC_STATUS,
        json.dumps({
            "deviceId": DEVICE_ID,
            "status": "offline",
            "timestamp": int(time.time() * 1000)
        }),
        qos=1
    )

    client.disconnect()