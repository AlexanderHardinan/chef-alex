"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import LiquidGlassButton from "@/components/liquid-glass-button";
import WaterCard from "@/components/water-card";
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
    <main className="min-h-screen bg-white text-black px-6 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-black/10">
              <Image src="/chefalex.png" alt="Chef Alex" fill className="object-cover" priority />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-semibold leading-tight">Chef Alex</div>
              <div className="text-sm text-black/70">My world, My style</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LiquidGlassButton
              variant="ghost"
              onClick={() => toast.info("All systems ready.")}
              className="whitespace-nowrap"
            >
              System Status
            </LiquidGlassButton>

            <LiquidGlassButton variant="ghost" onClick={signOut} className="whitespace-nowrap">
              Sign Out
            </LiquidGlassButton>
          </div>
        </header>

        {/* Hero / Quick Actions */}
        <WaterCard className="mt-8 water-card" radius="xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="text-lg font-semibold">Dashboard</div>
              <div className="mt-1 text-sm text-black/70">
                Fast access to sending, reports, and account actions.
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <LiquidGlassButton onClick={() => (window.location.href = "/send")}>
                Send Email
              </LiquidGlassButton>
              <LiquidGlassButton variant="ghost" onClick={() => (window.location.href = "/reports?tab=sent")}>
                View Reports
              </LiquidGlassButton>
            </div>
          </div>
        </WaterCard>

        {/* Modules */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Home */}
          <WaterCard>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg font-semibold">Home</div>
                <div className="mt-1 text-sm text-black/70">
                  Return to the dashboard landing.
                </div>
              </div>
              <div
                className="h-9 w-9 rounded-full border border-black/10"
                style={{
                  background: "linear-gradient(135deg, rgba(201,162,74,0.35), rgba(245,217,138,0.18))",
                }}
              />
            </div>

            <div className="mt-4">
              <LiquidGlassButton onClick={() => (window.location.href = "/dashboard")}>
                Home Page
              </LiquidGlassButton>
            </div>
          </WaterCard>

          {/* Send */}
          <WaterCard>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg font-semibold">Send Email</div>
                <div className="mt-1 text-sm text-black/70">
                  Recipients, templates, banner, preview, attachments.
                </div>
              </div>
              <div
                className="h-9 w-9 rounded-full border border-black/10"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(0,0,0,0.06))",
                }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <LiquidGlassButton onClick={() => (window.location.href = "/send")}>
                Open Send Page
              </LiquidGlassButton>
              <LiquidGlassButton variant="ghost" onClick={() => toast.info("Send module is active.")}>
                Status
              </LiquidGlassButton>
            </div>
          </WaterCard>

          {/* Reports */}
          <WaterCard className="md:col-span-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="text-lg font-semibold">Reports</div>
                <div className="mt-1 text-sm text-black/70">
                  Sent • Draft • Deleted (Delete, Restore, Permanent Delete)
                </div>
              </div>

              <div className="text-xs text-black/60">
                Tip: Use tabs for faster navigation.
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <LiquidGlassButton onClick={() => (window.location.href = "/reports?tab=sent")}>
                Sent
              </LiquidGlassButton>
              <LiquidGlassButton onClick={() => (window.location.href = "/reports?tab=draft")}>
                Draft
              </LiquidGlassButton>
              <LiquidGlassButton onClick={() => (window.location.href = "/reports?tab=deleted")}>
                Deleted
              </LiquidGlassButton>
            </div>
          </WaterCard>
        </section>
      </div>
    </main>
  );
}
