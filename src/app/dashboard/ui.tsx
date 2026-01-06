// src/app/dashboard/ui.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import LiquidGlassButton from "@/components/liquid-glass-button";
import WaterCard from "@/components/water-card";
import DashboardAnalytics from "@/components/dashboard/dashboard-analytics";
import { toast } from "sonner";

export default function DashboardClient() {
  const supabase = supabaseBrowser();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      setReady(true);
    })();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    window.location.href = "/login";
  };

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-white text-black px-5 py-8">
      {/* background “drama” without dark mode */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,0,0,0.06),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(0,0,0,0.04),transparent_42%),radial-gradient(circle_at_60%_90%,rgba(0,0,0,0.03),transparent_45%)]" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-black/10">
              <Image src="/chefalex.png" alt="Chef Alex" fill className="object-cover" priority />
            </div>
            <div className="min-w-0">
              <div className="text-3xl font-extrabold tracking-tight leading-tight">Chef Alex</div>
              <div className="text-sm text-black/70">My world, My style</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LiquidGlassButton variant="ghost" onClick={() => (window.location.href = "/send")}>
              Send Email
            </LiquidGlassButton>
            <LiquidGlassButton variant="ghost" onClick={() => (window.location.href = "/reports?tab=sent")}>
              Reports
            </LiquidGlassButton>
            <LiquidGlassButton variant="ghost" onClick={signOut}>
              Sign Out
            </LiquidGlassButton>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
          <WaterCard hover>
            <div className="text-lg font-semibold tracking-tight">Home</div>
            <div className="mt-2 text-sm text-black/70">Return to dashboard landing.</div>
            <div className="mt-4">
              <LiquidGlassButton onClick={() => (window.location.href = "/dashboard")}>Home Page</LiquidGlassButton>
            </div>
          </WaterCard>

          <WaterCard hover>
            <div className="text-lg font-semibold tracking-tight">Send</div>
            <div className="mt-2 text-sm text-black/70">Recipients • Templates • Preview • Attachments</div>
            <div className="mt-4">
              <LiquidGlassButton onClick={() => (window.location.href = "/send")}>Open Send Page</LiquidGlassButton>
            </div>
          </WaterCard>

          <WaterCard hover>
            <div className="text-lg font-semibold tracking-tight">Reports</div>
            <div className="mt-2 text-sm text-black/70">Sent • Draft • Deleted</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <LiquidGlassButton variant="ghost" onClick={() => (window.location.href = "/reports?tab=sent")}>
                Sent
              </LiquidGlassButton>
              <LiquidGlassButton variant="ghost" onClick={() => (window.location.href = "/reports?tab=draft")}>
                Draft
              </LiquidGlassButton>
              <LiquidGlassButton variant="ghost" onClick={() => (window.location.href = "/reports?tab=deleted")}>
                Deleted
              </LiquidGlassButton>
            </div>
          </WaterCard>
        </div>

        {/* Analytics */}
        <DashboardAnalytics />
      </div>
    </main>
  );
}
