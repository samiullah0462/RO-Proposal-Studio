# RO Proposal Studio

> **Engineering Proposal Builder & Sizing Calculation Studio for Reverse Osmosis (RO) & Water-Treatment Plants.**

RO Proposal Studio is an offline-capable, client-side web application designed for proposal and sales engineers. It replaces tedious, error-prone manual formatting in MS Word and Excel with an automated, pure-math calculation engine and structured technical proposal generator.

---

## 🚀 Key Capabilities

1. **Pure Engineering Sizing Calculators (`/src/domain`)**:
   - **Multimedia Filter (MMF)**:
     - Instantaneous Filtration Rate ($\text{IFR} = Q \times (1 + \text{margin}) \times 24 / \text{serviceH}$).
     - Filtration Area ($\text{Area} = \text{IFR} / \text{velocity}$).
     - Calculated diameter ($\varnothing = \sqrt{4 \times \text{Area} / \pi}$) and automatic standard vessel matching (8" to 63").
     - Multi-layer media bed weight computations ($\text{Area} \times \text{depth} \times \text{bulk density}$).
     - Shell height freeboard check ($\ge 40\%$).
     - FRP vs. Mild Steel (MS) decision rule engine with reasoning.
   - **Cartridge Filters & Housings**:
     - Ideal flow ratings for 10", 20", 30", 40" slim and jumbo elements at 5 µm and 1 µm.
     - Element count calculation and housing slot consistency validation.
   - **RO Flow Chain & Balance**:
     - Automatic conversion across GPD, m³/hr, and GPM.
     - Permeate / brine balance, salt rejection %, and membrane element quantity estimation.
   - **Commercial & Pricing Engine**:
     - Strict 100% payment terms reconciliation where the final term absorbs rounding remainders.
     - English currency words generator and revision suffixing (`Rev-01`, `Rev-02`).

2. **Offline-First Local Storage (Dexie v4 IndexedDB)**:
   - All proposals, clients, plant templates, library components, and rule tables are persisted directly in the browser's IndexedDB.
   - Works 100% offline with zero cloud or backend dependencies.
   - Built-in full JSON backup export and restore.

3. **Client & Quotation Management**:
   - Manage client records with attention persons, sites, and contact details.
   - Standard reference numbering pattern: `{BRAND}/PRO/{YY}/{SEQ:4}` (e.g. `PS/PRO/26/0646`).
   - Revision tracking and status tracking (Draft $\rightarrow$ Sent $\rightarrow$ Won $\rightarrow$ Lost).

4. **Component Library & Plant Templates**:
   - Master technical library of pumps, membranes, vessels, dosing tanks, and instruments.
   - Pre-configured with the **10,000 GPD BWRO Plant (Semi-Automatic)** 15-section package.

5. **Design System & Bundled Offline Fonts**:
   - Tailwind CSS with PAKSAFE brand color tokens (`#1F3A5F`, `#2E75B6`, `#5B9BD5`, `#44546A`).
   - Locally bundled Inter font files (no external Google Fonts CDN calls).
   - Instant Dark / Light theme toggle with `localStorage` persistence.

---

## 📂 Repository Layout (TRD Section 3)

```
/
├── public/               # Static assets
├── src/
│   ├── app/              # Routing, AppShell layout & navigation
│   │   ├── AppShell.tsx
│   │   └── routes.tsx
│   ├── data/             # Local database schema & initial rule seeds
│   │   └── db.ts         # Dexie v4 IndexedDB configuration
│   ├── domain/           # Pure TypeScript domain logic (NO React / storage imports)
│   │   ├── units.ts      # Unit conversions (GPD, m³/hr, GPM, mm, inches)
│   │   ├── ro.ts         # RO hydraulic flow chain & balance
│   │   ├── multimedia.ts # MMF vessel sizing, velocities, & media weights
│   │   ├── cartridge.ts  # Cartridge element & housing selection
│   │   ├── rules.ts      # FRP vs. Mild Steel material decision rules
│   │   ├── pricing.ts    # Contract pricing, tax, & payment split integrity
│   │   ├── refnumber.ts  # Reference number formatting & revision handling
│   │   └── domain.test.ts# Vitest pure domain test suite
│   ├── features/         # Application modules
│   │   ├── calculators/  # Standalone interactive engineering calculators
│   │   ├── clients/      # Client directory & site management
│   │   ├── dashboard/    # Overview & Domain Self-Test runner
│   │   ├── library/      # Component catalog & spec editor
│   │   ├── proposals/    # Proposal generator, outline editor & status
│   │   ├── settings/     # Company branding & editable rule tables
│   │   └── templates/    # 15-section plant assemblies
│   ├── ui/               # Shared UI components (EmptyState, etc.)
│   ├── App.tsx
│   ├── index.css         # Theme tokens & bundled Inter font imports
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Pure Domain Test Suite
```bash
npm test
```
Runs 7 comprehensive Vitest benchmarks verifying all calculations against Excel sheets and BWRO sample data.

### 4. Build for Production
```bash
npm run build
```
Generates a static SPA in `dist/` ready to be served by any static host (Vercel, GitHub Pages, Netlify, or local offline file server).

---

## 🧪 Benchmark Verification Cases

The calculation engine in `/src/domain` is strictly tested against historical reference cases:

| Test Case | Description | Expected | Verified |
|---|---|---|---|
| **Case 1 (Excel MMF)** | $Q = 6\,\text{m}^3/\text{hr}$, service $23.5\,\text{h}$, velocity $16\,\text{m/hr}$ | $\text{IFR} = 6.128\,\text{m}^3/\text{hr}$, $A = 0.383\,\text{m}^2, \varnothing \approx 698\,\text{mm}$ (700mm chosen) | ✅ Passed |
| **Case 2 (Excel Media)** | Media weights for $700\,\text{mm}$ vessel | Gravel 192 kg, Sand 317 kg, Anthracite 25 kg, Carbon 20 kg | ✅ Passed |
| **Case 3 (10k GPD RO)** | 10,000 GPD feed in 16" vessel | Flow = $1.577\,\text{m}^3/\text{hr}$; velocity $\approx 12.4\,\text{m/hr}$ | ✅ Passed |
| **Case 4 (Cartridge)** | $1.58\,\text{m}^3/\text{hr}$ feed, $20\%$ margin, 20" slim element | $1.896\,\text{m}^3/\text{hr}$ design flow $\rightarrow 1$ element | ✅ Passed |
| **Case 5 (Commercial)** | 75% / 15% / 10% payment split of PKR 735,000 | 551,250 + 110,250 + 73,500 = 735,000 exact sum | ✅ Passed |

---

## 📄 License
Apache-2.0
