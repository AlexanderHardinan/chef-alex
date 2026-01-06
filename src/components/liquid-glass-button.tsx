// src/components/liquid-glass-button.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export default function LiquidGlassButton({
  className,
  variant = "primary",
  disabled,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled}
      className={cn(
        // Layout
        "relative inline-flex items-center justify-center gap-2",
        "rounded-2xl px-5 py-3",
        "select-none",
        // Typography
        "font-semibold tracking-tight",
        "text-black",
        // Base glass
        "backdrop-blur-2xl",
        "border border-black/10",
        // Motion
        "transition-all duration-200 ease-out",
        "active:scale-[0.98]",
        "hover:-translate-y-[1px]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30",
        // Shadows (deeper + cleaner)
        variant === "primary"
          ? "bg-white/45 shadow-[0_14px_40px_rgba(0,0,0,0.12)] hover:bg-white/55 hover:shadow-[0_22px_70px_rgba(0,0,0,0.16)]"
          : "bg-white/25 shadow-[0_10px_26px_rgba(0,0,0,0.08)] hover:bg-white/35 hover:shadow-[0_18px_55px_rgba(0,0,0,0.12)]",
        // Gloss highlight layers
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl",
        "before:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.95),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.65),transparent_50%)]",
        "before:opacity-70",
        // Top edge sheen
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl",
        "after:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.70),transparent_45%)]",
        "after:opacity-40",
        // Disabled
        disabled && "opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)]",
        className
      )}
      {...props}
    >
      <span className="relative transition-opacity duration-200 group-hover:opacity-90">
        {props.children}
      </span>
    </button>
  );
}
