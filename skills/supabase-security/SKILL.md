---
name: supabase-security
description: Apply secure Supabase database, authentication, storage, authorization, and server-side validation practices for FixLoop. Use whenever designing schemas, policies, report submission, tracking links, admin actions, or file uploads.
---

# FixLoop Supabase Security

## Security principles
- Assume all browser input is untrusted.
- Enforce authorization in PostgreSQL through Row Level Security (RLS) and secure server-side operations; UI filtering is not a security boundary.
- Never put a Supabase service-role key or other privileged secret in browser code, public environment variables, committed files, logs, or client-visible errors.
- Use least privilege for database roles, API access, storage, and server functions.
- Do not disable RLS to make a feature work. Explain and fix the underlying policy or server-side access pattern.

## Data and authorization model
- Model communities, administrator-to-community assignments, reports, and report history explicitly.
- An administrator may read or modify only reports belonging to an assigned community.
- Derive the administrator identity from the authenticated session on the trusted server/database side; never trust a client-supplied admin ID or community ID as proof of permission.
- Public anonymous submission must be narrowly scoped. Do not grant anonymous users broad read, update, or delete access to reports.
- Public tracking must use a high-entropy, cryptographically secure token that is difficult to guess. Treat the tracking URL as a bearer credential.
- Store only the minimum tracking information necessary. Avoid returning internal identifiers, private administrator details, or unnecessary personal data to public clients.
- Prefer server-side lookup or narrowly scoped database functions for token-based tracking; do not expose a general table query that lets anonymous users enumerate reports.

## Report submission
- Validate and normalize all fields on the trusted server before inserting a report.
- Enforce the maximum of one optional image and the required field limits.
- Validate file type, size, and content as appropriate; do not trust filename extensions or browser-provided MIME type alone.
- Use safe generated object names rather than user-supplied paths.
- Restrict storage access and ensure uploaded files cannot be used to bypass report-level permissions.
- Use parameterized queries or safe Supabase APIs; never concatenate untrusted values into SQL.
- Apply server-side rate limiting or other abuse controls where practical. Do not claim this completely prevents spam.
- Do not introduce Cloudflare or Turnstile into the project unless the project owner explicitly changes the decision.

## Tracking tokens
- Generate tokens using a cryptographically secure random generator on a trusted server.
- Do not use sequential IDs, timestamps, short random strings, or predictable values as tracking secrets.
- Do not log full tracking tokens or expose them to analytics unnecessarily.
- Consider token rotation/revocation only if the product requirements support it; do not silently change existing tracking links.
- Return only the fields required by the public tracking page.

## Status and history integrity
- Restrict status changes to authorized administrators.
- Validate status values against the exact approved set:
  - `รอตรวจสอบ`
  - `รับเรื่องแล้ว`
  - `กำลังดำเนินการ`
  - `รอหน่วยงานภายนอก`
  - `แก้ไขแล้ว`
- Ensure a status change and its history entry are written atomically using a database transaction or a trusted server-side database function.
- Limit history notes to 200 characters and display newest first.
- Do not accept a client-supplied author identity as authoritative.
- Avoid creating history events for fields that end up unchanged after comparison with persisted values.

## Secrets and configuration
- Keep privileged keys in server-only environment variables.
- Commit an `.env.example` containing variable names and safe placeholders only; never commit real credentials.
- Validate required environment variables at startup and fail safely if missing.
- Redact secrets and tracking tokens from logs and error responses.
- Use separate development and production credentials/projects where feasible.

## Required security checks
Before declaring a security-sensitive change complete, verify:
1. Anonymous users cannot list or enumerate reports.
2. Public users cannot modify or delete existing reports.
3. An administrator from Community A cannot read or change Community B's reports, including through direct API calls.
4. Unauthenticated requests cannot invoke admin-only operations.
5. Privileged keys are absent from client bundles and repository history.
6. Storage policies prevent unauthorized access or overwrite.
7. Invalid status values, oversized notes, invalid uploads, and malformed inputs are rejected.
8. Errors do not leak secrets, stack traces, private report details, or internal policy information.

If a required security property cannot be verified, state that limitation explicitly instead of claiming the system is secure.
