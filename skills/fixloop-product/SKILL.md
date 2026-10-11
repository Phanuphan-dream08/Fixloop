---
name: fixloop-product
description: Preserve FixLoop's product requirements, scope, user flows, and business rules. Use when planning features, changing behavior, defining data fields, or making product decisions.
---

# FixLoop Product Rules

## Purpose
FixLoop is a community issue-reporting and tracking web app. Citizens can submit reports without creating an account, then follow progress through a unique tracking link. Community administrators manage reports assigned to their community.

## Non-negotiable product rules
- Do not expand scope or invent new features without explicit user approval.
- Preserve the approved Google Stitch UI as the source of truth. Do not redesign or regenerate it.
- Citizens must be able to submit a report without logging in.
- Each report must have a unique, cryptographically secure, hard-to-guess tracking token or URL.
- A QR code must open the same tracking URL; do not encode private report data in the QR code.
- Location is entered as text; do not require GPS access.
- A report may include at most one optional image.
- Administrator accounts are provisioned in advance and authenticate using Supabase Auth.
- Administrators may access and manage only reports belonging to their assigned community.
- Community isolation must be enforced in the database, not only by filtering the UI.

## Required report statuses
Use these exact Thai labels consistently throughout the product:
1. `รอตรวจสอบ`
2. `รับเรื่องแล้ว`
3. `กำลังดำเนินการ`
4. `รอหน่วยงานภายนอก`
5. `แก้ไขแล้ว`

Do not rename, reorder, or add statuses without explicit approval.

## History and change rules
- History notes must be limited to 200 characters.
- Display history newest first.
- Status changes and their history entries must be committed atomically in one database transaction or equivalent secure server-side operation.
- If a field is changed and then restored to its original value before saving, treat it as unchanged and do not create a change event.
- Do not silently discard or rewrite existing history.

## UX requirements
- Support desktop and mobile layouts.
- Preserve the approved Senior Mode design.
- Senior Mode should prioritize readable text, large controls, strong contrast, clear status descriptions, and simple step-by-step flows.
- Keep public reporting and tracking flows understandable without an account.
- Do not claim a report was saved until the server confirms success.
- Provide useful error and retry messages without exposing secrets or internal implementation details.

## Scope and decision process
Before implementing a requested feature:
1. Identify the user problem it solves.
2. Check whether it is within the agreed MVP.
3. Check impact on existing UI, privacy, security, and data model.
4. Prefer the smallest change that satisfies the requirement.
5. Ask for clarification when a decision would change a non-negotiable rule.

## Definition of done
A product change is complete only when:
- It matches the requirements above.
- Relevant success, validation, and failure states are covered.
- Existing approved UI is preserved unless the user explicitly approves a design change.
- Relevant tests or a clear manual verification plan are provided.
