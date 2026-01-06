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
  const base =
    variant === "primary"
      ? "bg-white/65 border-white/40 hover:bg-white/78"
      : "bg-white/40 border-white/30 hover:bg-white/55";

  return (
    <button
      className={cn(
        // layout
        "water-btn relative inline-flex items-center justify-center gap-2",
        "rounded-2xl px-5 py-3",
        // glass base
        "backdrop-blur-xl border",
        base,
        // text + motion
        "text-black",
        "transition-all duration-200",
        "hover:-translate-y-[1px] hover:shadow-[0_16px_50px_rgba(0,0,0,0.16)]",
        "active:translate-y-0 active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30",
        className
      )}
      {...props}
    >
      {/* soft highlight plate */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.95),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.65),transparent_50%)]",
          "opacity-70"
        )}
      />
      <span className="relative water-btn-text">{props.children}</span>
    </button>
  );
}
