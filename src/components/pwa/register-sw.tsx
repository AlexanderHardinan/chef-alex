"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    // Only register in production (Vercel) and only if supported
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // silent fail (do not break app)
      }
    };

    register();
  }, []);

  return null;
}
