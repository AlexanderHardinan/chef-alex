"use client";

import { useEffect, useState } from "react";
import BackToDashboard from "@/components/back-to-dashboard";
import { supabaseBrowser } from "@/lib/supabase/browser";
import LiquidGlassButton from "@/components/liquid-glass-button";
import { toast } from "sonner";

type EmailRow = {
  id: string;
  subject: string;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
};

export default function ReportPage() {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState<EmailRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("emails")
      .select("id,subject,status,sent_at,opened_at")
      .order("sent_at", { ascending: false })
      .limit(200);

    if (error) {
      toast.error(error.message);
      return;
    }

    setRows((data as any) ?? []);
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-white text-black px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <BackToDashboard />

        <div className="mt-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Report</h1>
          <LiquidGlassButton variant="ghost" onClick={load}>Refresh</LiquidGlassButton>
        </div>

        <div className="mt-4 rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-4">
          <div className="grid grid-cols-1 gap-2">
            {rows.length === 0 ? (
              <div className="text-black/60">No emails yet.</div>
            ) : (
              rows.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.subject || "(no subject)"}</div>
                    <div className="text-xs text-black/60">
                      Status: {r.status}
                      {r.sent_at ? ` • Sent: ${new Date(r.sent_at).toLocaleString()}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      title={r.opened_at ? `Opened: ${new Date(r.opened_at).toLocaleString()}` : "Not opened yet"}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white"
                    >
                      {r.opened_at ? "👁" : "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
