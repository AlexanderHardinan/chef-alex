import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  padded?: boolean;
  radius?: "lg" | "xl";
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
        // Base water-gloss surface
        "water-gloss",
        // Optional hover micro-interaction
        hover ? "water-gloss-hover" : "",
        // Padding preset
        padded ? "water-card" : "",
        // Radius control (matches your aesthetic)
        radius === "xl" ? "rounded-[var(--radius-xl)]" : "rounded-[var(--radius-lg)]",
        className
      )}
      {...props}
    />
  );
}
