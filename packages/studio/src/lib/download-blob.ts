export type SaveBlobHandler = (
  blob: Blob,
  filename: string
) => void | Promise<void>;

function defaultBrowserSave(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

let saveBlobHandler: SaveBlobHandler = defaultBrowserSave;

/** Override blob export behavior (e.g. native save dialog in Tauri). */
export function setSaveBlobHandler(handler: SaveBlobHandler) {
  saveBlobHandler = handler;
}

export function resetSaveBlobHandler() {
  saveBlobHandler = defaultBrowserSave;
}

/** Save a blob using the active handler (browser download by default). */
export async function downloadBlob(blob: Blob, filename: string) {
  await saveBlobHandler(blob, filename);
}
