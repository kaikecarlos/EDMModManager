use std::io::Write;

use tauri::{AppHandle, Emitter};


#[tauri::command]
fn search_for_mods() -> String {
    // Procurar por mods em %appdata%/EDMModManager/
    // Dentro de cada pasta deve ter um arquivo mod.json
    // Esse arquivo deve conter informações como nome, descrição, autor, versão, etc
    let mut mods = vec![];
    let path = std::path::Path::new(&std::env::var("APPDATA").unwrap()).join("EDMModManager");
    if path.exists() {
        for entry in std::fs::read_dir(path).unwrap() {
            let entry = entry.unwrap();
            let path = entry.path();
            if path.is_dir() {
                let mod_json = path.join("mod.json");
                if mod_json.exists() {
                    let mod_json = std::fs::read_to_string(mod_json).unwrap();
                    let mod_json: serde_json::Value = serde_json::from_str(&mod_json).unwrap();
                    mods.push(mod_json);
                }
            }
        }
    } else {
        std::fs::create_dir(path).unwrap();
    }
    serde_json::to_string(&mods).unwrap()
}

#[tauri::command]
fn verify_bepinex(game_folder_path: &str) -> bool {
    let path = std::path::Path::new(game_folder_path).join("BepInEx");
    path.exists()
}

#[tauri::command]
fn download_bepinex(app: AppHandle, game_folder_path: &str) -> bool {
    let path = std::path::Path::new(game_folder_path);

    // TODO: Fazer com que essa URL não seja hardcoded
    let url = "https://github.com/BepInEx/BepInEx/releases/download/v5.4.23.2/BepInEx_win_x64_5.4.23.2.zip";

    app.emit(
        "download_started",
        Some("Baixando o zip do BepInEx".to_string()),
    )
    .unwrap();

    let response = reqwest::blocking::get(url).unwrap();
    let total_size = response
        .content_length()
        .expect("Failed to get content length");

    std::env::set_current_dir(game_folder_path).unwrap();
    let mut downloaded: u64 = 0;
    let mut dest = std::fs::File::create("BepInEx.zip").unwrap();
    let content = response.bytes().unwrap();

    dest.write_all(&content).unwrap();
    downloaded += content.len() as u64;

    let progress = (downloaded as f64 / total_size as f64 * 100.0) as u64;
    app.emit("download-progress", progress).unwrap();

    app.emit(
        "extraction_started",
        Some("Extraindo o BepInEx".to_string()),
    )
    .unwrap();

    let dest = std::fs::File::open("BepInEx.zip").unwrap();
    let mut archive = zip::ZipArchive::new(dest).unwrap();
    let total_files = archive.len();

    for i in 0..total_files {
        let mut file = archive.by_index(i).unwrap();
        let outpath = path.join(file.name());

        if (*file.name()).ends_with('/') {
            std::fs::create_dir_all(&outpath).unwrap();
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    std::fs::create_dir_all(&p).unwrap();
                }
            }
            let mut outfile = std::fs::File::create(&outpath).unwrap();
            std::io::copy(&mut file, &mut outfile).unwrap();
        }

        let progress = ((i + 1) as f64 / total_files as f64 * 100.0) as u64;

        app.emit("extraction-progress", progress).unwrap();
    }

    std::fs::remove_file("BepInEx.zip").unwrap();
    app.emit(
        "process_completed",
        Some("BepInEx foi instalado!".to_string()),
    )
    .unwrap();
    return true;
}

#[tauri::command]
fn launch_game(game_folder_path: &str) -> bool {
    let path = std::path::Path::new(game_folder_path).join("Enigma.exe");
    std::process::Command::new(path).spawn().is_ok()
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            search_for_mods,
            verify_bepinex,
            download_bepinex,
            launch_game
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
