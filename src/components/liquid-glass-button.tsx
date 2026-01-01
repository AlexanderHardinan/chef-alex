"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export default function LiquidGlassButton({
  className,
  variant = "primary",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3",
        "transition-transform duration-200 active:scale-[0.98]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30",
        // Liquid glass base
        "backdrop-blur-xl",
        "border",
        variant === "primary"
          ? "bg-white/55 border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.10)] hover:bg-white/65"
          : "bg-white/35 border-white/35 hover:bg-white/45",
        "text-black",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.85),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.65),transparent_45%)]",
          "opacity-70"
        )}
      />
      <span className="relative">{props.children}</span>
    </button>
  );
}
