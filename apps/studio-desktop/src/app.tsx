import { StudioShell } from "@bklitui/studio";
import { DesktopStudioCodeSheet } from "./components/desktop-studio-code-sheet";

export default function App() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <StudioShell
          renderCodeSheet={(state) => <DesktopStudioCodeSheet state={state} />}
        />
      </main>
    </div>
  );
}
