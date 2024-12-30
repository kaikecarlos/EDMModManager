use std::io::Write;

use serde::Serialize;
use serde_json::json;
use tauri::{ipc::Channel, AppHandle, Emitter};

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

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
enum InstallEvent<'a> {
    DownloadStarted { message: &'a str },
    DownloadProgress { url: &'a str, progress: u64 },
    ExtractionStarted { message: &'a str },
    ExtractionProgress { progress: u64 },
    ProcessCompleted { url: &'a str },
}

#[tauri::command]
fn install_mod(
    app: AppHandle,
    url: &str,
    game_folder_path: &str,
    unique_name: &str,
    mod_info: &str,
    on_event: Channel<InstallEvent>,
) -> bool {
    std::thread::sleep(std::time::Duration::from_secs(3));
    if let Err(e) = std::env::set_current_dir(game_folder_path) {
        eprintln!("Failed to set current directory to game_folder_path: {}", e);
        return false;
    }

    on_event
        .send(InstallEvent::DownloadStarted {
            message: "Baixando o mod!",
        })
        .unwrap();

    let response = match reqwest::blocking::get(url) {
        Ok(res) => res,
        Err(e) => {
            eprintln!("Failed to download mod: {}", e);
            return false;
        }
    };

    let total_size = match response.content_length() {
        Some(size) => size,
        None => {
            eprintln!("Failed to get content length");
            return false;
        }
    };

    let zip_file_name = format!("{}.zip", unique_name);
    let zip_path = std::path::Path::new(&zip_file_name);
    let mut downloaded: u64 = 0;
    let mut dest = match std::fs::File::create(&zip_path) {
        Ok(file) => file,
        Err(e) => {
            eprintln!("Failed to create ZIP file: {}", e);
            return false;
        }
    };

    let content = match response.bytes() {
        Ok(bytes) => bytes,
        Err(e) => {
            eprintln!("Failed to read response bytes: {}", e);
            return false;
        }
    };

    if let Err(e) = dest.write_all(&content) {
        eprintln!("Failed to write ZIP file: {}", e);
        return false;
    }
    downloaded += content.len() as u64;

    let progress = (downloaded as f64 / total_size as f64 * 100.0) as u64;
    on_event
        .send(InstallEvent::DownloadProgress { url, progress })
        .unwrap();

    on_event
        .send(InstallEvent::ExtractionStarted {
            message: &format!("Extraindo o mod '{}'", unique_name),
        })
        .unwrap();

    let dest = match std::fs::File::open(&zip_path) {
        Ok(file) => file,
        Err(e) => {
            eprintln!("Failed to open ZIP file: {}", e);
            return false;
        }
    };

    let mut archive = match zip::ZipArchive::new(dest) {
        Ok(archive) => archive,
        Err(e) => {
            eprintln!("Failed to open ZIP archive: {}", e);
            return false;
        }
    };

    let total_files = archive.len();
    for i in 0..total_files {
        let mut file = match archive.by_index(i) {
            Ok(file) => file,
            Err(e) => {
                eprintln!("Failed to read file from ZIP archive: {}", e);
                return false;
            }
        };

        let outpath = std::path::Path::new(file.name());
        if file.name().ends_with('/') {
            if let Err(e) = std::fs::create_dir_all(&outpath) {
                eprintln!("Failed to create directory: {}", e);
                return false;
            }
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    if let Err(e) = std::fs::create_dir_all(&p) {
                        eprintln!("Failed to create parent directory: {}", e);
                        return false;
                    }
                }
            }
            let mut outfile = match std::fs::File::create(&outpath) {
                Ok(file) => file,
                Err(e) => {
                    eprintln!("Failed to create file: {}", e);
                    return false;
                }
            };
            if let Err(e) = std::io::copy(&mut file, &mut outfile) {
                eprintln!("Failed to copy file: {}", e);
                return false;
            }
        }

        let progress = ((i + 1) as f64 / total_files as f64 * 100.0) as u64;
        on_event
            .send(InstallEvent::ExtractionProgress { progress })
            .unwrap();
    }

    if let Err(e) = std::fs::remove_file(&zip_path) {
        eprintln!("Failed to remove ZIP file: {}", e);
    }

    on_event
        .send(InstallEvent::ProcessCompleted { url })
        .unwrap();

    let mod_folder = std::path::Path::new(&std::env::var("APPDATA").unwrap())
        .join("EDMModManager")
        .join(unique_name);
    if let Err(e) = std::fs::create_dir_all(&mod_folder) {
        eprintln!("Failed to create mod folder: {}", e);
        return false;
    }
    let mod_json = serde_json::to_string_pretty(mod_info).unwrap();
    let mod_json_path = mod_folder.join("mod.json");
    if let Err(e) = std::fs::write(&mod_json_path, mod_json) {
        eprintln!("Failed to write mod.json file: {}", e);
        return false;
    }

    println!("Mod '{}' instalado com sucesso!", unique_name);
    true
}

#[tauri::command]
fn uninstall_mod(game_folder_path: &str, unique_name: &str, app: AppHandle) -> bool {
    std::thread::sleep(std::time::Duration::from_secs(3));
    if let Err(e) = std::env::set_current_dir(game_folder_path) {
        eprintln!("Failed to set current directory to game_folder_path: {}", e);
        return false;
    }

    let mod_folder_path = std::path::Path::new(game_folder_path)
        .join("plugins")
        .join(unique_name);
    println!("{}", mod_folder_path.display());
    if let Err(e) = std::fs::remove_dir_all(&mod_folder_path) {
        eprintln!("Failed to remove mod folder: {}", e);
        return false;
    }

    let mod_folder = std::path::Path::new(&std::env::var("APPDATA").unwrap())
        .join("EDMModManager")
        .join(unique_name);
    if let Err(e) = std::fs::remove_dir_all(&mod_folder) {
        eprintln!("Failed to remove mod folder: {}", e);
        return false;
    }


    app.emit(
        "process_completed",
        Some("Mod foi desinstalado!".to_string()),
    );
    println!("Mod '{}' desinstalado com sucesso!", unique_name);
    true
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
            install_mod,
            uninstall_mod,
            launch_game
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
