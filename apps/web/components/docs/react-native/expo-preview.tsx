import { EXPO_PREVIEW_URL } from "@/lib/expo-preview";
import { ChartQrCode } from "./chart-qr-code";

const STEPS = [
  "Install Expo Go from the App Store or Google Play.",
  "Open your phone's camera and point it at the code.",
  "Tap the banner to open the Bklit demo in Expo Go.",
];

/** Scan-to-try card for the React Native demo app. */
export function ExpoPreview() {
  return (
    <div className="not-prose my-6 flex flex-col items-center gap-6 rounded-2xl border bg-card p-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="w-44 shrink-0 sm:w-48">
        {EXPO_PREVIEW_URL ? (
          <ChartQrCode
            label="QR code that opens the Bklit React Native demo in Expo Go"
            value={EXPO_PREVIEW_URL}
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed text-center text-muted-foreground text-xs">
            Preview link
            <br />
            coming soon
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <p className="font-medium text-foreground">Try it on your phone</p>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-muted-foreground text-sm">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="text-muted-foreground text-xs">
          Drag across a chart to scrub; use two fingers to select a range.
        </p>
      </div>
    </div>
  );
}
