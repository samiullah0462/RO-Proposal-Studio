# TECHNICAL FLOWCHART — RO Proposal Studio (working title)

Companion to `PRD.md`, `TRD.md`, `DESIGN.md`.

All diagrams are in Mermaid. They render in GitHub, VS Code (Mermaid preview extension), Google AI Studio / most Markdown viewers, and at https://mermaid.live (paste the code block).

Contents
1. System architecture
2. Offline-first data flow
3. Sync sequence
4. Reference-number reservation
5. Proposal creation flow
6. Multimedia filter calculation flow
7. Cartridge filter calculation flow
8. PDF generation pipeline
9. Proposal status state machine
10. Revision and duplicate flow
11. Data model (ER overview)
12. Deployment and CI flow

---

## 1. System architecture

```mermaid
flowchart TB
  subgraph Device["User device (Windows / Linux, installed PWA)"]
    UI["React UI"]
    DOM["Domain layer<br/>calc engine, pricing, ref numbers"]
    LDB[("Local DB<br/>Dexie / IndexedDB")]
    SYNC["Sync engine<br/>outbox + pull cursors"]
    PDF["PDF engine<br/>react-pdf"]
    SW["Service worker<br/>app shell cache"]
    UI --> DOM
    UI --> LDB
    UI --> PDF
    DOM --> LDB
    SYNC <--> LDB
    SW -.caches.-> UI
  end

  subgraph Cloud["Cloud (used only when online)"]
    VERCEL["Vercel<br/>static hosting"]
    SUPA["Supabase"]
    AUTH["Auth"]
    PG[("Postgres + RLS")]
    STO["Storage<br/>files, snapshots"]
    SUPA --- AUTH
    SUPA --- PG
    SUPA --- STO
  end

  GH["GitHub repo"] --> VERCEL
  GH -- "keep-alive cron (3 days)" --> PG
  VERCEL -- "app files / updates" --> SW
  SYNC <-- "push / pull (HTTPS)" --> SUPA
```

---

## 2. Offline-first data flow

```mermaid
flowchart LR
  A["User edits a field"] --> B["Validate (Zod)"]
  B --> C["Write to Dexie<br/>client_updated_at = now<br/>_dirty = true"]
  C --> D["UI updates instantly<br/>(liveQuery)"]
  C --> E["Add to outbox"]
  E --> F{"Online and<br/>signed in?"}
  F -- "No" --> G["Show: Pending n changes"]
  F -- "Yes" --> H["Run sync (see diagram 3)"]
  G -- "connection returns" --> H
  H --> I["Show: Synced"]
```

---

## 3. Sync sequence

```mermaid
sequenceDiagram
  autonumber
  participant UI as UI
  participant L as Local DB (Dexie)
  participant S as Sync engine
  participant API as Supabase API
  participant DB as Postgres (RLS)

  UI->>L: save change (dirty + outbox)
  S->>S: trigger (online / debounce 5s / every 5 min / manual)
  S->>L: read dirty rows, parents first
  S->>API: upsert batch (rows, client_updated_at)
  API->>DB: INSERT/UPDATE with RLS
  DB->>DB: guard trigger<br/>ignore if older client_updated_at<br/>set server_updated_at = now()
  DB-->>API: result per row
  API-->>S: accepted / ignored rows
  S->>L: clear dirty flags for accepted rows
  loop each table
    S->>API: select where server_updated_at > cursor
    API-->>S: changed rows + tombstones
    S->>L: apply (skip if local dirty row is newer)
    S->>L: save new cursor
  end
  S-->>UI: status = Synced (or Error with retry/backoff)
```

---

## 4. Reference-number reservation

```mermaid
flowchart TD
  A["New proposal"] --> B["Need next number<br/>for company + year"]
  B --> C{"Unused numbers in<br/>local reserved block?"}
  C -- "Yes" --> D["Take next unused number"]
  C -- "No" --> E{"Online?"}
  E -- "Yes" --> F["RPC reserve_ref_block(company, year, device, 10)"]
  F --> G["Store block locally"]
  G --> D
  E -- "No" --> H["Assign provisional TEMP number<br/>block 'Mark Sent' until final"]
  D --> I["Format with company pattern<br/>PS/PRO/YY/NNNN"]
  I --> J["Save proposal"]
  H --> J
  J --> K{"Remaining unused < 3<br/>and online?"}
  K -- "Yes" --> F
  K -- "No" --> L["Done"]
  H -- "on first sync" --> F
  J --> M{"Unique clash on sync?"}
  M -- "Yes" --> N["Renumber later proposal<br/>and flag it for review"]
  M -- "No" --> L
```

---

## 5. Proposal creation flow

```mermaid
flowchart TD
  S(["New proposal"]) --> C1["Choose company (brand)"]
  C1 --> C2["Choose client, contact, site<br/>or quick-add"]
  C2 --> C3["Choose template (e.g. BWRO semi-auto)"]
  C3 --> C4["Enter design parameters<br/>feed, recovery, TDS, pressure, temp"]
  C4 --> C5["Derived: product, reject, m3/hr"]
  C5 --> CALC{"Run calculators?"}
  CALC -- "Yes" --> K1["Multimedia filter calc"]
  K1 --> K2["Cartridge filter calc"]
  K2 --> K3["RO flow / membrane count"]
  K3 --> AP["Apply results to proposal items"]
  CALC -- "No" --> ED
  AP --> ED["Review / edit specs<br/>(proposal holds its own copy)"]
  ED --> V{"Validation OK?<br/>qty vs slots, prices, flows"}
  V -- "Warnings" --> ED
  V -- "OK" --> PR["Set price mode, tax, currency,<br/>payment terms, delivery, validity"]
  PR --> PV["Live preview"]
  PV --> EX["Export PDF"]
  EX --> SENT{"Mark as Sent?"}
  SENT -- "Yes" --> SN["Save snapshot (data + PDF)<br/>lock proposal, set follow-up date"]
  SENT -- "No" --> DR["Stay Draft"]
```

---

## 6. Multimedia filter calculation flow

```mermaid
flowchart TD
  I["Inputs<br/>Q m3/hr, service h, backwash h,<br/>velocity, margin, media layers,<br/>vessel type preference"] --> A["IFR = Q x (1+margin) x 24 / service h"]
  A --> B["Area = IFR / velocity"]
  B --> C["Calculated diameter = sqrt(4 x Area / pi)"]
  C --> D{"Diameter <= largest<br/>allowed single vessel?"}
  D -- "Yes" --> E["Pick next standard size >= diameter<br/>count = 1"]
  D -- "No" --> F["Try n = 2, 3 ... vessels<br/>each takes IFR / n"]
  F --> E
  E --> G["Actual velocity = IFR / (n x pi x D^2 / 4)"]
  G --> H{"Actual velocity <= limit?"}
  H -- "No" --> E2["Move up one standard size"] --> G
  H -- "Yes" --> J["Rated flow = area x velocity limit"]
  J --> K["Media weight per layer =<br/>area x depth x bulk density<br/>(using chosen diameter)"]
  K --> L["Media cost = weight x rate per kg"]
  L --> M{"Shell height >=<br/>bed depth x (1 + freeboard %)?"}
  M -- "No" --> M2["Warn / pick taller shell"]
  M -- "Yes" --> N
  M2 --> N["FRP vs MS rule"]
  N --> O{"Diameter, pressure, temperature<br/>within FRP thresholds?"}
  O -- "Yes" --> P["Recommend FRP + reason"]
  O -- "No" --> Q["Recommend MS (lined / coated)<br/>+ failed check as reason"]
  P --> R["Result tiles + Apply to proposal"]
  Q --> R
```

---

## 7. Cartridge filter calculation flow

```mermaid
flowchart TD
  I["Inputs<br/>RO feed m3/hr, margin %,<br/>stages (1 or 2), length, slim/jumbo"] --> S1["Stage 1: 5 micron"]
  S1 --> N1["Elements = ceil(feed x margin / ideal flow per element)"]
  N1 --> H1["Housing = smallest slot count >= elements"]
  H1 --> Q1["Housing qty, elements per housing, total elements"]
  I --> ST{"Stages = 2?"}
  ST -- "No" --> CHK
  ST -- "Yes" --> S2["Stage 2: 1 micron<br/>same full flow, in series"]
  S2 --> N2["Elements = ceil(feed x margin / ideal flow per element)"]
  N2 --> H2["Housing = smallest slot count >= elements"]
  H2 --> Q2["Housing qty, elements per housing, total elements"]
  Q1 --> CHK
  Q2 --> CHK{"Cartridge quantity<br/>consistent with housing slots?"}
  CHK -- "No" --> W["Warning chip: fix quantity or housing"]
  CHK -- "Yes" --> OK["Apply to proposal sections 3 and 4"]
  W --> OK
```

---

## 8. PDF generation pipeline

```mermaid
flowchart LR
  D["Proposal data<br/>+ company theme"] --> H{"Hash unchanged<br/>since last render?"}
  H -- "Yes" --> CACHE["Use cached PDF"]
  H -- "No" --> P1["Pass 1: render document<br/>record page number per section"]
  P1 --> MAP["Section -> page map"]
  MAP --> P2["Pass 2: render again<br/>with filled table of contents"]
  P2 --> BLOB["PDF Blob"]
  BLOB --> PREV["Live preview"]
  BLOB --> DL["Download"]
  BLOB --> SNAP["Snapshot on Mark Sent"]
  subgraph Layout["Per-page layout"]
    CV["Cover (no header)"]
    TOC["Table of contents"]
    TECH["Technical sections<br/>header, spec blocks, watermark, footer"]
    COM["Commercial page<br/>price summary, terms, delivery"]
  end
  P1 -.uses.-> Layout
  P2 -.uses.-> Layout
```

---

## 9. Proposal status state machine

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Sent: Mark Sent<br/>(snapshot saved, locked)
  Sent --> FollowUp: follow-up date reached<br/>or manual
  FollowUp --> Sent: logged contact
  Sent --> Won: PO received
  FollowUp --> Won: PO received
  Sent --> Lost: client declines
  FollowUp --> Lost: client declines
  Sent --> OnHold: client pauses
  FollowUp --> OnHold
  OnHold --> FollowUp: resumed
  Sent --> Expired: validity passed
  FollowUp --> Expired: validity passed
  Sent --> Superseded: new revision created
  FollowUp --> Superseded: new revision created
  Won --> [*]
  Lost --> [*]
  Expired --> [*]
  Superseded --> [*]
```

---

## 10. Revision and duplicate flow

```mermaid
flowchart TD
  P["Existing proposal"] --> Q{"Action"}
  Q -- "Duplicate" --> D1["New proposal<br/>new ref, today's date, Draft"]
  D1 --> D2{"Keep old specs and prices<br/>or refresh from library?"}
  D2 -- "Keep" --> D3["Copy items as they are"]
  D2 -- "Refresh" --> D4["Reload specs from library,<br/>keep manual overrides optional"]
  D3 --> D5["Reset client / price if chosen"]
  D4 --> D5
  D5 --> OUT1["Draft ready to edit"]
  Q -- "Create revision" --> R1["Same base ref, rev + 1"]
  R1 --> R2["Previous revision -> Superseded"]
  R2 --> R3["Copy items, calcs, terms"]
  R3 --> OUT2["Draft Rev-NN ready to edit"]
```

---

## 11. Data model overview

```mermaid
erDiagram
  ORGANIZATIONS ||--o{ COMPANIES : has
  ORGANIZATIONS ||--o{ ORG_MEMBERS : has
  COMPANIES ||--o{ PROPOSALS : issues
  COMPANIES ||--o{ REF_COUNTERS : numbers
  CLIENTS ||--o{ CONTACTS : has
  CLIENTS ||--o{ SITES : has
  SITES ||--o{ WATER_ANALYSES : has
  CLIENTS ||--o{ ACTIVITIES : logs
  CLIENTS ||--o{ CLIENT_FILES : stores
  CLIENTS ||--o{ PROPOSALS : receives
  COMPONENT_CATEGORIES ||--o{ COMPONENTS : groups
  TEMPLATES ||--o{ TEMPLATE_ITEMS : lists
  COMPONENTS ||--o{ TEMPLATE_ITEMS : used_in
  PROPOSALS ||--o{ PROPOSAL_ITEMS : contains
  PROPOSALS ||--o{ PROPOSAL_CALCS : stores
  PROPOSALS ||--o{ PROPOSAL_SNAPSHOTS : keeps
  COMPONENTS ||--o{ PROPOSAL_ITEMS : copied_from
  MEDIA_CATALOG ||--o{ PROPOSAL_CALCS : used_by
  VESSEL_SIZES ||--o{ PROPOSAL_CALCS : used_by
  CARTRIDGE_TYPES ||--o{ PROPOSAL_CALCS : used_by
  HOUSING_TYPES ||--o{ PROPOSAL_CALCS : used_by
```

---

## 12. Deployment and CI flow

```mermaid
flowchart LR
  DEV["Developer / AI Studio export"] --> GH["GitHub repo"]
  GH --> CI["GitHub Actions CI<br/>typecheck, lint, unit tests, build"]
  CI -- "pass" --> VER["Vercel build and deploy"]
  CI -- "fail" --> FIX["Fix and push again"]
  VER --> LIVE["Live PWA URL"]
  LIVE --> INST["Users install from Chrome / Edge<br/>(Windows, Linux)"]
  LIVE -- "new version" --> UPD["Service worker prompts: Reload to update"]
  GH --> MIG["Supabase migrations<br/>(CLI or dashboard)"]
  MIG --> PG[("Supabase Postgres")]
  GH --> KA["Keep-alive workflow<br/>every 3 days: real read query"]
  KA --> PG
  GH -.optional.-> TAURI["Tauri build workflow<br/>.msi/.exe, .deb/.AppImage"]
```
