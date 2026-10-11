---
name: fixloop-ui
description: Implement, repair, or verify FixLoop UI while preserving the approved Google Stitch export as the visual source of truth. Use for frontend work, responsive layouts, accessibility, and visual matching.
---

# FixLoop UI Preservation Rules

## Source of truth
- The approved Google Stitch export is the canonical UI reference.
- Treat the exported files and their assets as the starting point. Inspect them before editing.
- Do not regenerate, redesign, or replace screens simply because another design seems better.
- Do not create a second app or duplicate project if a working project already exists.
- If the export is an archive, extract it and inspect its contents; do not interpret binary ZIP data as source code.

## Required workflow before changes
1. Inspect the repository and current working directory.
2. Locate and inspect the Stitch export, including assets, page structure, styles, and dependencies.
3. Identify which existing files implement the relevant screen.
4. Summarize the planned minimal changes before making broad or destructive edits.
5. Preserve existing naming, framework, and component patterns where practical.
6. If the design source or intended target file is unclear, ask before replacing files.

## Visual fidelity
- Match the supplied design's layout, hierarchy, spacing, typography, colors, borders, radii, imagery, icons, and interaction states.
- Reuse supplied assets; do not substitute unrelated imagery or invent new branding.
- Preserve desktop, mobile, and Senior Mode layouts.
- Do not remove elements because they are inconvenient to implement. Report blockers and propose the smallest faithful solution.
- Do not add decorative effects, animations, sections, or components that are not supported by the reference.
- Use responsive behavior that retains the reference's hierarchy and functionality on small screens.

## Accessibility and usability
- Use semantic HTML and properly associated labels.
- Ensure keyboard access and visible focus indicators.
- Provide meaningful accessible names for icon-only controls.
- Maintain readable contrast and avoid relying on color alone to communicate status.
- In Senior Mode, preserve large touch targets, readable text, high contrast, clear instructions, and simple flows.
- Show validation errors close to the relevant fields and explain how to correct them.

## UI behavior
- Keep visual components separate from business logic where the existing architecture supports it.
- Include loading, empty, success, validation, and failure states where relevant.
- Do not fake successful submissions or use hard-coded mock data in production flows without clearly identifying it as a demo.
- Avoid exposing private report details in public UI beyond what is needed for tracking.
- Keep the five required Thai report status labels exactly as specified in the product requirements.

## Verification
After changes:
1. Run the project's existing lint, type-check, build, and test commands when available.
2. Compare the changed screen against the Stitch reference at relevant desktop and mobile widths.
3. Verify links, buttons, forms, and error states work.
4. Report files changed, checks run, and known differences from the reference.
5. Never claim pixel-perfect matching unless it has actually been inspected.
