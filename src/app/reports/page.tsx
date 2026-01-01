"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackToDashboard from "@/components/back-to-dashboard";
import LiquidGlassButton from "@/components/liquid-glass-button";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/browser";

type EmailRow = {
  id: string;
  status: "draft" | "sent" | "deleted" | string;
  subject: string | null;
  rendered_html: string | null;
  created_at: string;
  sent_at: string | null;
  template_id: string | null;
  recipients_id: string | null;
};

type AttachmentRow = {
  id: string;
  email_id: string;
  storage_bucket: string;
  storage_path: string;
  file_name: string | null;
  content_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
};

type EmailLogRow = {
  id: string;
  email_id: string;
  action: string;
  details: any;
  created_at: string;
};

type TabKey = "sent" | "draft" | "deleted";

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return String(iso);
  }
}

function uniqEmails(emails: string[]) {
  return Array.from(new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean)));
}

function normalizeTab(v: string | null): TabKey {
  if (v === "sent" || v === "draft" || v === "deleted") return v;
  return "sent";
}

export default function ReportsPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const sp = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("sent");
  const [q, setQ] = useState("");

  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailRow | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [attachments, setAttachments] = useState<AttachmentRow[]>([]);
  const [attLoading, setAttLoading] = useState(false);

  const [recipientsByEmailId, setRecipientsByEmailId] = useState<Record<string, string[]>>({});

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return emails;

    return emails.filter((e) => {
      const subj = (e.subject ?? "").toLowerCase();
      const id = e.id.toLowerCase();
      const recips = (recipientsByEmailId[e.id] ?? []).join(", ").toLowerCase();
      return subj.includes(query) || id.includes(query) || recips.includes(query);
    });
  }, [emails, q, recipientsByEmailId]);

  useEffect(() => {
    (async () => {
      try {
        const initialTab = normalizeTab(sp.get("tab"));
        setTab(initialTab);

        const { data: u } = await supabase.auth.getUser();
        if (!u.user) {
          window.location.href = "/login";
          return;
        }

        await loadEmails(initialTab);
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load reports.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getUid() {
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) {
      window.location.href = "/login";
      return null;
    }
    return uid;
  }

  async function loadEmails(nextTab: TabKey) {
    setTab(nextTab);
    setSelectedEmail(null);
    setPreviewOpen(false);
    setAttachments([]);
    setRecipientsByEmailId({});

    const uid = await getUid();
    if (!uid) return;

    router.replace(`/reports?tab=${nextTab}`);

    const { data, error } = await supabase
      .from("emails")
      .select("id,status,subject,rendered_html,created_at,sent_at,template_id,recipients_id")
      .eq("owner_uuid", uid)
      .eq("status", nextTab)
      .order(nextTab === "sent" ? "sent_at" : "created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }

    const rows = ((data as any) ?? []) as EmailRow[];
    setEmails(rows);

    if (nextTab === "sent" && rows.length > 0) {
      await loadRecipientsFromLogs(rows.map((r) => r.id));
    }
  }

  async function loadRecipientsFromLogs(emailIds: string[]) {
    const uid = await getUid();
    if (!uid) return;

    const { data, error } = await supabase
      .from("email_logs")
      .select("id,email_id,action,details,created_at")
      .eq("owner_uuid", uid)
      .eq("action", "sent_email")
      .in("email_id", emailIds)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }

    const logs = ((data as any) ?? []) as EmailLogRow[];
    const map: Record<string, string[]> = {};

    for (const log of logs) {
      if (map[log.email_id]) continue;
      const recipsRaw = log.details?.recipients;
      if (Array.isArray(recipsRaw)) map[log.email_id] = uniqEmails(recipsRaw.map((x: any) => String(x)));
      else map[log.email_id] = [];
    }

    setRecipientsByEmailId(map);
  }

  async function openPreview(email: EmailRow) {
    setSelectedEmail(email);
    setPreviewOpen(true);
    await loadAttachments(email.id);
  }

  async function loadAttachments(emailId: string) {
    setAttLoading(true);
    try {
      const uid = await getUid();
      if (!uid) return;

      const { data, error } = await supabase
        .from("attachments")
        .select("id,email_id,storage_bucket,storage_path,file_name,content_type,file_size_bytes,created_at")
        .eq("owner_uuid", uid)
        .eq("email_id", emailId)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(error.message);
        return;
      }

      setAttachments((data as any) ?? []);
    } finally {
      setAttLoading(false);
    }
  }

  async function downloadAttachment(att: AttachmentRow) {
    try {
      const res = await fetch("/api/attachment-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: att.storage_bucket, path: att.storage_path }),
      });

      const json = await res.json();
      if (!res.ok) return toast.error(json?.error ?? "Failed to create download link.");

      window.open(json.url as string, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e?.message ?? "Download failed.");
    }
  }

  async function callEmailDelete(emailId: string, mode: "soft" | "hard" | "restore") {
    const { data: s } = await supabase.auth.getSession();
    const token = s.session?.access_token;
    if (!token) {
      toast.error("Not authenticated.");
      return false;
    }

    const res = await fetch("/api/email-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ emailId, mode }),
    });

    const json = await res.json();
    if (!res.ok) {
      toast.error(json?.error ?? "Action failed.");
      return false;
    }
    return true;
  }

  async function softDelete(emailId: string) {
    const ok = await callEmailDelete(emailId, "soft");
    if (!ok) return;
    toast.success("Moved to Deleted.");
    await loadEmails(tab);
  }

  async function hardDelete(emailId: string) {
    const ok = await callEmailDelete(emailId, "hard");
    if (!ok) return;
    toast.success("Deleted permanently.");
    setPreviewOpen(false);
    setSelectedEmail(null);
    await loadEmails(tab);
  }

  async function restoreEmail(emailId: string) {
    const ok = await callEmailDelete(emailId, "restore");
    if (!ok) return;
    toast.success("Restored to Draft.");
    setPreviewOpen(false);
    setSelectedEmail(null);
    await loadEmails(tab);
  }

  if (loading) return null;

  const selectedRecipients = selectedEmail ? recipientsByEmailId[selectedEmail.id] ?? [] : [];

  return (
    <main className="min-h-screen bg-white text-black px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <BackToDashboard />

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Reports</h1>
            <p className="mt-2 text-black/70">Sent • Draft • Deleted</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <LiquidGlassButton variant="ghost" onClick={() => loadEmails("sent")}>
              Sent
            </LiquidGlassButton>
            <LiquidGlassButton variant="ghost" onClick={() => loadEmails("draft")}>
              Draft
            </LiquidGlassButton>
            <LiquidGlassButton variant="ghost" onClick={() => loadEmails("deleted")}>
              Deleted
            </LiquidGlassButton>
          </div>
        </div>

        <section className="mt-5 rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-lg font-semibold">
              {tab === "sent" ? "Sent Emails" : tab === "draft" ? "Draft Emails" : "Deleted Emails"}
            </div>

            <div className="flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search subject, ID, or recipient…"
                className="w-full md:w-[360px] rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
              />
              <LiquidGlassButton variant="ghost" onClick={() => loadEmails(tab)}>
                Refresh
              </LiquidGlassButton>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {filtered.length === 0 ? (
              <div className="text-sm text-black/60">No items.</div>
            ) : (
              filtered.map((e) => {
                const recips = recipientsByEmailId[e.id] ?? [];
                return (
                  <div
                    key={e.id}
                    className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3 hover:bg-white transition"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <button onClick={() => openPreview(e)} className="text-left min-w-0" type="button">
                        <div className="font-semibold truncate">{e.subject || "(No subject)"}</div>
                        <div className="text-xs text-black/60 truncate">ID: {e.id}</div>

                        {tab === "sent" ? (
                          <div className="mt-1 text-xs text-black/60 truncate">
                            Recipients:{" "}
                            {recips.length === 0
                              ? "—"
                              : `${recips[0]}${recips.length > 1 ? ` +${recips.length - 1}` : ""}`}
                          </div>
                        ) : null}
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="text-xs text-black/60">
                          {tab === "sent" ? `Sent: ${fmtDate(e.sent_at)}` : `Created: ${fmtDate(e.created_at)}`}
                        </div>

                        {tab === "deleted" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => restoreEmail(e.id)}
                              className="text-xs underline text-black/70 hover:text-black"
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => hardDelete(e.id)}
                              className="text-xs underline text-black/70 hover:text-black"
                            >
                              Delete permanently
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => softDelete(e.id)}
                            className="text-xs underline text-black/70 hover:text-black"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Preview Modal */}
        {previewOpen && selectedEmail ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-6xl rounded-3xl border border-black/10 bg-white/85 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold truncate">{selectedEmail.subject || "(No subject)"}</div>
                  <div className="text-xs text-black/60 truncate">Email ID: {selectedEmail.id}</div>
                </div>

                <div className="flex gap-2">
                  {tab === "deleted" ? (
                    <>
                      <LiquidGlassButton variant="ghost" onClick={() => restoreEmail(selectedEmail.id)}>
                        Restore
                      </LiquidGlassButton>
                      <LiquidGlassButton variant="ghost" onClick={() => hardDelete(selectedEmail.id)}>
                        Delete Permanently
                      </LiquidGlassButton>
                    </>
                  ) : (
                    <LiquidGlassButton variant="ghost" onClick={() => softDelete(selectedEmail.id)}>
                      Delete
                    </LiquidGlassButton>
                  )}

                  <LiquidGlassButton variant="ghost" onClick={() => setPreviewOpen(false)}>
                    Close
                  </LiquidGlassButton>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-black/10 bg-white/70 p-4 lg:col-span-1">
                  <div className="text-sm font-semibold">Details</div>

                  <div className="mt-2 text-sm text-black/70 space-y-1">
                    <div>
                      <span className="text-black/50">Status:</span> {selectedEmail.status}
                    </div>
                    <div>
                      <span className="text-black/50">Created:</span> {fmtDate(selectedEmail.created_at)}
                    </div>
                    <div>
                      <span className="text-black/50">Sent:</span> {fmtDate(selectedEmail.sent_at)}
                    </div>
                  </div>

                  <div className="mt-5 text-sm font-semibold">Recipients</div>
                  {tab !== "sent" ? (
                    <div className="mt-2 text-sm text-black/60">Recipients are available for Sent emails.</div>
                  ) : selectedRecipients.length === 0 ? (
                    <div className="mt-2 text-sm text-black/60">No recipients recorded in logs.</div>
                  ) : (
                    <div className="mt-2 rounded-2xl border border-black/10 bg-white p-3 max-h-[22vh] overflow-auto">
                      <div className="text-xs text-black/60 mb-2">
                        Total: <span className="font-medium text-black">{selectedRecipients.length}</span>
                      </div>
                      <ul className="text-sm text-black/80 space-y-1">
                        {selectedRecipients.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-5 text-sm font-semibold">Attachments</div>
                  {attLoading ? (
                    <div className="mt-2 text-sm text-black/60">Loading…</div>
                  ) : attachments.length === 0 ? (
                    <div className="mt-2 text-sm text-black/60">No attachments.</div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {attachments.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              {a.file_name || a.storage_path.split("/").pop()}
                            </div>
                            <div className="text-xs text-black/50 truncate">{a.storage_bucket}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => downloadAttachment(a)}
                            className="text-xs underline text-black/70 hover:text-black"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-black/10 bg-white lg:col-span-2">
                  <iframe
                    title="Email preview"
                    className="h-[75vh] w-full rounded-2xl"
                    sandbox=""
                    srcDoc={
                      selectedEmail.rendered_html ||
                      "<div style='padding:24px;font-family:system-ui'>No rendered HTML found.</div>"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
