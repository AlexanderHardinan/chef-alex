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
        "relative border border-black/10 bg-white/65 backdrop-blur-xl",
        "shadow-[0_16px_45px_rgba(0,0,0,0.10)]",
        radiusMap[radius],
        padded && "p-6",
        hover &&
          "transition-transform duration-200 hover:-translate-y-[1px] hover:shadow-[0_22px_70px_rgba(0,0,0,0.14)]",
        className
      )}
      {...props}
    />
  );
}
