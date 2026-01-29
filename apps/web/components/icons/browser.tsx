import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

export function BrowserIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      className={cn("icon", className)}
      height={size}
      viewBox="0 0 512 512"
      width={size}
    >
      <title>Browser Icon</title>
      <path
        d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zM256 448c-105.9 0-192-86.1-192-192S150.1 64 256 64s192 86.1 192 192-86.1 192-192 192z"
        fill="#6B7280"
      />
      <path
        d="M256 128c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128-57.3-128-128-128zm0 192c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"
        fill="#6B7280"
      />
      <path
        d="M256 160c-53 0-96 43-96 96s43 96 96 96 96-43 96-96-43-96-96-96zm0 128c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"
        fill="#6B7280"
      />
    </svg>
  );
}
