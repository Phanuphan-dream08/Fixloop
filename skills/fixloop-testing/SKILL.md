---
name: fixloop-testing
description: Plan and run FixLoop functional, regression, responsive, accessibility, and security tests. Use before releases, after changes to report flows, database policies, UI, or deployment configuration.
---

# FixLoop Testing Strategy

## Testing approach
- Inspect the repository to discover its framework, scripts, test runner, and existing conventions before adding tools or changing configuration.
- Prefer the project's existing test stack. Do not install new dependencies unless needed and approved.
- Never use real production personal data for tests.
- Use a development or test environment and safe test credentials.
- Do not report tests as passing unless they were actually run and passed. Separate automated results from manual checks.

## Core public reporting tests
- A visitor can open the report form without signing in.
- Valid input submits successfully and creates one report.
- Missing required fields, invalid values, and over-limit values are rejected with understandable messages.
- A report accepts zero or one optional image; a second image is rejected.
- The submitted location is stored as text and does not require GPS permission.
- Failed submission does not display a false success state.
- Repeated clicks or retry behavior do not accidentally create duplicate reports where idempotency protection is implemented.
- Rate limiting or abuse controls return a safe, understandable response when triggered.

## Tracking tests
- The returned tracking link opens the correct report.
- The QR code resolves to the same tracking URL.
- Invalid or unknown tokens do not reveal report data.
- Public tracking responses expose only approved fields.
- Reports cannot be enumerated by incrementing IDs or guessing predictable URLs.
- Verify that tracking URLs are treated as sensitive bearer credentials and are not unnecessarily logged or exposed.

## Administrator and community isolation tests
- Unauthenticated visitors cannot access administrator pages or operations.
- An authenticated administrator can view and manage reports only in their assigned community.
- A user from Community A cannot read, update, or delete Community B records by changing request parameters or calling APIs directly.
- Client-supplied community or administrator IDs cannot bypass authorization.
- Status changes reject values outside the five approved Thai statuses.
- Each successful status change creates the matching history record.
- Failed status updates do not leave orphaned history records or mismatched status/history state.
- History notes longer than 200 characters are rejected.
- History is shown newest first.
- Saving a value that has returned to its original persisted value does not create a false change event.

## UI, responsive, and accessibility tests
- Compare implemented screens with the approved Google Stitch export; do not substitute a new design.
- Check desktop and mobile layouts at representative viewport sizes.
- Verify Senior Mode remains readable, high-contrast, and easy to operate.
- Check keyboard navigation, focus visibility, form labels, accessible names, and validation messages.
- Verify loading, empty, success, offline/network failure, and server error states.
- Check all visible links, buttons, status indicators, and QR behavior.
- Verify Thai text does not clip, overlap, or overflow at common screen sizes.

## Release checks
When available, run the existing project commands for:
1. Unit and integration tests.
2. Linting and formatting checks.
3. Type checking.
4. Production build.
5. Database migration and RLS policy checks in a non-production environment.
6. Deployment smoke tests.

Do not run destructive migrations or tests against production without explicit authorization and a rollback plan.

## Bug report format
For each failure, report:
- Summary
- Environment and steps to reproduce
- Expected result
- Actual result
- Severity and affected flow
- Relevant logs with secrets and tracking tokens redacted
- Suggested fix
- Retest result

## Completion report
At the end of a test pass, summarize:
- Checks that passed
- Checks that failed
- Checks not run and why
- Remaining risks
- Files or configuration changed
- Whether the build and deployment were actually verified
