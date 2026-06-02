import { openUrl } from "@tauri-apps/plugin-opener";

export async function openExternalUrl(url: string) {
  await openUrl(url);
}
