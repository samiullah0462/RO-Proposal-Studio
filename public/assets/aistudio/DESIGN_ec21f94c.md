# DESIGN.md — RO Proposal Studio (working title)

Version 0.1 · UI design system and PDF layout spec. Companion to `PRD.md` and `TRD.md`.

> Colors below are **approximated from the sample proposal** (PAKSAFE cover and headers). Replace them with the exact brand values from the logo files before build. Each company can override them (see Branding).

---

## 1. Design principles

1. **Fast over fancy.** The user fills forms all day: few clicks, clear defaults, keyboard friendly.
2. **Always show state.** Offline, syncing, unsaved, locked: visible at all times, never hidden.
3. **Numbers are the hero.** Calculator results are large, aligned, with units and a short reason.
4. **Safe by default.** Destructive actions confirm; sent proposals are read-only; undo where possible.
5. **Same look in app and PDF.** Tokens drive both.

---

## 2. Design tokens

### 2.1 Color (CSS variables; light theme default, dark theme supported)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--brand-900` | `#1F3A5F` | `#9DC3E6` | Headings, wordmark |
| `--brand-700` | `#2E75B6` | `#5B9BD5` | Primary buttons, links, section titles |
| `--brand-500` | `#5B9BD5` | `#2E75B6` | Accents, cover band |
| `--brand-100` | `#DEEBF7` | `#1B2A3D` | Selected rows, soft fills |
| `--slate-700` | `#44546A` | `#CBD5E1` | Cover title band, secondary text |
| `--bg` | `#F7F9FC` | `#0F172A` | App background |
| `--surface` | `#FFFFFF` | `#1E293B` | Cards, panels |
| `--border` | `#D8DFE8` | `#334155` | Lines, inputs |
| `--text` | `#0F172A` | `#E2E8F0` | Body |
| `--text-muted` | `#5B6B7F` | `#94A3B8` | Helper text |
| `--success` | `#2E7D32` | `#66BB6A` | Won, synced |
| `--warning` | `#B26A00` | `#FFB74D` | Pending, due soon |
| `--danger` | `#C62828` | `#EF5350` | Errors, lost, delete |
| `--info` | `#0277BD` | `#4FC3F7` | Notices |

Contrast: text on surface ≥ 4.5:1 (WCAG AA). Never use color alone to show status; pair with icon or label.

### 2.2 Typography
- **UI**: `Inter`, fallback `system-ui, Segoe UI, Roboto, sans-serif`. Bundle the font files for offline.
- **PDF body**: `Carlito` (open-source, Calibri-compatible) unless licensed brand fonts are supplied; **PDF headings**: brand heading font or `Carlito` bold. Fonts embedded from `/public/fonts`.
- Scale (UI): 12 / 14 (body) / 16 / 20 / 24 / 32 px. Weights 400, 500, 600. Line height 1.5 body, 1.25 headings.
- Numbers in tables and calculators use **tabular figures** (`font-variant-numeric: tabular-nums`).

### 2.3 Spacing, radius, elevation
- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48.
- Radius: 6 (inputs, buttons), 10 (cards), 999 (badges).
- Shadow: cards `0 1px 2px rgba(0,0,0,.06)`; popovers `0 8px 24px rgba(0,0,0,.12)`.
- Minimum touch/click target: 40 × 40 px.

### 2.4 Motion
150 ms ease-out for hover/focus; 200 ms for panels. Respect `prefers-reduced-motion`.

---

## 3. App shell and navigation

### 3.1 Layout
- **Desktop (≥1024 px)**: left sidebar (240 px, collapsible to icons), top bar, content area. Proposal builder uses a 3-column layout (§5.3).
- **Tablet (640–1023 px)**: collapsed sidebar, builder switches to 2 columns with preview in a tab.
- **Mobile (<640 px)**: bottom navigation (Home, Proposals, Clients, Calculators, More); forms single column; preview opens full screen.

### 3.2 Sidebar items
Dashboard · Proposals · Clients · Calculators · Library · Templates · Settings (Companies, Rules, Backup & Sync).

### 3.3 Top bar (always visible)
Search (global, `Ctrl/Cmd+K`) · **Company switcher** (current brand) · **Sync indicator** · user menu.

### 3.4 Sync / offline indicator

| State | Icon + label | Color |
|---|---|---|
| Synced | check, "Synced 2 min ago" | success |
| Pending | arrows, "3 changes waiting" | warning |
| Syncing | spinner, "Syncing…" | info |
| Offline | cloud-off, "Offline — saved on this device" | text-muted |
| Error | alert, "Sync problem — tap for details" | danger |

Clicking opens the sync log (last 50 events) and a "Sync now" button.

---

## 4. Components

| Component | Spec |
|---|---|
| **Button** | Primary (brand-700 fill), Secondary (outline), Ghost, Danger. Height 40, radius 6, icon optional. Disabled at 50% opacity with tooltip explaining why. |
| **Input / Select / Textarea** | Label above, helper text below, error text in danger with icon. Unit suffix inside field (e.g. `m³/hr`). Numeric fields right-aligned, accept comma or dot decimal. |
| **Spec editor row** | `label | value | unit | ⋮` (drag to reorder, reset to library value, delete). Edited values show a small dot. |
| **Card** | Surface fill, 1 px border, radius 10, padding 16–24. |
| **Table** | Sticky header, zebra optional, row hover, column sort, sticky first column on mobile. |
| **Status badge** | Pill: Draft (grey), Sent (blue), Follow-up (amber), Won (green), Lost (red), On hold (purple), Expired (grey outline), Superseded (grey strike). Always with text. |
| **Result tile** (calculators) | Large value (24–32 px, tabular), unit, small label; optional "why" tooltip. |
| **Check chip** | ✓ pass / ⚠ warning / ✕ fail with one-line reason (e.g. "Velocity 12.4 m/hr ≤ 16 limit"). |
| **Dialog** | Max width 560; confirm dialogs name the object being changed. |
| **Toast** | Bottom-right, 4 s, undo action where relevant. |
| **Empty state** | Icon + one sentence + primary action ("Add your first client"). |
| **Stepper** (new proposal) | 1 Company & client → 2 Template → 3 Design parameters → 4 Review |
| **Kanban card** | Ref, client, value, age, next follow-up date. |
| **Lock screen** | Shown after idle: PIN field, company logo. |

---

## 5. Screens

### 5.1 Dashboard
- Tiles: Quoted this month · Won · Win rate · Open proposals.
- **Due today** list (follow-ups), **Waiting > 7 days** list.
- Quick actions: New proposal, New client, Open calculator.

### 5.2 Proposals list
- Toggle **List / Board** (Draft, Sent, Follow-up, Won, Lost).
- Filters: company, client, status, date range; search by ref or client.
- Row actions: Open, Duplicate, Create revision, Export PDF, Delete (draft only).

### 5.3 Proposal builder (core screen)

```
┌──────────────┬───────────────────────────────┬──────────────────────┐
│ OUTLINE      │ EDITOR                         │ LIVE PDF PREVIEW      │
│              │                                │                       │
│ Cover        │ 1. Design parameters           │  ┌───────────────┐    │
│ Design       │   Feed [10,000] GPD            │  │  A4 page      │    │
│ ▸ 1 MMF      │   Recovery [50] %              │  │  with header, │    │
│ ▸ 2 Cartridge│   → Product 5,000 GPD (calc)   │  │  watermark    │    │
│ ▸ 3 Pumps    │                                │  └───────────────┘    │
│ …            │ 2. Multimedia filter  [Calc]   │  Page 2 / 9  ◀ ▶      │
│ Instruments  │   (spec rows…)                 │  [Export PDF]         │
│ Commercial   │                                │                       │
│ [+ Add item] │   Qty [1]   Price [ ]          │                       │
└──────────────┴───────────────────────────────┴──────────────────────┘
 Footer: Autosaved · Undo · Redo · Status badge · Save snapshot / Mark Sent
```
- Outline: drag to reorder, eye icon to hide a section, warning dots where validation fails.
- Editor: collapsible sections; **[Calc]** button opens the calculator in a side drawer with **Apply to proposal**.
- Preview: updates after 800 ms of inactivity; shows page count and warnings.

### 5.4 Calculators
- **Multimedia filter**: inputs left, results right. Results show: standard vessel size, actual velocity, rated flow, FRP/MS recommendation with reason chip, media table (layer · depth · density · weight · cost), total weight. Buttons: *Apply to proposal*, *Save as…*, *Reset*.
- **Cartridge filters**: stage selector (1 stage 5 µm / 2 stages 5 µm → 1 µm), result per stage (elements, housing, quantity), consistency check chip.
- **RO flows**: feed, recovery → product, reject, GPD/m³·hr/GPM, membrane count suggestion.
- Inputs prefilled from the proposal's design parameters when opened from a proposal.

### 5.5 Clients
- List with search, filters (Lead/Customer/Inactive), city.
- **Client detail** tabs: Overview · Contacts · Sites & water analyses · Proposals · Activity · Files.
- Quick add (name + phone) available from the proposal form.

### 5.6 Library and templates
- Library: category sidebar, component list, detail editor (ordered spec fields; drag to reorder; "used in n proposals" is informational).
- Templates: ordered component list with default quantities; "Create from proposal".

### 5.7 Settings
- **Companies**: logo upload (with crop preview), colors, watermark settings with live PDF mini-preview, ref pattern, default terms.
- **Rules**: tables for vessel sizes, media, cartridge types, housings, thresholds. Each table editable inline, with "reset to defaults".
- **Backup & Sync**: Export / Import JSON, last backup date, storage used, sync log.
- **Security**: app lock PIN and idle time.

---

## 6. Interaction patterns

- **Autosave** on every field change (debounced 500 ms) to local DB; no Save button for data.
- **Undo/redo** inside the proposal builder (`Ctrl+Z / Ctrl+Shift+Z`).
- **Keyboard**: `Ctrl+K` search, `Ctrl+N` new proposal, `Ctrl+P` preview/export, `Tab` order follows visual order.
- **Validation**: inline at field level, summary count in the footer; warnings do not block export, errors do.
- **Read-only state**: Sent proposals show a banner "Sent on {date} — create a revision to edit".
- **Destructive actions**: delete requires confirmation naming the item; deletion of components used in proposals is allowed (proposals hold copies) with an informational note.
- **Offline copy**: when a feature needs the internet (file download, first login), show a clear message and the offline alternative.
- **Numbers**: thousands separators, 2 decimals for money, flows to 2–3 decimals; units always shown.

---

## 7. Accessibility
- WCAG 2.1 AA target.
- Visible focus ring (2 px `--brand-700` with 2 px offset).
- Labels on all inputs; errors announced via `aria-live`.
- Status never by color only.
- Minimum 40 px targets; zoom to 200% without horizontal scroll (except wide tables inside their own scroll container).
- Screen-reader names for icon buttons.

---

## 8. PDF layout specification (A4)

Derived from the sample proposal; tune against it during MVP.

### 8.1 Page
- Size 595 × 842 pt. Margins: top 100 pt (below header), bottom 60 pt, left/right 56 pt.
- Header (all pages except cover): logo left (≈ 64 pt high), company wordmark centered ("PAKSAFE / PURIFYING LIFE" style), thin brand-500 rule below. Footer: grey rule, page number in a small boxed tab at right.
- **Watermark**: company logo + wordmark, centered, opacity 10–15%, behind content, on all inner pages.

### 8.2 Cover
- Full-width hero image (top ~55% of the page; optional per proposal, falls back to company default).
- Title band (slate-700, white text, ~36 pt, light weight): "Technical & Commercial Proposal For {Plant Type}".
- Line: "M/S {Client name}".
- Bottom strip (brand-500) with company name.

### 8.3 Table of contents
- Title "TABLE OF CONTENTS:" centered, brand-700, underlined.
- Entries: number, UPPERCASE title, dotted leader, page number. Top-level (Technical Proposal / Commercial Proposal) in larger brand-700 text. Numbers auto-generated.

### 8.4 Technical proposal page
- Top row: `Date: {date}` left, `Ref: {ref}` right (11 pt).
- Boxed title: 1 px border, centered, brand-700 underlined: "TECHNICAL PROPOSAL:" and second line "{capacity} {type} ({control mode})".
- Section heading: `{n}. {TITLE}` 14 pt bold uppercase, brand-900.
- **Spec block**: indented ~56 pt from the left margin; two columns: label column ≈ 150 pt, value column to the right margin; label regular, value regular; row height ≈ 15 pt; 12 pt body. Sub-headings (e.g. TDS CONTROLLER) use a small brand icon bullet and 13 pt.
- Spacing: 14 pt between blocks. A section is kept together when it fits on one page; otherwise breaks between rows, never leaving a heading alone.

### 8.5 Commercial proposal page
- Boxed title "COMMERCIAL PROPOSAL:" plus plant line.
- Intro sentence, then **PRICE SUMMARY** (rule line, item label left, amount right in bold brand-900, underlined for lump sum), or a table for grouped/itemized modes with subtotal, tax lines, grand total.
- **PAYMENT TERMS & CONDITIONS**: icon bullets, percentage in bold, auto-calculated amount optional.
- **DELIVERY** and optional **VALIDITY**, **WARRANTY**, **NOTES**.
- Optional signature block with company signatory.

### 8.6 Fidelity rule
If the generated PDF and the original Word proposal differ in structure (section order, labels, units), the **PDF follows the template content**; typography differences are acceptable.

---

## 9. Branding rules (per company)
- Inputs: logo (PNG/SVG, transparent background), primary and accent color, watermark image/text/opacity, header/footer text, heading font (optional).
- The app UI chrome stays neutral; only the PDF and the company switcher dot use the brand colors.
- Brand preview in Settings shows cover, a technical page, and the commercial page.

---

## 10. Content and microcopy
- Plain language, short labels: "Feed flow", "Recovery", "Apply to proposal".
- Units always visible and consistent: GPD, m³/hr, GPM, bar(g), mm, in.
- Errors say what to do: "Cartridge quantity (1) does not match housing slots (5). Change one."
- Offline copy: "You're offline. Everything is saved on this device and will sync later."
- Spelling consistency list in code (e.g. PANEL, OVERLOAD, PVC) used to flag typos in library entries.

---

## 11. Assets needed
1. Logo files (SVG/PNG) and exact brand colors per company.
2. Brand fonts, if any, with embedding license.
3. Cover hero image(s).
4. Watermark artwork if different from the logo.
5. Icon set: Lucide (open source) for the app; small brand bullet icon for the PDF.
