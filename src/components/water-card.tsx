import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  padded?: boolean;
};

export default function WaterCard({ className, hover = true, padded = true, ...props }: Props) {
  return (
    <div
      className={cn(
        "water-gloss",
        hover ? "water-gloss-hover" : "",
        padded ? "water-card" : "",
        className
      )}
      {...props}
    />
  );
}
