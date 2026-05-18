use rumqttc::{AsyncClient, Event, Incoming, MqttOptions, QoS};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tauri::{AppHandle, Emitter, State};
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeituraSensorMqtt {
    #[serde(rename = "deviceId")]
    pub device_id: String,
    pub timestamp: Option<i64>,
    pub pressao: f64,
    pub unidade: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatusDispositivoMqtt {
    #[serde(rename = "deviceId")]
    pub device_id: String,
    pub status: String,
    pub rssi: Option<i32>,
    pub timestamp: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErroDispositivoMqtt {
    #[serde(rename = "deviceId")]
    pub device_id: String,
    pub codigo: String,
    pub mensagem: String,
    pub timestamp: Option<i64>,
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

    let leituras_topic = format!("oxyelit/dispositivos/{}/leituras", config.device_id);
    let status_topic = format!("oxyelit/dispositivos/{}/status", config.device_id);
    let erro_topic = format!("oxyelit/dispositivos/{}/erro", config.device_id);

    client
        .subscribe(leituras_topic.clone(), QoS::AtMostOnce)
        .await
        .map_err(|e| format!("Erro ao assinar leituras: {e}"))?;

    client
        .subscribe(status_topic.clone(), QoS::AtLeastOnce)
        .await
        .map_err(|e| format!("Erro ao assinar status: {e}"))?;

    client
        .subscribe(erro_topic.clone(), QoS::AtLeastOnce)
        .await
        .map_err(|e| format!("Erro ao assinar erro: {e}"))?;

    {
        let mut guard = state.client.lock().await;
        *guard = Some(client.clone());
    }

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

                    if topic.ends_with("/leituras") {
                        match serde_json::from_str::<LeituraSensorMqtt>(&payload_text) {
                            Ok(leitura) => {
                                let _ = app_clone.emit("sensor://leitura", leitura);
                            }
                            Err(e) => {
                                let _ = app_clone.emit(
                                    "mqtt://erro",
                                    format!("Erro ao interpretar leitura: {e}"),
                                );
                            }
                        }
                    } else if topic.ends_with("/status") {
                        match serde_json::from_str::<StatusDispositivoMqtt>(&payload_text) {
                            Ok(status) => {
                                let _ = app_clone.emit("sensor://status", status);
                            }
                            Err(e) => {
                                let _ = app_clone.emit(
                                    "mqtt://erro",
                                    format!("Erro ao interpretar status: {e}"),
                                );
                            }
                        }
                    } else if topic.ends_with("/erro") {
                        match serde_json::from_str::<ErroDispositivoMqtt>(&payload_text) {
                            Ok(erro) => {
                                let _ = app_clone.emit("sensor://erro", erro);
                            }
                            Err(e) => {
                                let _ = app_clone.emit(
                                    "mqtt://erro",
                                    format!("Erro ao interpretar erro: {e}"),
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