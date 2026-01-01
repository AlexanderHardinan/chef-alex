"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import GoldLock from "@/components/gold-lock";
import LiquidGlassButton from "@/components/liquid-glass-button";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    // eye-off
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M10.58 10.58a2 2 0 0 0 2.83 2.83"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9.88 5.1A10.54 10.54 0 0 1 12 4c7 0 10 8 10 8a18.2 18.2 0 0 1-3.05 4.38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.24 6.24A18.2 18.2 0 0 0 2 12s3 8 10 8a10.54 10.54 0 0 0 4.12-.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    // eye
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LandingGate() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const sitePassword = useMemo(() => {
    // Must be NEXT_PUBLIC_ to be available in client code.
    return process.env.NEXT_PUBLIC_SITE_PW ?? "";
  }, []);

  const submit = () => {
    if (!sitePassword) {
      toast.error("Missing NEXT_PUBLIC_SITE_PW in .env.local (restart required).");
      return;
    }
    if (pw !== sitePassword) {
      toast.error("Incorrect password.");
      return;
    }
    toast.success("Unlocked.");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6">
      <section className="w-full max-w-md">
        <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.10)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold leading-tight">Chef Alex</div>
              <div className="text-sm text-black/70">My world, My style</div>
            </div>
            <GoldLock className="h-6 w-6" />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-black/10">
              <Image src="/chefalex.png" alt="Chef Alex" fill className="object-cover" priority />
            </div>
            <div className="text-sm text-black/70">Landing page is password protected.</div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium">Password</label>

            <div className="mt-2 relative">
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type={showPw ? "text" : "password"}
                className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-black/20"
                placeholder="Enter password"
                autoComplete="off"
              />

              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-black/10 bg-white/50 px-2.5 py-2 hover:bg-white/70"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <LiquidGlassButton onClick={submit}>Unlock</LiquidGlassButton>
            <div className="text-xs text-black/50">SEO Name: Chef Alex</div>
          </div>
        </div>
      </section>
    </main>
  );
}
