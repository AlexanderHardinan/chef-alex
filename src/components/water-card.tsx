import * as React from "react";
import { cn } from "@/lib/utils";

type Radius = "lg" | "xl";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  padded?: boolean;
  radius?: Radius; // ✅ add
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
        "water-gloss",
        hover ? "water-gloss-hover" : "",
        padded ? "water-card" : "",
        radius === "lg" ? "rounded-[18px]" : "rounded-[24px]",
        className
      )}
      {...props}
    />
  );
}
