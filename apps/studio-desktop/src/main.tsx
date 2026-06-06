import { processStudioUrlSearchParams } from "@bklitui/studio";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/react";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import "./lib/register-native-save";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NuqsAdapter processUrlSearchParams={processStudioUrlSearchParams}>
          <Suspense
            fallback={
              <div className="flex h-dvh items-center justify-center text-muted-foreground text-sm">
                Loading studio…
              </div>
            }
          >
            <App />
          </Suspense>
        </NuqsAdapter>
      </ThemeProvider>
    </StrictMode>
  );
}
