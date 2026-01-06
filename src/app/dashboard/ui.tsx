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
    <main className="min-h-screen bg-white text-black px-6 py-8">
      <div className="mx-auto max-w-6xl">
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
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <WaterCard>
            <div className="text-lg font-semibold">Home</div>
            <div className="mt-2 text-sm text-black/70">Return to dashboard landing.</div>
            <div className="mt-4">
              <LiquidGlassButton onClick={() => (window.location.href = "/dashboard")}>Home Page</LiquidGlassButton>
            </div>
          </WaterCard>

          <WaterCard>
            <div className="text-lg font-semibold">Send</div>
            <div className="mt-2 text-sm text-black/70">Recipients • Templates • Preview • Attachments</div>
            <div className="mt-4">
              <LiquidGlassButton onClick={() => (window.location.href = "/send")}>Open Send Page</LiquidGlassButton>
            </div>
          </WaterCard>

          <WaterCard>
            <div className="text-lg font-semibold">Reports</div>
            <div className="mt-2 text-sm text-black/70">Sent • Draft • Deleted (Restore + Permanent Delete)</div>
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
