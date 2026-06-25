use tauri::Manager;
use tauri_plugin_sql::{DbPool, DbInstances};

mod mqtt;

#[tauri::command]
async fn gravar_leitura_sensor(
    app: tauri::AppHandle,
    sessao_id: i64,
    pressao:   f64,
    limiar:    f64,
    solenoide: i64,
    ts:        i64,
) -> Result<(), String> {
    let instances = app.state::<DbInstances>();
    
    // CORREÇÃO: Removemos o .cloned() daqui para não tentar clonar o DbPool inteiro.
    // Usamos apenas uma referência para ler o conteúdo com segurança.
    let instances_map = instances.0.read().await;
    let pool = instances_map
        .get("sqlite:oxyelit.db")
        .ok_or("Banco não encontrado")?;

    // Fazemos o match por referência (&pool)
    match pool {
        DbPool::Sqlite(p) => {
            // .clone() é chamado diretamente no pool do sqlx (p), o que é permitido e super leve!
            sqlx::query(
                "INSERT INTO leituras_sensor (sessao_id, ts, pressao, limiar, solenoide)
                 VALUES (?, ?, ?, ?, ?)"
            )
            .bind(sessao_id)
            .bind(ts)
            .bind(pressao)
            .bind(limiar)
            .bind(solenoide)
            .execute(&p.clone()) 
            .await
            .map_err(|e| format!("Erro ao gravar leitura: {e}"))?;

            Ok(())
        }
        _ => Err("Banco não é SQLite".into()),
    }
}

#[tauri::command]
fn redimensionar_janela(app: tauri::AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Janela não encontrada")?;

    window.unmaximize().map_err(|e| e.to_string())?;

    std::thread::sleep(std::time::Duration::from_millis(100));

    window
        .set_size(tauri::Size::Logical(tauri::LogicalSize {
            width: 900.0,
            height: 600.0,
        }))
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .manage(mqtt::MqttState::default())
        .invoke_handler(tauri::generate_handler![
            redimensionar_janela,
            mqtt::mqtt_conectar,
            mqtt::mqtt_desconectar,
            gravar_leitura_sensor
        ])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o app");
}z