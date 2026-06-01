import { save } from "@tauri-apps/plugin-dialog";
import { writeFile, writeTextFile } from "@tauri-apps/plugin-fs";

const FILTER_NAMES: Record<string, string> = {
  svg: "SVG Image",
  webm: "WebM Video",
  mp4: "MP4 Video",
};

function saveFiltersForFilename(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (!extension) {
    return undefined;
  }

  return [
    {
      name: FILTER_NAMES[extension] ?? extension.toUpperCase(),
      extensions: [extension],
    },
  ];
}

function extensionForFilename(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

/** Native macOS save dialog + filesystem write for Studio exports. */
export async function saveBlobNative(blob: Blob, filename: string) {
  const path = await save({
    defaultPath: filename,
    filters: saveFiltersForFilename(filename),
  });

  if (!path) {
    return;
  }

  const extension = extensionForFilename(filename);

  if (extension === "svg") {
    const text = await blob.text();
    if (text.length === 0) {
      throw new Error("Export produced empty SVG content.");
    }
    await writeTextFile(path, text);
    return;
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes.byteLength === 0) {
    throw new Error("Export produced empty file content.");
  }

  await writeFile(path, bytes);
}
