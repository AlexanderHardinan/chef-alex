"use client";

import { useEffect, useMemo, useState } from "react";
import BackToDashboard from "@/components/back-to-dashboard";
import LiquidGlassButton from "@/components/liquid-glass-button";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { requireUserId } from "@/lib/db";

type Template = {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  banner_url: string;
  cta_text: string;
  cta_url: string;
  signature_enabled: boolean;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  body_json: any;
};

type RecipientList = {
  id: string;
  label: string;
  emails: string[];
};

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidHttpUrl(v: string) {
  if (!v.trim()) return true;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uniqEmails(emails: string[]) {
  const set = new Set<string>();
  for (const e of emails) {
    const v = e.trim().toLowerCase();
    if (!v) continue;
    set.add(v);
  }
  return Array.from(set);
}

/**
 * EMAIL-SAFE ICONS (PNG)
 * Gmail/Outlook often strip inline SVG; PNG renders reliably.
 */
function iconImg(type: "phone" | "email" | "website" | "facebook" | "instagram" | "linkedin") {
  const map: Record<string, string> = {
    phone: "https://jlgeioiehtgnzspkrali.supabase.co/storage/v1/object/public/email-assets/phone.png",
    email: "https://jlgeioiehtgnzspkrali.supabase.co/storage/v1/object/public/email-assets/email.png",
    website: "https://jlgeioiehtgnzspkrali.supabase.co/storage/v1/object/public/email-assets/website.png",
    facebook: "https://jlgeioiehtgnzspkrali.supabase.co/storage/v1/object/public/email-assets/facebook.png",
    instagram: "https://jlgeioiehtgnzspkrali.supabase.co/storage/v1/object/public/email-assets/instagram.png",
    linkedin: "https://jlgeioiehtgnzspkrali.supabase.co/storage/v1/object/public/email-assets/linkedin.png",
  };

  const src = map[type];

  return `<img src="${src}" width="18" height="18" alt="${type}" style="width:18px;height:18px;display:block;border:0;outline:none;text-decoration:none" />`;
}

function buildSignature(input: { signatureEnabled: boolean; facebookUrl: string; instagramUrl: string; linkedinUrl: string }) {
  if (!input.signatureEnabled) return "";

  const fb = input.facebookUrl?.trim();
  const ig = input.instagramUrl?.trim();
  const li = input.linkedinUrl?.trim();

  const socials = [
    fb ? { type: "facebook" as const, url: fb } : null,
    ig ? { type: "instagram" as const, url: ig } : null,
    li ? { type: "linkedin" as const, url: li } : null,
  ].filter(Boolean) as Array<{ type: "facebook" | "instagram" | "linkedin"; url: string }>;

  const socialHtml =
    socials.length > 0
      ? `
      <div style="margin-top:14px">
        <div style="font-size:12px;color:rgba(0,0,0,.55);margin-bottom:8px">Connect</div>
        <div style="display:flex;gap:10px;align-items:center">
          ${socials
            .map(
              (s) => `
              <a href="${s.url}"
                 style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:14px;
                        border:1px solid rgba(0,0,0,.10);background:rgba(255,255,255,.95);text-decoration:none">
                ${iconImg(s.type)}
              </a>`
            )
            .join("")}
        </div>
      </div>
    `
      : "";

  // Email-safe layout (no CSS grid). Uses a simple 2-column table.
  return `
    <div style="margin-top:22px;padding-top:18px;border-top:1px solid rgba(0,0,0,.10)">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse">
        <tr>
          <td valign="top" style="width:52%;padding-right:14px">
            <div style="font-weight:800;font-size:14px;letter-spacing:.2px">Chef Alexander Hardinan</div>
            <div style="color:rgba(0,0,0,.70);font-size:13px;margin-top:6px;line-height:1.65">
              Executive Chef • General Manager<br/>
              Data Analyst • Web Designer<br/>
              President of Gastronomist International
            </div>
            ${socialHtml}
          </td>

          <td valign="top" style="width:48%;padding-left:14px;border-left:1px solid rgba(0,0,0,.10)">
            <div style="font-weight:800;font-size:13px;letter-spacing:.2px">Contact</div>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:10px;border-collapse:collapse">
              <tr>
                <td style="width:44px;padding:0 10px 10px 0" valign="top">
                  <span style="display:inline-flex;width:36px;height:36px;border-radius:14px;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,.10);background:rgba(255,255,255,.95)">
                    ${iconImg("phone")}
                  </span>
                </td>
                <td style="padding:0 0 10px 0" valign="top">
                  <div style="font-size:13px;color:rgba(0,0,0,.72)">+66 64 124 0737</div>
                  <div style="font-size:12px;color:rgba(0,0,0,.55);margin-top:2px">Thailand 20150</div>
                </td>
              </tr>

              <tr>
                <td style="width:44px;padding:0 10px 10px 0" valign="top">
                  <span style="display:inline-flex;width:36px;height:36px;border-radius:14px;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,.10);background:rgba(255,255,255,.95)">
                    ${iconImg("email")}
                  </span>
                </td>
                <td style="padding:0 0 10px 0" valign="top">
                  <div style="font-size:13px">
                    <a href="mailto:alexhardinan@gmail.com" style="color:#000;text-decoration:underline">alexhardinan@gmail.com</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="width:44px;padding:0 10px 0 0" valign="top">
                  <span style="display:inline-flex;width:36px;height:36px;border-radius:14px;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,.10);background:rgba(255,255,255,.95)">
                    ${iconImg("website")}
                  </span>
                </td>
                <td style="padding:0" valign="top">
                  <div style="font-size:13px">
                    <a href="https://alexhardinan.com" style="color:#000;text-decoration:underline">alexhardinan.com</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function buildHtml(input: {
  subject: string;
  preheader: string;
  bannerUrl: string;
  bodyText: string;
  ctaText: string;
  ctaUrl: string;
  signatureEnabled: boolean;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
}) {
  const subject = escapeHtml(input.subject || "Chef Alex");
  const preheader = escapeHtml(input.preheader || "");
  const bodyText = escapeHtml(input.bodyText || "");
  const ctaText = escapeHtml(input.ctaText || "");
  const ctaUrl = input.ctaUrl || "";
  const bannerUrl = input.bannerUrl || "";

  const banner = bannerUrl
    ? `
      <div style="margin:0 0 16px 0">
        <img
          src="${bannerUrl}"
          alt="Banner"
          style="width:100%;max-width:640px;border-radius:16px;display:block;border:1px solid rgba(0,0,0,.06)"
        />
      </div>
    `
    : "";

  const safeCta =
    ctaText && ctaUrl
      ? `<p style="margin:18px 0 0 0">
           <a href="${ctaUrl}" style="display:inline-block;padding:12px 16px;border-radius:14px;background:#000;color:#fff;text-decoration:none">
             ${ctaText}
           </a>
         </p>`
      : "";

  const signature = buildSignature({
    signatureEnabled: input.signatureEnabled,
    facebookUrl: input.facebookUrl,
    instagramUrl: input.instagramUrl,
    linkedinUrl: input.linkedinUrl,
  });

  return `
  <div style="font-family:system-ui;line-height:1.55;color:#000;background:#fff;padding:24px">
    <div style="max-width:640px;margin:0 auto;border:1px solid rgba(0,0,0,.08);border-radius:18px;padding:22px">
      ${banner}
      <div style="font-size:22px;font-weight:700;margin-bottom:6px">${subject}</div>
      ${preheader ? `<div style="color:rgba(0,0,0,.6);margin-bottom:14px">${preheader}</div>` : ""}
      <div style="white-space:pre-wrap">${bodyText}</div>
      ${safeCta}
      ${signature}
      <div style="margin-top:18px;color:rgba(0,0,0,.55);font-size:12px">
        Chef Alex — My world, My style
      </div>
    </div>
  </div>`;
}

export default function SendPage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // recipients
  const [recipientLists, setRecipientLists] = useState<RecipientList[]>([]);
  const [recLabel, setRecLabel] = useState("Recipient");
  const [recInput, setRecInput] = useState("");
  const [selectedRecipientsIds, setSelectedRecipientsIds] = useState<string[]>([]);

  // collapse + search + pagination
  const [recListsCollapsed, setRecListsCollapsed] = useState(false);
  const [recSearch, setRecSearch] = useState("");
  const REC_PAGE_SIZE = 5;
  const [recPage, setRecPage] = useState(1);

  // templates (editor)
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tplName, setTplName] = useState("My Template");
  const [tplSubject, setTplSubject] = useState("");
  const [tplPreheader, setTplPreheader] = useState("");
  const [tplBannerUrl, setTplBannerUrl] = useState("");
  const [tplBody, setTplBody] = useState("");
  const [tplCtaText, setTplCtaText] = useState("");
  const [tplCtaUrl, setTplCtaUrl] = useState("");

  const [sigEnabled, setSigEnabled] = useState(true);
  const [fbUrl, setFbUrl] = useState("");
  const [igUrl, setIgUrl] = useState("");
  const [liUrl, setLiUrl] = useState("");

  // selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // attachments
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([]);

  // preview
  const [previewOpen, setPreviewOpen] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const filteredRecipientLists = useMemo(() => {
    const q = recSearch.trim().toLowerCase();
    if (!q) return recipientLists;

    return recipientLists.filter((r) => {
      const label = (r.label ?? "").toLowerCase();
      const emails = (r.emails ?? []).join(", ").toLowerCase();
      return label.includes(q) || emails.includes(q);
    });
  }, [recipientLists, recSearch]);

  // Reset to page 1 when search or list changes
  useEffect(() => {
    setRecPage(1);
  }, [recSearch, recipientLists.length]);

  const recTotalPages = useMemo(() => {
    const n = Math.ceil(filteredRecipientLists.length / REC_PAGE_SIZE);
    return Math.max(1, n);
  }, [filteredRecipientLists.length]);

  const recPageSafe = useMemo(() => {
    return Math.min(Math.max(1, recPage), recTotalPages);
  }, [recPage, recTotalPages]);

  const pagedRecipientLists = useMemo(() => {
    const start = (recPageSafe - 1) * REC_PAGE_SIZE;
    const end = start + REC_PAGE_SIZE;
    return filteredRecipientLists.slice(start, end);
  }, [filteredRecipientLists, recPageSafe]);

  const selectedRecipientLists = useMemo(() => {
    const set = new Set(selectedRecipientsIds);
    return recipientLists.filter((r) => set.has(r.id));
  }, [recipientLists, selectedRecipientsIds]);

  const mergedRecipientEmails = useMemo(() => {
    const all = selectedRecipientLists.flatMap((r) => r.emails || []);
    return uniqEmails(all);
  }, [selectedRecipientLists]);

  const previewHtml = useMemo(() => {
    const base = selectedTemplate ?? {
      subject: tplSubject,
      preheader: tplPreheader,
      banner_url: tplBannerUrl,
      cta_text: tplCtaText,
      cta_url: tplCtaUrl,
      signature_enabled: sigEnabled,
      facebook_url: fbUrl,
      instagram_url: igUrl,
      linkedin_url: liUrl,
      body_json: [{ type: "text", value: tplBody }],
    };

    const blocks = Array.isArray((base as any).body_json) ? (base as any).body_json : [];
    const textBody = blocks.find((b: any) => b?.type === "text")?.value ?? tplBody;

    return buildHtml({
      subject: (base as any).subject || "Chef Alex",
      preheader: (base as any).preheader || "",
      bannerUrl: (base as any).banner_url || "",
      bodyText: textBody || "",
      ctaText: (base as any).cta_text || "",
      ctaUrl: (base as any).cta_url || "",
      signatureEnabled: (base as any).signature_enabled ?? true,
      facebookUrl: (base as any).facebook_url || "",
      instagramUrl: (base as any).instagram_url || "",
      linkedinUrl: (base as any).linkedin_url || "",
    });
  }, [
    selectedTemplate,
    tplSubject,
    tplPreheader,
    tplBannerUrl,
    tplBody,
    tplCtaText,
    tplCtaUrl,
    sigEnabled,
    fbUrl,
    igUrl,
    liUrl,
  ]);

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          window.location.href = "/login";
          return;
        }
        await refreshAll();
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshAll() {
    await Promise.all([loadRecipients(), loadTemplates()]);
  }

  async function loadRecipients() {
    const { data, error } = await supabase
      .from("email_recipients")
      .select("id,label,emails")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    setRecipientLists((data as any) ?? []);
  }

  async function loadTemplates() {
    const { data, error } = await supabase
      .from("email_templates")
      .select("id,name,subject,preheader,banner_url,cta_text,cta_url,signature_enabled,facebook_url,instagram_url,linkedin_url,body_json")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    setTemplates((data as any) ?? []);
  }

  async function createRecipientList() {
    const uid = await requireUserId();

    const parsed = recInput
      .split(/[\n,]+/g)
      .map((s) => s.trim())
      .filter(Boolean);

    if (parsed.length === 0) return toast.error("Add at least one email.");
    const bad = parsed.find((e) => !isValidEmail(e));
    if (bad) return toast.error(`Invalid email: ${bad}`);

    const { error } = await supabase.from("email_recipients").insert({
      owner_uuid: uid,
      label: recLabel.trim() || "Recipient",
      emails: parsed,
    });

    if (error) return toast.error(error.message);

    toast.success("Recipient list created.");
    setRecInput("");
    await loadRecipients();
  }

  async function deleteRecipientList(id: string) {
    const { error } = await supabase.from("email_recipients").delete().eq("id", id);
    if (error) return toast.error(error.message);

    toast.success("Recipient list deleted.");
    setSelectedRecipientsIds((prev) => prev.filter((x) => x !== id));
    await loadRecipients();
  }

  function toggleRecipientList(id: string) {
    setSelectedRecipientsIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAllRecipients() {
    setSelectedRecipientsIds(recipientLists.map((r) => r.id));
  }

  function clearRecipientsSelection() {
    setSelectedRecipientsIds([]);
  }

  async function createTemplate() {
    const uid = await requireUserId();
    if (!tplName.trim()) return toast.error("Template name required.");

    const urlsToCheck = [
      { label: "Banner URL", value: tplBannerUrl },
      { label: "CTA URL", value: tplCtaUrl },
      { label: "Facebook URL", value: fbUrl },
      { label: "Instagram URL", value: igUrl },
      { label: "LinkedIn URL", value: liUrl },
    ];

    for (const u of urlsToCheck) {
      if (!isValidHttpUrl(u.value)) return toast.error(`${u.label} must be http(s) or empty.`);
    }

    const { error } = await supabase.from("email_templates").insert({
      owner_uuid: uid,
      name: tplName.trim(),
      subject: tplSubject.trim(),
      preheader: tplPreheader.trim(),
      banner_url: tplBannerUrl.trim(),
      body_json: [{ type: "text", value: tplBody }],
      cta_text: tplCtaText.trim(),
      cta_url: tplCtaUrl.trim(),
      signature_enabled: sigEnabled,
      facebook_url: fbUrl.trim(),
      instagram_url: igUrl.trim(),
      linkedin_url: liUrl.trim(),
    });

    if (error) return toast.error(error.message);

    toast.success("Template created.");
    await loadTemplates();
  }

  async function loadTemplateIntoEditor(t: Template) {
    setTplName(t.name);
    setTplSubject(t.subject);
    setTplPreheader(t.preheader);
    setTplBannerUrl(t.banner_url || "");
    setTplCtaText(t.cta_text);
    setTplCtaUrl(t.cta_url);

    setSigEnabled(t.signature_enabled ?? true);
    setFbUrl(t.facebook_url || "");
    setIgUrl(t.instagram_url || "");
    setLiUrl(t.linkedin_url || "");

    const blocks = Array.isArray(t.body_json) ? t.body_json : [];
    const firstText = blocks.find((b: any) => b?.type === "text")?.value ?? "";
    setTplBody(firstText);

    setSelectedTemplateId(t.id);
    toast.info("Template loaded into editor.");
  }

  async function updateSelectedTemplate() {
    if (!selectedTemplateId) return toast.error("Select a template first.");

    const urlsToCheck = [
      { label: "Banner URL", value: tplBannerUrl },
      { label: "CTA URL", value: tplCtaUrl },
      { label: "Facebook URL", value: fbUrl },
      { label: "Instagram URL", value: igUrl },
      { label: "LinkedIn URL", value: liUrl },
    ];

    for (const u of urlsToCheck) {
      if (!isValidHttpUrl(u.value)) return toast.error(`${u.label} must be http(s) or empty.`);
    }

    const blocks = [{ type: "text", value: tplBody }];

    const { error } = await supabase
      .from("email_templates")
      .update({
        name: tplName.trim(),
        subject: tplSubject.trim(),
        preheader: tplPreheader.trim(),
        banner_url: tplBannerUrl.trim(),
        cta_text: tplCtaText.trim(),
        cta_url: tplCtaUrl.trim(),
        body_json: blocks,
        signature_enabled: sigEnabled,
        facebook_url: fbUrl.trim(),
        instagram_url: igUrl.trim(),
        linkedin_url: liUrl.trim(),
      })
      .eq("id", selectedTemplateId);

    if (error) return toast.error(error.message);

    toast.success("Template updated.");
    await loadTemplates();
  }

  async function deleteTemplate(id: string) {
    const { error } = await supabase.from("email_templates").delete().eq("id", id);
    if (error) return toast.error(error.message);

    toast.success("Template deleted.");
    if (selectedTemplateId === id) setSelectedTemplateId("");
    await loadTemplates();
  }

  async function uploadAttachments() {
    const uid = await requireUserId();
    if (!files || files.length === 0) return toast.error("Choose files first.");

    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const safeName = file.name.replace(/[^\w.\-() ]+/g, "_");
      const path = `${uid}/${crypto.randomUUID()}-${safeName}`;

      const { error } = await supabase.storage.from("chef-alex-attachments").upload(path, file, { upsert: false });
      if (error) return toast.error(error.message);

      uploaded.push(path);
    }

    setUploadedPaths(uploaded);
    toast.success(`Uploaded ${uploaded.length} file(s).`);
  }

  async function removeUploadedAttachment(path: string) {
    const uid = await requireUserId();

    if (!path.startsWith(`${uid}/`)) {
      toast.error("Blocked: invalid attachment path.");
      return;
    }

    const { error } = await supabase.storage.from("chef-alex-attachments").remove([path]);
    if (error) return toast.error(error.message);

    setUploadedPaths((prev) => prev.filter((p) => p !== path));
    toast.success("Attachment removed.");
  }

  async function clearAllUploadedAttachments() {
    const uid = await requireUserId();

    const owned = uploadedPaths.filter((p) => p.startsWith(`${uid}/`));
    if (owned.length === 0) {
      setUploadedPaths([]);
      return;
    }

    const { error } = await supabase.storage.from("chef-alex-attachments").remove(owned);
    if (error) return toast.error(error.message);

    setUploadedPaths([]);
    toast.success("All attachments removed.");
  }

  // returns true on success
  async function sendEmail(): Promise<boolean> {
    if (sending) return false;

    try {
      setSending(true);

      const uid = await requireUserId();

      const tpl = selectedTemplate;
      if (!tpl) {
        toast.error("Select a template.");
        return false;
      }

      if (selectedRecipientLists.length === 0) {
        toast.error("Select at least one recipient list.");
        return false;
      }

      if (mergedRecipientEmails.length === 0) {
        toast.error("No recipient emails found in selected lists.");
        return false;
      }

      const bodyBlocks = Array.isArray(tpl.body_json) ? tpl.body_json : [];
      const textBody = bodyBlocks.find((b: any) => b?.type === "text")?.value ?? "";

      const html = buildHtml({
        subject: tpl.subject || "Chef Alex",
        preheader: tpl.preheader || "",
        bannerUrl: tpl.banner_url || "",
        bodyText: textBody || "",
        ctaText: tpl.cta_text || "",
        ctaUrl: tpl.cta_url || "",
        signatureEnabled: tpl.signature_enabled ?? true,
        facebookUrl: tpl.facebook_url || "",
        instagramUrl: tpl.instagram_url || "",
        linkedinUrl: tpl.linkedin_url || "",
      });

      const primaryRecipientsId = selectedRecipientLists[0]?.id ?? null;

      const { data: emailRow, error: insErr } = await supabase
        .from("emails")
        .insert({
          owner_uuid: uid,
          status: "draft",
          template_id: tpl.id,
          recipients_id: primaryRecipientsId,
          subject: tpl.subject || "",
          rendered_html: html,
          cta_text: tpl.cta_text || "",
          cta_url: tpl.cta_url || "",
        })
        .select("id")
        .single();

      if (insErr) {
        toast.error(insErr.message);
        return false;
      }

      if (uploadedPaths.length > 0) {
        const rows = uploadedPaths.map((p) => ({
          owner_uuid: uid,
          email_id: emailRow.id,
          storage_bucket: "chef-alex-attachments",
          storage_path: p,
          file_name: p.split("/").pop() ?? "file",
          content_type: "application/octet-stream",
          file_size_bytes: 0,
        }));

        const { error: attErr } = await supabase.from("attachments").insert(rows);
        if (attErr) {
          toast.error(attErr.message);
          return false;
        }
      }

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailId: emailRow.id,
          to: mergedRecipientEmails,
          subject: tpl.subject,
          html,
          templateId: tpl.id,
          recipientsId: primaryRecipientsId,
          ctaText: tpl.cta_text,
          ctaUrl: tpl.cta_url,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        await supabase.from("email_logs").insert({
          owner_uuid: uid,
          email_id: emailRow.id,
          action: "send_failed",
          details: json,
        });

        toast.error(json?.error?.message ?? "Send failed.");
        return false;
      }

      await supabase
        .from("emails")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", emailRow.id);

      await supabase.from("email_logs").insert({
        owner_uuid: uid,
        email_id: emailRow.id,
        action: "sent_email",
        details: { ...json, recipients: mergedRecipientEmails, recipient_list_ids: selectedRecipientsIds },
      });

      toast.success(`Email sent to ${mergedRecipientEmails.length} recipient(s). Redirecting…`);
      return true;
    } catch (e: any) {
      toast.error(e?.message ?? "Send failed.");
      return false;
    } finally {
      setSending(false);
    }
  }

  async function sendThenGoDashboard() {
    const ok = await sendEmail();
    if (!ok) return;

    setPreviewOpen(false);

    // Small delay so user sees toast
    window.setTimeout(() => {
      window.location.href = "/dashboard";
    }, 700);
  }

  if (loading) return null;

  return (
    <main className="min-h-screen bg-white text-black px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <BackToDashboard />

        <h1 className="mt-6 text-2xl font-semibold">Send Email</h1>
        <p className="mt-2 text-black/70">Multi-recipient + banner + signature + full preview</p>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Recipients */}
          <section className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold">Recipients</div>

              <button
                type="button"
                onClick={() => setRecListsCollapsed((v) => !v)}
                className="text-sm underline text-black/70 hover:text-black"
              >
                {recListsCollapsed ? "Expand lists" : "Collapse lists"}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Label</label>
                <input
                  value={recLabel}
                  onChange={(e) => setRecLabel(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Emails (comma or new line)</label>
                <textarea
                  value={recInput}
                  onChange={(e) => setRecInput(e.target.value)}
                  className="mt-2 h-28 w-full resize-none rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                  placeholder="a@domain.com, b@domain.com"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <LiquidGlassButton onClick={createRecipientList}>Create List</LiquidGlassButton>
                <LiquidGlassButton variant="ghost" onClick={loadRecipients}>
                  Refresh
                </LiquidGlassButton>
              </div>
            </div>

            <div className="mt-5 border-t border-black/10 pt-4">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium">Select Multiple Lists</label>
                <div className="flex gap-2">
                  <button
                    className="text-xs underline text-black/70 hover:text-black"
                    onClick={selectAllRecipients}
                    type="button"
                  >
                    Select all
                  </button>
                  <span className="text-black/20">|</span>
                  <button
                    className="text-xs underline text-black/70 hover:text-black"
                    onClick={clearRecipientsSelection}
                    type="button"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {!recListsCollapsed ? (
                <>
                  {/* Search */}
                  <div className="mt-3">
                    <input
                      value={recSearch}
                      onChange={(e) => setRecSearch(e.target.value)}
                      placeholder="Search recipient lists (label or email)…"
                      className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                    />
                    <div className="mt-2 text-xs text-black/50">
                      Showing: <span className="text-black">{filteredRecipientLists.length}</span> of{" "}
                      <span className="text-black">{recipientLists.length}</span>
                    </div>
                  </div>

                  {/* Pagination controls */}
                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-black/10 bg-white/60 px-4 py-3">
                    <div className="text-xs text-black/70">
                      Page <span className="font-semibold text-black">{recPageSafe}</span> /{" "}
                      <span className="font-semibold text-black">{recTotalPages}</span> •{" "}
                      <span className="font-semibold text-black">{REC_PAGE_SIZE}</span> per page
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRecPage((p) => Math.max(1, p - 1))}
                        disabled={recPageSafe <= 1}
                        className="text-xs underline text-black/70 hover:text-black disabled:opacity-40 disabled:hover:text-black/70"
                      >
                        Prev
                      </button>
                      <span className="text-black/20">|</span>
                      <button
                        type="button"
                        onClick={() => setRecPage((p) => Math.min(recTotalPages, p + 1))}
                        disabled={recPageSafe >= recTotalPages}
                        className="text-xs underline text-black/70 hover:text-black disabled:opacity-40 disabled:hover:text-black/70"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Recipient list (paged) */}
                  <div className="mt-3 space-y-2">
                    {pagedRecipientLists.length === 0 ? (
                      <div className="text-sm text-black/60">No recipient lists found.</div>
                    ) : (
                      pagedRecipientLists.map((r) => {
                        const checked = selectedRecipientsIds.includes(r.id);
                        return (
                          <label
                            key={r.id}
                            className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/60 px-4 py-3"
                          >
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={checked}
                              onChange={() => toggleRecipientList(r.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{r.label}</div>
                              <div className="text-xs text-black/60">{r.emails.length} email(s)</div>
                              <div className="mt-1 text-xs text-black/60 break-words">{(r.emails || []).join(", ")}</div>
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={() => deleteRecipientList(r.id)}
                                  className="text-xs underline text-black/70 hover:text-black"
                                >
                                  Delete list
                                </button>
                              </div>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-3 rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm text-black/70">
                  Lists are collapsed. Selected lists:{" "}
                  <span className="font-semibold text-black">{selectedRecipientLists.length}</span>
                </div>
              )}

              <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 px-4 py-3">
                <div className="text-sm font-medium">Merged recipients</div>
                <div className="text-xs text-black/60">Total unique emails: {mergedRecipientEmails.length}</div>
              </div>
            </div>
          </section>

          {/* Templates */}
          <section className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
            <div className="text-lg font-semibold">Templates</div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Template Name</label>
                <input
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subject</label>
                <input
                  value={tplSubject}
                  onChange={(e) => setTplSubject(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Preheader</label>
                <input
                  value={tplPreheader}
                  onChange={(e) => setTplPreheader(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Banner URL</label>
                <input
                  value={tplBannerUrl}
                  onChange={(e) => setTplBannerUrl(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Body</label>
                <textarea
                  value={tplBody}
                  onChange={(e) => setTplBody(e.target.value)}
                  className="mt-2 h-28 w-full resize-none rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">CTA Text</label>
                  <input
                    value={tplCtaText}
                    onChange={(e) => setTplCtaText(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">CTA URL</label>
                  <input
                    value={tplCtaUrl}
                    onChange={(e) => setTplCtaUrl(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Signature</div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={sigEnabled} onChange={(e) => setSigEnabled(e.target.checked)} />
                    Enable
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="text-xs font-medium">Facebook URL</label>
                    <input
                      value={fbUrl}
                      onChange={(e) => setFbUrl(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Instagram URL</label>
                    <input
                      value={igUrl}
                      onChange={(e) => setIgUrl(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">LinkedIn URL</label>
                    <input
                      value={liUrl}
                      onChange={(e) => setLiUrl(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>

                <div className="mt-2 text-xs text-black/50">Social icons appear only when a URL is provided.</div>
              </div>

              <div className="flex flex-wrap gap-3">
                <LiquidGlassButton onClick={createTemplate}>Create</LiquidGlassButton>
                <LiquidGlassButton variant="ghost" onClick={updateSelectedTemplate}>
                  Update Selected
                </LiquidGlassButton>
                <LiquidGlassButton variant="ghost" onClick={() => setPreviewOpen(true)}>
                  Preview
                </LiquidGlassButton>
                <LiquidGlassButton variant="ghost" onClick={loadTemplates}>
                  Refresh
                </LiquidGlassButton>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">Select Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none"
                >
                  <option value="">-- choose --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <div className="mt-3 flex flex-wrap gap-3">
                  {selectedTemplate ? (
                    <>
                      <LiquidGlassButton variant="ghost" onClick={() => loadTemplateIntoEditor(selectedTemplate)}>
                        Load into Editor
                      </LiquidGlassButton>
                      <LiquidGlassButton variant="ghost" onClick={() => deleteTemplate(selectedTemplate.id)}>
                        Delete Selected
                      </LiquidGlassButton>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Attachments + Send */}
        <section className="mt-4 rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
          <div className="text-lg font-semibold">Attachments & Send</div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="w-full md:max-w-md" />

            <div className="flex flex-wrap gap-3">
              <LiquidGlassButton variant="ghost" onClick={uploadAttachments}>
                Upload Attachments
              </LiquidGlassButton>
              <LiquidGlassButton variant="ghost" onClick={() => setPreviewOpen(true)}>
                Preview Full Send
              </LiquidGlassButton>
              <LiquidGlassButton onClick={sendThenGoDashboard} className={sending ? "pointer-events-none opacity-60" : ""}>
                {sending ? "Sending…" : "Send Email"}
              </LiquidGlassButton>
            </div>
          </div>

          {uploadedPaths.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Uploaded attachments</div>
                  <div className="text-xs text-black/60">{uploadedPaths.length} file(s)</div>
                </div>

                <button
                  type="button"
                  onClick={clearAllUploadedAttachments}
                  className="text-xs underline text-black/70 hover:text-black"
                >
                  Remove all
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {uploadedPaths.map((p) => {
                  const name = p.split("/").pop() ?? "file";
                  return (
                    <div
                      key={p}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{name}</div>
                        <div className="text-xs text-black/50 truncate">{p}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeUploadedAttachment(p)}
                        className="text-xs underline text-black/70 hover:text-black"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>

        {/* Preview Modal */}
        {previewOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-5xl rounded-3xl border border-black/10 bg-white/85 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
                <div className="text-lg font-semibold">Preview: Full Send</div>
                <LiquidGlassButton variant="ghost" onClick={() => setPreviewOpen(false)}>
                  Close
                </LiquidGlassButton>
              </div>

              <div className="p-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                  <div className="text-sm font-semibold">Recipients</div>
                  <div className="mt-2 text-xs text-black/60">
                    Selected lists: {selectedRecipientLists.length}
                    <br />
                    Total unique emails: {mergedRecipientEmails.length}
                  </div>

                  <div className="mt-3 rounded-2xl border border-black/10 bg-white p-3 max-h-[40vh] overflow-auto">
                    {mergedRecipientEmails.length === 0 ? (
                      <div className="text-sm text-black/60">No recipients selected.</div>
                    ) : (
                      <ul className="text-sm text-black/80 space-y-1">
                        {mergedRecipientEmails.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-4 text-sm font-semibold">Sender</div>
                  <div className="mt-1 text-sm text-black/70">
                    From: <span className="font-medium">Chef Alex &lt;no-reply@alexhardinan.com&gt;</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <LiquidGlassButton variant="ghost" onClick={() => setPreviewOpen(false)}>
                      Back
                    </LiquidGlassButton>
                    <LiquidGlassButton
                      onClick={sendThenGoDashboard}
                      className={sending ? "pointer-events-none opacity-60" : ""}
                    >
                      {sending ? "Sending…" : "Send Now"}
                    </LiquidGlassButton>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white">
                  <iframe title="Email preview" className="h-[70vh] w-full rounded-2xl" sandbox="" srcDoc={previewHtml} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
