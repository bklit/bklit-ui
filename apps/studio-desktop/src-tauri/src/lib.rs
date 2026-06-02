#[cfg(target_os = "macos")]
fn set_macos_process_name(name: &str) {
    use objc2_foundation::{NSProcessInfo, NSString};

    let process_info = NSProcessInfo::processInfo();
    let process_name = NSString::from_str(name);
    process_info.setProcessName(&process_name);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "macos")]
    set_macos_process_name("Bklit Studio");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
