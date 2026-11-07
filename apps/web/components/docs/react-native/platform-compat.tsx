import { cn } from "@/lib/utils";
import { PLATFORM_ICON_PATHS, type PlatformIcon } from "./platform-icons";

type Status = "supported" | "untested" | "unsupported";

interface Platform {
  icon: PlatformIcon;
  name: string;
  detail: string;
  status: Status;
}

const PLATFORMS: Platform[] = [
  {
    icon: "reactNative",
    name: "React Native",
    detail: "New Architecture",
    status: "supported",
  },
  {
    icon: "expo",
    name: "Expo",
    detail: "SDK 58, Expo Go",
    status: "supported",
  },
  {
    icon: "apple",
    name: "iOS",
    detail: "Tested on iOS 26",
    status: "supported",
  },
  {
    icon: "android",
    name: "Android",
    detail: "Expected to work",
    status: "untested",
  },
];

const STATUS_LABEL: Record<Status, string> = {
  supported: "Supported",
  untested: "Not yet tested",
  unsupported: "Not supported",
};

const STATUS_DOT: Record<Status, string> = {
  supported: "bg-emerald-500",
  untested: "bg-orange-500",
  unsupported: "bg-muted-foreground",
};

/** Monochrome platform marks with support status, for the React Native guide. */
export function PlatformCompat() {
  return (
    <div className="not-prose my-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {PLATFORMS.map((p) => (
        <div
          className="flex flex-col items-center gap-3 rounded-xl border bg-card px-3 py-5 text-center"
          key={p.icon}
        >
          <svg
            aria-hidden="true"
            className="size-8 text-foreground"
            fill="currentColor"
            role="img"
            viewBox="0 0 24 24"
          >
            <path d={PLATFORM_ICON_PATHS[p.icon]} />
          </svg>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground text-sm">
              {p.name}
            </span>
            <span className="text-muted-foreground text-xs">{p.detail}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
            <span
              className={cn("size-1.5 rounded-full", STATUS_DOT[p.status])}
            />
            {STATUS_LABEL[p.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
