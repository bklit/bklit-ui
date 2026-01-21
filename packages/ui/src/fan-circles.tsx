"use client";

import { motion } from "motion/react";
import { useState } from "react";

const CIRCLE_COUNT = 5;
const FAN_RADIUS = 60;
const FAN_ANGLE = 180; // degrees to spread across

export function FanCircles() {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate positions for fanned circles
  const getCirclePosition = (index: number) => {
    const startAngle = -90 - FAN_ANGLE / 2; // Start from top-left
    const angleStep = FAN_ANGLE / (CIRCLE_COUNT - 1);
    const angle = startAngle + index * angleStep;
    const radians = (angle * Math.PI) / 180;

    return {
      x: Math.cos(radians) * FAN_RADIUS,
      y: Math.sin(radians) * FAN_RADIUS,
    };
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Animation hover target */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Animation hover target */}
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Fanned circles */}
        {Array.from({ length: CIRCLE_COUNT }).map((_, index) => {
          const position = getCirclePosition(index);
          const hue = index * (360 / CIRCLE_COUNT);
          return (
            <motion.div
              animate={{
                x: isHovered ? position.x : 0,
                y: isHovered ? position.y : 0,
                scale: isHovered ? 1 : 0,
                opacity: isHovered ? 1 : 0,
              }}
              className="absolute top-1/2 left-1/2 h-8 w-8 rounded-full"
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              key={`circle-hue-${hue}`}
              style={{
                backgroundColor: `hsl(${hue}, 70%, 60%)`,
                marginLeft: -16,
                marginTop: -16,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
                delay: index * 0.05,
              }}
            />
          );
        })}

        {/* Main target circle */}
        <motion.div
          className="relative z-10 h-8 w-8 cursor-pointer rounded-full bg-foreground"
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        />
      </div>
    </div>
  );
}
