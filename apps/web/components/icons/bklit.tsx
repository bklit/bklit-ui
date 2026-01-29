"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
  theme?: "light" | "dark";
  variant?: "default" | "blended";
}

export function BklitLogo({
  className,
  size = 16,
  theme = "dark",
  variant = "default",
}: IconProps) {
  const id = useId();

  const rgbColor = theme === "dark" ? "255, 255, 255" : "0, 0, 0";
  const blendMode = variant === "blended" ? "color-burn" : "normal";

  return (
    <div
      className={cn(
        "relative aspect-square h-full min-h-4 w-full min-w-4",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        className={cn(
          "h-auto max-h-full w-full max-w-full",
          theme === "light" ? "text-black" : "text-white"
        )}
        fill="none"
        viewBox="0 0 112 179"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Bklit Logo</title>
        <path
          d="M11.082 88.6498C11.082 88.6498 24.4884 66.4873 55.407 66.4873C84.2319 66.4873 99.732 88.6498 99.732 88.6498C99.732 88.6498 86.1801 110.813 55.407 110.812C26.7612 110.812 11.082 88.6498 11.082 88.6498Z"
          fill="url(#paint0_radial_375_479)"
        />
        <g style={{ mixBlendMode: "normal" }}>
          <path
            d="M11.082 88.6498C11.082 88.6498 24.4884 66.4873 55.407 66.4873C84.2319 66.4873 99.732 88.6498 99.732 88.6498C99.732 88.6498 86.1801 110.813 55.407 110.812C26.7612 110.812 11.082 88.6498 11.082 88.6498Z"
            fill={`url(#paint1_radial_${id})`}
          />
        </g>
        <g style={{ mixBlendMode: "normal" }}>
          <path
            d="M110.812 121.894C110.812 148.67 90.0415 177.3 55.4062 177.3V110.812C55.4062 110.812 83.2175 112.19 99.7312 88.6499C108.153 99.9149 110.812 111.675 110.812 121.894Z"
            fill={`url(#paint2_linear_${id})`}
          />
        </g>
        <g style={{ mixBlendMode: blendMode }}>
          <path
            d="M3.8147e-06 121.894C3.8147e-06 148.67 20.771 177.3 55.4062 177.3V110.812C55.4062 110.812 29.4726 112.262 11.0813 88.6499C2.65942 99.9149 3.8147e-06 111.675 3.8147e-06 121.894Z"
            fill={`url(#paint3_linear_${id})`}
          />
        </g>
        <g style={{ mixBlendMode: "normal" }}>
          <path
            d="M6.72096e-06 55.4061C9.06185e-06 28.6295 20.771 -9.45806e-05 55.4063 -9.15527e-05L55.4063 66.4874C55.4063 66.4874 27.595 65.1102 11.0813 88.6499C2.65942 77.3849 5.82758e-06 65.6252 6.72096e-06 55.4061Z"
            fill={`url(#paint4_linear_${id})`}
          />
        </g>
        <g style={{ mixBlendMode: blendMode }}>
          <path
            d="M110.812 55.4062C110.813 28.6295 90.0415 -8.85248e-05 55.4063 -9.15527e-05L55.4063 66.4874C55.4063 66.4874 81.5638 65.1362 99.7312 88.6499C108.153 77.3849 110.812 65.6252 110.812 55.4062Z"
            fill={`url(#paint5_linear_${id})`}
          />
        </g>
        <defs>
          {/* Eye */}
          <linearGradient
            gradientUnits="objectBoundingBox"
            id={`paint1_radial_${id}`}
            x1="0"
            x2="1"
            y1="0"
            y2="0"
          >
            <stop offset="0" stopColor={`rgba(${rgbColor})`} />
            <stop offset="0.5" stopColor={`rgba(${rgbColor}, 0.8)`} />
            <stop offset="1" stopColor={`rgba(${rgbColor})`} />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={`paint2_linear_${id}`}
            x1="55.4062"
            x2="110.813"
            y1="177.3"
            y2="66.6642"
          >
            <stop stopColor="currentColor" />
            <stop offset="1" stopColor={`rgba(${rgbColor}, 0.5)`} />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={`paint3_linear_${id}`}
            x1="55.4063"
            x2="-8.65898e-06"
            y1="177.3"
            y2="66.6642"
          >
            <stop stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.745192" stopColor={"rgba(120,120,120, 0.5)"} />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={`paint4_linear_${id}`}
            x1="55.4063"
            x2="-1.0581e-05"
            y1="-8.79084e-05"
            y2="110.636"
          >
            <stop stopColor="currentColor" />
            <stop offset="1" stopColor={`rgba(${rgbColor}, 0.5)`} />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={`paint5_linear_${id}`}
            x1="55.4063"
            x2="110.813"
            y1="-8.79084e-05"
            y2="110.636"
          >
            <stop stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.75" stopColor={"rgba(120,120,120, 0.5)"} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
