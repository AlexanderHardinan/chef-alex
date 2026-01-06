// src/components/water-card.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Radius = "lg" | "xl" | "2xl" | "3xl";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  padded?: boolean;
  radius?: Radius;
};

const radiusMap: Record<Radius, string> = {
  lg: "rounded-2xl",
  xl: "rounded-3xl",
  "2xl": "rounded-[28px]",
  "3xl": "rounded-[32px]",
};

export default function WaterCard({
  className,
  hover = true,
  padded = true,
  radius = "xl",
  ...props
}: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "border border-black/10",
        "bg-white/55 backdrop-blur-2xl",
        "shadow-[0_16px_45px_rgba(0,0,0,0.10)]",
        radiusMap[radius],
        padded && "p-6",
        hover &&
          "transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_24px_78px_rgba(0,0,0,0.14)]",
        // Glossy internal highlights
        "before:pointer-events-none before:absolute before:inset-0",
        "before:bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.92),transparent_58%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.55),transparent_55%)]",
        "before:opacity-70",
        // Subtle top sheen
        "after:pointer-events-none after:absolute after:inset-0",
        "after:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),transparent_55%)]",
        "after:opacity-35",
        className
      )}
      {...props}
    />
  );
}
