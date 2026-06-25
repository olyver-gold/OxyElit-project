use rumqttc::{AsyncClient, Event, Incoming, MqttOptions, QoS};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tauri::{AppHandle, Emitter, State};
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SensorPayload {
    pub pressao: f64,
    pub limiar: f64,
    pub solenoide: u8,
    pub ts: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricasPayload {
    pub inspiracao:    u32,
    pub pressao:       f64,
    pub limiar:        f64,
    pub freq:          f64,
    pub freq_media:    f64,
    pub pressao_media: f64,
    pub ts:            u64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct MqttConfig {
    pub host: String,
    pub port: u16,
    pub client_id: String,
    pub username: Option<String>,
    pub password: Option<String>,
    pub device_id: String,
}

pub struct MqttState {
    pub client: Mutex<Option<AsyncClient>>,
}

impl Default for MqttState {
    fn default() -> Self {
        Self {
            client: Mutex::new(None),
        }
    }
}

#[tauri::command]
pub async fn mqtt_conectar(
    app: AppHandle,
    state: State<'_, MqttState>,
    config: MqttConfig,
) -> Result<(), String> {
    let mut mqtt_options = MqttOptions::new(
        config.client_id.clone(),
        config.host.clone(),
        config.port,
    );

    mqtt_options.set_keep_alive(Duration::from_secs(10));

    if let (Some(username), Some(password)) =
        (config.username.clone(), config.password.clone())
    {
        mqtt_options.set_credentials(username, password);
    }

    let (client, mut eventloop) = AsyncClient::new(mqtt_options, 10);

    client
        .subscribe("oxyelit/sensor", QoS::AtMostOnce)
        .await
        .map_err(|e| format!("Erro ao assinar sensor: {e}"))?;

    client
        .subscribe("oxyelit/metricas", QoS::AtMostOnce)
        .await
        .map_err(|e| format!("Erro ao assinar metricas: {e}"))?;

    app.emit("mqtt://conectado", true)
        .map_err(|e| format!("Erro ao emitir evento conectado: {e}"))?;

    let app_clone = app.clone();

    tokio::spawn(async move {
        loop {
            match eventloop.poll().await {
                Ok(Event::Incoming(Incoming::Publish(publish))) => {
                    let topic = publish.topic.clone();

                    let payload_text = match String::from_utf8(publish.payload.to_vec()) {
                        Ok(text) => text,
                        Err(_) => {
                            let _ = app_clone.emit(
                                "mqtt://erro",
                                "Payload MQTT não é UTF-8 válido",
                            );
                            continue;
                        }
                    };

                    if topic == "oxyelit/sensor" {
                        match serde_json::from_str::<SensorPayload>(&payload_text) {
                            Ok(dados) => {
                                let _ = app_clone.emit("sensor://leitura", dados);
                            }
                            Err(e) => {
                                let _ = app_clone.emit(
                                    "mqtt://erro",
                                    format!("Erro ao interpretar sensor: {e}"),
                                );
                            }
                        }
                    } else if topic == "oxyelit/metricas" {
                        match serde_json::from_str::<MetricasPayload>(&payload_text) {
                            Ok(dados) => {
                                let _ = app_clone.emit("sensor://metricas", dados);
                            }
                            Err(e) => {
                                let _ = app_clone.emit(
                                    "mqtt://erro",
                                    format!("Erro ao interpretar metricas: {e}"),
                                );
                            }
                        }
                    }
                }

                Ok(_) => {}

                Err(e) => {
                    let _ = app_clone.emit(
                        "mqtt://erro",
                        format!("Erro no event loop MQTT: {e}"),
                    );

                    let _ = app_clone.emit("mqtt://conectado", false);

                    break;
                }
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn mqtt_desconectar(state: State<'_, MqttState>) -> Result<(), String> {
    let mut guard = state.client.lock().await;

    if let Some(client) = guard.as_ref() {
        client
            .disconnect()
            .await
            .map_err(|e| format!("Erro ao desconectar MQTT: {e}"))?;
    }

    *guard = None;

    Ok(())
}