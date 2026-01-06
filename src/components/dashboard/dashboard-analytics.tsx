"use client";

import { useEffect, useMemo, useState } from "react";
import WaterCard from "@/components/water-card";
import LiquidGlassButton from "@/components/liquid-glass-button";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

type Kpi = { label: string; value: number; hint: string };
type SentPoint = { day: string; sent: number };
type BarPoint = { name: string; value: number };

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function dayKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function buildLastNDays(n: number) {
  const arr: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    arr.push(dayKey(d.toISOString()));
  }
  return arr;
}

export default function DashboardAnalytics() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [sentSeries, setSentSeries] = useState<SentPoint[]>([]);
  const [statusBars, setStatusBars] = useState<BarPoint[]>([]);
  const [recentSent, setRecentSent] = useState<Array<{ id: string; subject: string | null; sent_at: string | null }>>(
    []
  );

  async function refresh() {
    try {
      setLoading(true);

      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        window.location.href = "/login";
        return;
      }

      // KPI counts (ALL TIME) - fast count queries
      const [sentCount, draftCount, deletedCount] = await Promise.all([
        supabase.from("emails").select("id", { count: "exact", head: true }).eq("owner_uuid", uid).eq("status", "sent"),
        supabase.from("emails").select("id", { count: "exact", head: true }).eq("owner_uuid", uid).eq("status", "draft"),
        supabase
          .from("emails")
          .select("id", { count: "exact", head: true })
          .eq("owner_uuid", uid)
          .eq("status", "deleted"),
      ]);

      if (sentCount.error) throw new Error(sentCount.error.message);
      if (draftCount.error) throw new Error(draftCount.error.message);
      if (deletedCount.error) throw new Error(deletedCount.error.message);

      const sent = sentCount.count ?? 0;
      const draft = draftCount.count ?? 0;
      const deleted = deletedCount.count ?? 0;

      setKpis([
        { label: "Sent", value: sent, hint: "All time sent emails" },
        { label: "Draft", value: draft, hint: "Saved drafts (not sent)" },
        { label: "Deleted", value: deleted, hint: "Soft-deleted emails" },
      ]);

      setStatusBars([
        { name: "Sent", value: sent },
        { name: "Draft", value: draft },
        { name: "Deleted", value: deleted },
      ]);

      // Line chart: sent per day (last 14 days)
      const since14 = isoDaysAgo(14);
      const sentRows = await supabase
        .from("emails")
        .select("sent_at")
        .eq("owner_uuid", uid)
        .eq("status", "sent")
        .gte("sent_at", since14);

      if (sentRows.error) throw new Error(sentRows.error.message);

      const map: Record<string, number> = {};
      const days = buildLastNDays(14);
      for (const d of days) map[d] = 0;

      for (const r of (sentRows.data ?? []) as Array<{ sent_at: string | null }>) {
        if (!r.sent_at) continue;
        const k = dayKey(r.sent_at);
        if (map[k] === undefined) map[k] = 0;
        map[k] += 1;
      }

      setSentSeries(days.map((d) => ({ day: d.slice(5), sent: map[d] ?? 0 })));

      // Recent activity (last 6 sent)
      const recent = await supabase
        .from("emails")
        .select("id,subject,sent_at")
        .eq("owner_uuid", uid)
        .eq("status", "sent")
        .order("sent_at", { ascending: false })
        .limit(6);

      if (recent.error) throw new Error(recent.error.message);
      setRecentSent((recent.data ?? []) as any);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // "live" refresh every 30 seconds
    const t = window.setInterval(() => refresh(), 30000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalSent14 = useMemo(() => sentSeries.reduce((a, b) => a + (b.sent || 0), 0), [sentSeries]);

  return (
    <div className="mt-6 space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((k) => (
          <WaterCard key={k.label} radius={undefined as any}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">{k.label}</div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight">{loading ? "—" : k.value}</div>
                <div className="mt-1 text-xs text-black/60">{k.hint}</div>
              </div>
              <div
                className="h-10 w-10 rounded-full border border-black/10"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(0,0,0,0.06))",
                }}
              />
            </div>
          </WaterCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WaterCard className="lg:col-span-2" padded={true}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">Sent Performance</div>
              <div className="mt-1 text-sm text-black/70">
                Last 14 days • Total sent: <span className="font-semibold text-black">{loading ? "—" : totalSent14}</span>
              </div>
            </div>

            <LiquidGlassButton variant="ghost" onClick={refresh}>
              Refresh now
            </LiquidGlassButton>
          </div>

          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="sent" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </WaterCard>

        <WaterCard padded={true}>
          <div>
            <div className="text-lg font-semibold">Status Breakdown</div>
            <div className="mt-1 text-sm text-black/70">All-time status totals</div>
          </div>

          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </WaterCard>
      </div>

      {/* Recent Activity */}
      <WaterCard padded={true}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Recent Sent</div>
            <div className="mt-1 text-sm text-black/70">Latest sent emails</div>
          </div>

          <LiquidGlassButton variant="ghost" onClick={() => (window.location.href = "/reports?tab=sent")}>
            Open Reports
          </LiquidGlassButton>
        </div>

        <div className="mt-4 space-y-2">
          {loading ? (
            <div className="text-sm text-black/60">Loading…</div>
          ) : recentSent.length === 0 ? (
            <div className="text-sm text-black/60">No sent emails yet.</div>
          ) : (
            recentSent.map((r) => (
              <div key={r.id} className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3 hover:bg-white transition">
                <div className="font-semibold truncate">{r.subject || "(No subject)"}</div>
                <div className="mt-1 text-xs text-black/60 truncate">ID: {r.id}</div>
                <div className="mt-1 text-xs text-black/60">
                  Sent: {r.sent_at ? new Date(r.sent_at).toLocaleString() : "-"}
                </div>
              </div>
            ))
          )}
        </div>
      </WaterCard>
    </div>
  );
}
