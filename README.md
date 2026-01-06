Chef Alex — Email CRM (Next.js + Supabase + Resend)

A lightweight email CRM built for Chef Alex: manage recipient lists and templates, send emails (with attachments), and track activity in Reports and Dashboard Analytics.

Features

Auth: Supabase email/password login

Recipients: create recipient lists, select multiple lists, merge + dedupe emails, search + collapse recipient list panel

Templates: subject, preheader, banner URL, body text, CTA text + URL, signature block with social icons

Attachments: upload to Supabase Storage, link to sent emails

Send: send via /api/send-email (Resend), logs stored in email_logs

Reports: Sent / Draft / Deleted + restore + permanent delete

Dashboard: KPI metrics + charts + recent activity

Tech Stack

Next.js (App Router)

React

Tailwind CSS

Supabase (Auth, Postgres, Storage)

Resend (email provider)

Sonner (toasts)

Getting Started
1) Install
npm install

2) Environment Variables

Create .env.local in the project root:

# Supabase
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Resend (server-side)
RESEND_API_KEY=YOUR_RESEND_API_KEY

# Optional (used by your send logic / domain)
EMAIL_FROM=no-reply@alexhardinan.com

3) Run locally
npm run dev


Open:

http://localhost:3000/login

http://localhost:3000/dashboard

http://localhost:3000/send

http://localhost:3000/reports

Database Tables (Supabase)

This project expects these tables (names must match):

email_recipients

id (uuid, pk)

owner_uuid (uuid)

label (text)

emails (text[])

created_at (timestamp)

email_templates

id (uuid, pk)

owner_uuid (uuid)

name (text)

subject (text)

preheader (text)

banner_url (text)

cta_text (text)

cta_url (text)

signature_enabled (bool)

facebook_url (text)

instagram_url (text)

linkedin_url (text)

body_json (jsonb)

created_at (timestamp)

emails

id (uuid, pk)

owner_uuid (uuid)

status (draft | sent | deleted)

template_id (uuid)

recipients_id (uuid nullable)

subject (text)

rendered_html (text)

cta_text (text)

cta_url (text)

sent_at (timestamp nullable)

created_at (timestamp)

attachments

id (uuid, pk)

owner_uuid (uuid)

email_id (uuid)

storage_bucket (text)

storage_path (text)

file_name (text)

content_type (text)

file_size_bytes (bigint)

created_at (timestamp)

email_logs

id (uuid, pk)

owner_uuid (uuid)

email_id (uuid)

action (text)

details (jsonb)

created_at (timestamp)

Supabase Storage

Bucket required:

chef-alex-attachments

Attachments are uploaded to:

/{userId}/{uuid}-{filename}

Deployment (Vercel)
Production deployment checklist

Merge your working branch into main

Push to GitHub main

In Vercel, set Production Branch = main

Deploy

Commands (Windows)
git checkout main
git pull origin main
git merge polish-ui-v1
git push origin main

License

Private project.