import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

export function SafariIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      className={cn("icon", className)}
      height={size}
      viewBox="0 0 512 512"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Safari Icon</title>
      <g id="_x34_0-safari_x2C__browser">
        <g>
          <g>
            <path
              d="M494.604,256c0,132.131-106.83,239.25-238.602,239.25C124.22,495.25,17.397,388.131,17.397,256     c0-132.135,106.823-239.25,238.605-239.25C387.773,16.75,494.604,123.865,494.604,256L494.604,256z M494.604,256"
              fill="#2299F8"
            />
            <path
              d="M226.174,226.093L106.873,405.532L285.82,285.901L226.174,226.093z M226.174,226.093"
              fill="#FCFCFC"
            />
            <path
              d="M226.174,226.093l59.646,59.809l119.309-179.433L226.174,226.093z M226.174,226.093"
              fill="#F84437"
            />
          </g>
        </g>
      </g>
      <g id="Layer_1" />
    </svg>
  );
}
