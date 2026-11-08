import { DEMO_ANDROID_URL, DEMO_IOS_URL } from "@/lib/expo-preview";
import { ChartQrCode } from "./chart-qr-code";

const ANDROID_STEPS = [
  "Scan the code with your Android phone's camera, or open the link below on the phone.",
  "Tap Install and download the app.",
  "If Android asks, allow your browser to install apps.",
];

const LINK_CLASS =
  "font-medium text-foreground underline underline-offset-4 hover:text-foreground/80";

/** Scan-to-install card for the React Native demo app. */
export function ExpoPreview() {
  return (
    <div className="not-prose my-6 flex flex-col items-center gap-6 rounded-2xl border bg-card p-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="w-44 shrink-0 sm:w-48">
        {DEMO_ANDROID_URL ? (
          <ChartQrCode
            label="QR code that opens the install page for the Bklit React Native demo on Android"
            value={DEMO_ANDROID_URL}
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed text-center text-muted-foreground text-xs">
            Demo app
            <br />
            coming soon
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <p className="font-medium text-foreground">Try it on your phone</p>
        {DEMO_ANDROID_URL ? (
          <>
            <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-muted-foreground text-sm">
              {ANDROID_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <a
              className={`${LINK_CLASS} text-sm`}
              href={DEMO_ANDROID_URL}
              rel="noopener"
              target="_blank"
            >
              Get the Android app
            </a>
          </>
        ) : null}
        <p className="text-muted-foreground text-sm">
          {DEMO_IOS_URL ? (
            <>
              On iPhone, join the{" "}
              <a
                className={LINK_CLASS}
                href={DEMO_IOS_URL}
                rel="noopener"
                target="_blank"
              >
                TestFlight beta
              </a>
              .
            </>
          ) : (
            "iPhone: coming soon on TestFlight."
          )}
        </p>
        <p className="text-muted-foreground text-xs">
          Drag across a chart to scrub; use two fingers to select a range.
        </p>
      </div>
    </div>
  );
}
