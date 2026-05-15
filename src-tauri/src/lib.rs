use tauri::Manager;

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
        .invoke_handler(tauri::generate_handler![
            redimensionar_janela,
        ])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o app");
}