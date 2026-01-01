"use client";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase/browser";
import LiquidGlassButton from "@/components/liquid-glass-button";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    // eye-off
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
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

export default function LoginClient() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const signIn = async () => {
    if (!email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in.");
    window.location.href = "/dashboard";
  };

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6">
      <section className="w-full max-w-md">
        <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.10)]">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-black/10">
              <Image src="/chefalex.png" alt="Chef Alex" fill className="object-cover" priority />
            </div>
            <div>
              <div className="text-xl font-semibold">Chef Alex</div>
              <div className="text-sm text-black/70">Sign in required</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                placeholder="you@domain.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>

              <div className="mt-2 relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-black/20"
                  placeholder="••••••••"
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
          </div>

          <div className="mt-5">
            <LiquidGlassButton onClick={signIn} className="w-full">
              Sign In
            </LiquidGlassButton>
          </div>
        </div>
      </section>
    </main>
  );
}
