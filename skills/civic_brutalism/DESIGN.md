---
name: Civic Brutalism
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#434656'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#747687'
  outline-variant: '#c4c5d8'
  surface-tint: '#0f4ceb'
  primary: '#003ece'
  on-primary: '#ffffff'
  primary-container: '#2457f5'
  on-primary-container: '#e4e6ff'
  inverse-primary: '#b8c4ff'
  secondary: '#725c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed74c'
  on-secondary-container: '#735d00'
  tertiary: '#005d25'
  on-tertiary: '#ffffff'
  tertiary-container: '#007833'
  on-tertiary-container: '#8fffa1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#0037b9'
  secondary-fixed: '#ffe07e'
  secondary-fixed-dim: '#e9c339'
  on-secondary-fixed: '#231b00'
  on-secondary-fixed-variant: '#564500'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an accessible, high-trust civic reporting interface tailored for diverse urban and rural communities. By pairing Neo-Brutalist structural clarity with warm, community-first usability, the system cuts through bureaucratic clutter to give citizens immediate agency and visibility over public infrastructure issues.

The aesthetic philosophy merges functional brutalism—heavy stroke weights, hard isometric offsets, solid fills—with civic approachability. The experience evokes accountability, civic pride, and tactile directness without appearing cold or hostile. 

Key attributes:
- **Tone**: Pragmatic, participatory, authoritative, and community-driven.
- **Target Audience**: All demographic tiers of Thai citizens—from digital-native youth reporting road hazards to seniors tracking local ward resolutions requiring high-contrast, large-target legibility.
- **Visual Stance**: Solid 2px ink lines, warm newsprint backdrops, zero-blur hard-drop shadows, and saturated informational signal colors that clearly differentiate report statuses at a glance.

## Colors

The palette uses high-contrast, high-noon contrast ratios designed to remain visible under bright tropical sunlight and on low-tier mobile panels. 

### Core Palette Roles
- **Canvas / Background (`#F7F5EF`)**: Warm newsprint paper base that softens harsh screen glare while maintaining maximum contrast against dark lines.
- **Ink / Surface Dark (`#1A1A1A`)**: Primary structural color for borders, text, deep shadows, and icons. Replaces digital pure black with a rich charcoal ink tone.
- **Primary Civic Blue (`#2457F5`)**: High-energy cobalt accent for interactive focal points, primary submission actions, issue creation triggers, and active tab indicators.
- **Secondary Highlight Yellow (`#FFD84D`)**: Warm amber-yellow for attention-critical badges, "In Progress" statuses, interactive toggles, and urgency callouts.
- **Tertiary Resolved Green (`#16A34A`)**: Saturated emerald green strictly dedicated to positive feedback, successful resolutions, and civic verification badges.
- **Critical / Alert Red (`#DC2626`)**: Direct warning color for urgent hazard flags, unresolvable infrastructure blocks, and destructive system actions.

### Implementation Principles
- Avoid intermediate low-contrast gray borders. Every structural container uses `#1A1A1A` at a uniform 2px stroke width.
- Background surfaces within cards should default to `#FFFFFF` resting over the `#F7F5EF` canvas to create crisp physical layers.
- Text contrast must adhere strictly to WCAG AAA standards across all functional elements, maintaining a minimum 7:1 ratio for body copy and 4.5:1 for interactive controls.

## Typography

The typography system pairs geometric, high-impact grotesque titling with humanist, open-counter body text to ensure extreme clarity across Thai script glyphs (vowel marks, tone indicators) and Latin alphanumerics.

### Font Role Mapping
- **Headings & Display (`Space Grotesk` / Thai Fallback: `Kanit`, `Prompt`)**: Punchy, structural, authoritative grotesque styling that sets a bold architectural tone for issue headers, counts, and stats.
- **Body & Interactive Content (`Plus Jakarta Sans` / Thai Fallback: `Sarabun`, `Bai Jamjuree`)**: Balanced proportion, open apertures, and generous vertical clearance ensure Thai vowels and tone markers (`ไม้เอก`, `ไม้โท`, `สระบน-ล่าง`) never overlap or render clipped across compact mobile screens.
- **Labels, Badges, & Metrics (`Space Grotesk`)**: Monospaced-leaning structural emphasis for tracking IDs, ticket status tags, and metadata timestamps.

### Localization & Readability Rules
- Base Thai body line-height must never drop below `1.5` (scaled to `26px` on `16px` font) to avoid tone collision.
- For the accessible **Senior Mode**, scale body text to a base of `18px` (`body-lg`) or `20px` (`body-xl`), maintaining absolute line clarity without visual clutter.

## Layout & Spacing

The layout is grounded in a rigid, structural column grid engineered for immediate field navigation on handheld devices and consolidated dashboard monitoring on desktop screens.

### Grid Framework
- **Mobile (< 768px)**: 4-column layout, `1rem` outer canvas margin, `1rem` column gutters. All report inputs and feeds span full columns for ergonomic single-hand usage.
- **Tablet (768px - 1024px)**: 8-column layout, `2rem` margin, `1.25rem` gutters. Map and issue list viewports split into dynamic dual panes.
- **Desktop (> 1024px)**: 12-column layout, constrained to a maximum content container width of `1280px` centered within a `3rem` canvas margin, with `1.5rem` gutters.

### Layout Rhythm
- Strict 8pt structural baseline grid (`0.5rem`, `1rem`, `1.5rem`, `2.5rem`).
- Cards, feed rows, and issue threads stack using `space-md` (`1rem`) gaps to preserve clear physical separation between discrete community reports.
- Container padding is uniformly set to `space-md` or `space-lg`, ensuring structural elements don't visually compress against solid borders.

## Elevation & Depth

Visual depth avoids soft gradients or blurry drop shadows. Instead, it relies on tactile physical planes inspired by retro risograph printing and neo-brutalist construction.

### The Offset Hard-Shadow System
All primary elevational layers use hard, 100% opaque shadows cast in `#1A1A1A`:
- **Resting Layer (Default Cards, Panels, Modals)**: `4px 4px 0px 0px #1A1A1A`. Provides distinct visual separation from the canvas.
- **Interactive Hover / Focus**: Shadow expands to `6px 6px 0px 0px #1A1A1A` with a subtle inverse offset translation (`translate(-2px, -2px)`), signaling tactile lift.
- **Pressed / Active State**: Shadow collapses to `0px 0px 0px 0px #1A1A1A` with a `translate(4px, 4px)` downward displacement, mimicking physical mechanical actuation.
- **Floating Controls (FABs, Critical Alerts)**: `8px 8px 0px 0px #1A1A1A` for prominent elevation.

### Structural Boundaries
- Every elevational element must be outlined in a continuous `2px solid #1A1A1A` border.
- The hard shadow color does not change with status; only the interior background fill (e.g., `#FFFFFF`, `#FFD84D`, `#2457F5`) shifts to convey state.

## Shapes

The design system maintains geometric discipline using a controlled "Soft Brutalism" shape treatment (`roundedness: 1`).

### Geometry Rules
- **Base Components (Cards, Panels, Inputs, Alerts)**: `0.25rem` (4px) corner radii. This softens aggressive brutalist razor edges while preserving sharp mechanical silhouette fidelity.
- **Large Containers (Dialogs, Bottom Sheets)**: `rounded-lg` (`0.5rem` / 8px) with `2px solid #1A1A1A` stroke.
- **Pill Exceptions (Status Tags, Category Chips, Metric Badges)**: Full pill radius (`9999px`) bounded by `2px solid #1A1A1A` borders. The roundness of metadata pills contrasts clearly against rectangular issue cards.
- **Dividers & Strokes**: Exact 2px structural lines throughout; hairline rules (1px) are never permitted.

## Components

### Buttons
- **Primary Action (Report Issue, Submit Update)**: `#2457F5` background, `#FFFFFF` bold text, `2px solid #1A1A1A` border, `4px 4px 0px #1A1A1A` drop shadow. Minimum touch target is `48px` height (scaled to `56px` in Senior Mode). Active state shifts element `4px 4px` into the shadow.
- **Secondary Action (Filter, Share, Upvote)**: `#FFFFFF` background, `#1A1A1A` bold text, `2px solid #1A1A1A` border, `4px 4px 0px #1A1A1A` drop shadow.
- **Status/Destructive Button**: `#DC2626` background, `#FFFFFF` text, same border and shadow logic.

### Cards (Issue Reports)
- Surface is `#FFFFFF` with `2px solid #1A1A1A` boundary, `0.25rem` radius, and `4px 4px 0px #1A1A1A` offset shadow.
- Internal padding is `1.25rem`. 
- Top header hosts category title, issue ID in monospaced/grotesque badge, and location pin.
- Images inside cards are framed with an internal `2px solid #1A1A1A` border and `0.25rem` radius.

### Badges & Status Chips
- Height is fixed at `28px` (desktop) / `32px` (touch friendly).
- Border is `2px solid #1A1A1A`.
- Color mapping:
  - **รับเรื่องแล้ว (Received / Pending)**: `#FFFFFF` fill with bold text.
  - **กำลังดำเนินการ (In Progress)**: `#FFD84D` fill with `#1A1A1A` text.
  - **แก้ไขเสร็จสิ้น (Resolved)**: `#16A34A` fill with `#FFFFFF` text.
  - **ปฏิเสธ / ส่งต่อ (Rejected / Rerouted)**: `#DC2626` fill with `#FFFFFF` text.

### Form Inputs & Select Fields
- Height is minimum `52px` to guarantee accessible senior typing.
- Background: `#FFFFFF` with `2px solid #1A1A1A` border and `0.25rem` radius.
- Focus state: Outline remains `#1A1A1A` with a distinct `3px 3px 0px #2457F5` shadow shift.
- Labels are rendered in `Space Grotesk` bold (`label-md`), positioned top-left above inputs with a `0.5rem` margin.
- Helper text is high-contrast `#1A1A1A` with an accompanying warning or information icon.

### Checkboxes & Radio Buttons
- Sizing: `24px x 24px` square (checkbox) or circle (radio) with `2px solid #1A1A1A` border.
- Hit area expands to minimum `48px x 48px`.
- Selected Checkbox: `#FFD84D` fill with bold `#1A1A1A` checkmark graphic.
- Selected Radio: Centered solid `#1A1A1A` dot with `#FFD84D` surrounding fill.

### Civic Issue Verification Bar (Upvote / "Me Too" Counter)
- A specialized composite control combining a thumbs-up count with a community validation button.
- Layout: Split horizontal container wrapped in `2px solid #1A1A1A` and `4px 4px 0px #1A1A1A` shadow.
- Counter segment: `#F7F5EF` fill with bold headline metric.
- Action segment: `#2457F5` fill with white text, triggering an tactile sink effect on click.

### Senior Accessibility Switcher
- Persistent top-bar utility toggle labeled "โหมดอ่านง่าย" (Senior / Easy-Read Mode).
- When toggled, all font scales increase by 20%, touch targets expand from `48px` to `56px`, and shadows increase from `4px` to `6px` for enhanced contrast and visual clarity.