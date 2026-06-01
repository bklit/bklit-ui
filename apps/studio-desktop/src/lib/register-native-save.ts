import { setSaveBlobHandler } from "@bklitui/studio";
import { saveBlobNative } from "./save-blob-native";

setSaveBlobHandler(saveBlobNative);
