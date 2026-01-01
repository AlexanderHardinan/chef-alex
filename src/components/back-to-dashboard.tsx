"use client";

import { useRouter } from "next/navigation";
import LiquidGlassButton from "@/components/liquid-glass-button";

export default function BackToDashboard() {
  const router = useRouter();
  return (
    <LiquidGlassButton variant="ghost" onClick={() => router.push("/dashboard")}>
      Back to Dashboard
    </LiquidGlassButton>
  );
}
