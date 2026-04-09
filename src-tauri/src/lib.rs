use std::fs;
use tauri::Manager;
use rusqlite::{Connection, Result};

fn init_db(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_data_dir = app.path().app_data_dir()?;
    let resource_dir = app.path().resource_dir()?;
    
    // mostra os caminhos no terminal
    println!("app_data_dir: {:?}", app_data_dir);
    println!("resource_dir: {:?}", resource_dir);
    
    // cria a pasta se não existir
    fs::create_dir_all(&app_data_dir)?;
    
    let db_dest = app_data_dir.join("banco.db");

    // só copia se ainda não existir (primeira execução)
    if !db_dest.exists() {
        let db_origin = app.path().resource_dir()?.join("database.sqlite");
        fs::copy(&db_origin, &db_dest)?;
        println!("Banco copiado para: {:?}", db_dest);
    }

    // abre o banco já no destino correto
    let conn = Connection::open(&db_dest)?;
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crm TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            name TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS nurses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coren TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            name TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            birth_date TEXT NOT NULL,
            bed TEXT NOT NULL,
            status TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS prescriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            oxygen_flow REAL NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            status TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        );
        CREATE TABLE IF NOT EXISTS monitoring (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            nurse_id INTEGER NOT NULL,
            spo2 REAL NOT NULL,
            oxygen_flow REAL NOT NULL,
            heart_rate INTEGER,
            recorded_at TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (nurse_id) REFERENCES nurses(id)
        );
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            nurse_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            read INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (nurse_id) REFERENCES nurses(id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        );"
    )?;
    // temporário — adiciona logo após o execute_batch no init_db
    let mut stmt = conn.prepare("SELECT * FROM doctors").unwrap();
    let rows: Vec<String> = stmt.query_map([], |row| {
        row.get::<_, String>(1)
    }).unwrap().map(|r| r.unwrap()).collect();
    println!("Doctors no banco: {:?}", rows);
    // dados de teste
    let _ = conn.execute("INSERT OR IGNORE INTO doctors (crm, password, name) VALUES ('A123', '1234', 'Dr. Evaristo')", []);
    let _ = conn.execute("INSERT OR IGNORE INTO nurses (coren, password, name) VALUES ('B123', '1234', 'Enf. Maria')", []);

    println!("Banco inicializado em: {:?}", db_dest);
    Ok(())
}

#[tauri::command]
fn redimensionar_janela(app: tauri::AppHandle) -> Result<(), String> {
    let window = app.get_webview_window("main")
        .ok_or("Janela não encontrada")?;
    
    window.unmaximize().map_err(|e| e.to_string())?;

    std::thread::sleep(std::time::Duration::from_millis(100));
    
    window.set_size(tauri::Size::Logical(tauri::LogicalSize { 
        width: 900.0, 
        height: 600.0 
    })).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn login_medico(
    app: tauri::AppHandle,
    crm: String,
    password: String,
) -> Result<String, String> {
    let db_path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("banco.db");

    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    let result = conn.query_row(
        "SELECT id FROM doctors WHERE crm = ?1 AND password = ?2",
        [&crm, &password],
        |row| row.get::<_, i64>(0),
    );

    match result {
        Ok(_) => Ok("ok".to_string()),
        Err(_) => Err("CRM ou senha inválidos".to_string()),
    }
}

#[tauri::command]
fn login_enfermeiro(
    app: tauri::AppHandle,
    coren: String,
    password: String,
) -> Result<String, String> {
    let db_path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("banco.db");

    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    let result = conn.query_row(
        "SELECT id FROM nurses WHERE coren = ?1 AND password = ?2",
        [&coren, &password],
        |row| row.get::<_, i64>(0),
    );

    match result {
        Ok(_) => Ok("ok".to_string()),
        Err(_) => Err("COREN ou senha inválidos".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            init_db(&app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            login_medico,
            login_enfermeiro,
            redimensionar_janela,
        ])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o app");
}
