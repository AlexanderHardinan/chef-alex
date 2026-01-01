"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import LiquidGlassButton from "@/components/liquid-glass-button";
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
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-black/10">
              <Image src="/chefalex.png" alt="Chef Alex" fill className="object-cover" priority />
            </div>
            <div>
              <div className="text-2xl font-semibold">Chef Alex</div>
              <div className="text-sm text-black/70">My world, My style</div>
            </div>
          </div>

          <LiquidGlassButton variant="ghost" onClick={signOut}>
            Sign Out
          </LiquidGlassButton>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
            <div className="text-lg font-semibold">Home</div>
            <div className="mt-3">
              <LiquidGlassButton onClick={() => (window.location.href = "/dashboard")}>
                Home Page
              </LiquidGlassButton>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
            <div className="text-lg font-semibold">Send Email</div>
            <div className="mt-3 flex gap-3">
              <LiquidGlassButton onClick={() => (window.location.href = "/send")}>
                Send Email Page
              </LiquidGlassButton>
              <LiquidGlassButton variant="ghost" onClick={() => toast.info("Phase 3 build")}>
                Status
              </LiquidGlassButton>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6 md:col-span-2">
            <div className="text-lg font-semibold">Reports</div>
            <div className="mt-3 flex flex-wrap gap-3">
              <LiquidGlassButton onClick={() => (window.location.href = "/reports?tab=sent")}>
                Sent Email
              </LiquidGlassButton>
              <LiquidGlassButton onClick={() => (window.location.href = "/reports?tab=draft")}>
                Draft Email
              </LiquidGlassButton>
              <LiquidGlassButton onClick={() => (window.location.href = "/reports?tab=deleted")}>
                Deleted Email
              </LiquidGlassButton>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
