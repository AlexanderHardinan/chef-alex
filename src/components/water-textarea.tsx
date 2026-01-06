"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function WaterTextarea({ className, ...props }: Props) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-black/10 bg-white/70 backdrop-blur-xl px-4 py-3",
        "outline-none transition-all duration-200",
        "focus:ring-2 focus:ring-black/20 focus:border-black/20",
        "hover:bg-white/80",
        className
      )}
      {...props}
    />
  );
}
