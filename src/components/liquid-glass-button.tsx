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
    "water-gloss water-gloss-hover water-gloss-press water-gloss-focus " +
    "relative inline-flex items-center justify-center gap-2 " +
    "rounded-2xl px-5 py-3 " +
    "transition-transform";

  const primary =
    // Uses global tokens. Slightly stronger surface than ghost.
    "bg-[color:var(--glass-bg)] border-[color:var(--glass-border)]";

  const ghost =
    // Lighter, more transparent surface.
    "bg-[color:rgba(255,255,255,0.38)] border-[color:rgba(0,0,0,0.10)]";

  return (
    <button
      className={cn(base, variant === "primary" ? primary : ghost, "text-black", className)}
      {...props}
    >
      {/* Water highlight + sheen overlay (kept subtle, email-safe not relevant; UI only) */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "opacity-80",
          "bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.95),transparent_55%),radial-gradient(circle_at_85%_0%,rgba(255,255,255,0.55),transparent_45%)]"
        )}
      />
      <span className="relative">{props.children}</span>
    </button>
  );
}
