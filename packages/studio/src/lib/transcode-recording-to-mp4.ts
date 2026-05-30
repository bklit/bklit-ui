import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
} from "mediabunny";
import { drawVideoSampleToSrgbCanvas } from "./studio-recording-color";

const STUDIO_RECORDING_MP4_BITRATE = 16_000_000;

export interface TranscodeRecordingToMp4Options {
  blob: Blob;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
}

/** WebM/VP9 capture → H.264 MP4 (MediaRecorder MP4 tab capture is unreliable). */
export async function transcodeRecordingToMp4(
  options: TranscodeRecordingToMp4Options
): Promise<Blob> {
  const { blob, signal, onProgress } = options;

  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const input = new Input({
    source: new BlobSource(blob),
    formats: ALL_FORMATS,
  });

  const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
  });

  const conversion = await Conversion.init({
    input,
    output,
    video: {
      codec: "avc",
      bitrate: STUDIO_RECORDING_MP4_BITRATE,
      keyFrameInterval: 2,
      hardwareAcceleration: "prefer-software",
      process: (sample) => drawVideoSampleToSrgbCanvas(sample),
    },
  });

  if (!conversion.isValid) {
    throw new Error("This browser cannot convert the recording to MP4.");
  }

  conversion.onProgress = (progress) => {
    onProgress?.(progress);
  };

  const onAbort = () => {
    conversion.cancel().catch(() => undefined);
  };
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    await conversion.execute();
  } catch (caught) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    throw caught;
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }

  const buffer = output.target.buffer;
  if (!buffer) {
    throw new Error("MP4 conversion produced no data.");
  }

  return new Blob([buffer], { type: "video/mp4" });
}
