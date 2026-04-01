# IGPL Website — Investor Documents Build

## Context

This is a static HTML website for IG Petrochemicals Ltd (IGPL), deployed on Vercel at https://igpl-website.vercel.app. It uses Tailwind CDN, Montserrat + Inter fonts, and the brand colour #007C66 (teal). All pages follow the same nav/footer pattern as index.html.

The project already has:
- `admin.html` — document upload admin panel (password-protected, calls /api/upload and /api/manifest)
- `api/upload.js` — Vercel serverless function that uploads PDFs to Vercel Blob
- `api/manifest.js` — Vercel serverless function that lists all blobs
- `investor-library.html` — financial reports page (partially done)

## What to Build

### 1. Three public pages

#### A) `investor-library.html` — REPLACE the current file entirely

Page for: Financial Reports  
URL: /investor-library

Sections (top to bottom):
- Hero: dark overlay on investors-hero.webp, title "Financial Reports"
- Year tab bar (FY 2025-26, FY 2024-25, FY 2023-24, FY 2022-23, FY 2021-22, FY 2020-21) — sticky below nav
- Each year tab shows three card columns:
  1. Annual Report — single download card (big, prominent)
  2. Quarterly Results — up to 4 items (Q4 down to Q1)
  3. Investor Presentations — up to 4 items matching the quarters
- Cards are fetched dynamically from GET /api/manifest. If a blob exists for that slot, show a green download button + file size. If not, show a grey "Not yet available" state.
- Keep the existing NSE/BSE/Contact 3-card block from the current file
- Keep footer + nav identical to other pages

Blob paths for this page (use EXACT paths — the upload API whitelists these):
```
Annual Reports:
  docs/annual-reports/fy2526.pdf
  docs/annual-reports/fy2425.pdf
  docs/annual-reports/fy2324.pdf
  docs/annual-reports/fy2223.pdf
  docs/annual-reports/fy2122.pdf
  docs/annual-reports/fy2021.pdf

Quarterly Results:
  docs/earnings/q3fy2526.pdf  (Q3 = quarter ended 31 Dec)
  docs/earnings/q2fy2526.pdf  (Q2 = quarter ended 30 Sep)
  docs/earnings/q1fy2526.pdf  (Q1 = quarter ended 30 Jun)
  docs/earnings/q4fy2425.pdf
  docs/earnings/q3fy2425.pdf
  docs/earnings/q2fy2425.pdf
  docs/earnings/q1fy2425.pdf
  (same pattern back to fy2021)

Investor Presentations:
  docs/investor-presentations/q3fy2526-presentation.pdf
  docs/investor-presentations/q2fy2526-presentation.pdf
  docs/investor-presentations/q1fy2526-presentation.pdf
  docs/investor-presentations/q4fy2425-presentation.pdf
  (same pattern back to fy2021)
```

---

#### B) `governance.html` — NEW PAGE

Page for: Corporate Governance  
URL: /governance

Nav: add "Governance" link under Investors dropdown in ALL pages' nav

Sections:
1. Hero: dark overlay on boardroom.webp, title "Corporate Governance"
2. Three bento-style sections, each with a header and card grid:

**Board & Management** (left-accent teal bar heading style)
Card grid (3 across on desktop, 2 on tablet, 1 on mobile):
- MOA & Articles of Association
- Board Composition & Constitution of Committees
- Directors Familiarization Programme
- Familiarization Programme Policy
- Terms of Appointment — Independent Directors
- Directorship & Full-Time Positions
- Contact Details of KMP (Materiality)
- Code of Conduct — Directors & Senior Management
- Code of Practices for Fair Disclosure
- SEBI LODR Reg 46 Disclosure

**Policies** (same heading style)
Card grid:
- Dividend Distribution Policy
- Whistle Blower Policy
- Related Party Transaction Policy
- Nomination & Remuneration Policy
- Risk Management Policy
- POSH Policy
- Archival Policy
- Anti-Bribery Policy
- Equal Opportunity Policy
- Stakeholder Grievance Redressal Policy
- Stakeholders Engagement Policy
- Board Policy — Material Events
- Disclosure Reg 30 (SEBI LODR)

**AGM Outcomes**
Year-slotted list (not grid — these are just year labels + download):
- FY 2024-25
- FY 2023-24
- FY 2022-23
- FY 2021-22
- FY 2020-21
- FY 2019-20

Each card/item: shows PDF icon, document name, download button if blob exists (green), "Not available" if not. Fetch from /api/manifest on load.

Blob paths for governance (use EXACT paths):
```
Board & Management:
  docs/governance/moa-aoa.pdf
  docs/governance/constitution-of-committees.pdf
  docs/governance/directors-familiarization-programme.pdf
  docs/governance/familiarization-programme-policy.pdf
  docs/governance/terms-independent-directors.pdf
  docs/governance/directorship-full-time-positions.pdf
  docs/governance/kmp-contact-materiality.pdf
  docs/governance/code-of-conduct-directors.pdf
  docs/governance/code-fair-disclosure.pdf
  docs/governance/sebi-lodr-reg46.pdf

Policies:
  docs/policies/dividend-distribution-policy.pdf
  docs/policies/whistle-blower-policy.pdf
  docs/policies/related-party-transactions-policy.pdf
  docs/policies/nomination-remuneration-policy.pdf
  docs/policies/risk-management-policy.pdf
  docs/policies/posh-policy.pdf
  docs/policies/archival-policy.pdf
  docs/policies/anti-bribery-policy.pdf
  docs/policies/equal-opportunity-policy.pdf
  docs/policies/stakeholder-grievance-policy.pdf
  docs/policies/stakeholders-engagement-policy.pdf
  docs/policies/board-policy-material-events.pdf
  docs/policies/sebi-lodr-reg30.pdf

AGM Outcomes:
  docs/governance/agm-outcome-fy2425.pdf
  docs/governance/agm-outcome-fy2324.pdf
  docs/governance/agm-outcome-fy2223.pdf
  docs/governance/agm-outcome-fy2122.pdf
  docs/governance/agm-outcome-fy2021.pdf
  docs/governance/agm-outcome-fy2020.pdf
```

---

#### C) `filings.html` — NEW PAGE

Page for: Filings & Announcements  
URL: /filings

Nav: add "Filings & Announcements" link under Investors dropdown in ALL pages' nav

Sections:
1. Hero: dark overlay on steam-pipes.webp, title "Filings & Announcements"

2. **Corporate Announcements** — DYNAMIC FEED (top section, most prominent)
   - Fetches from GET /api/announcements (new endpoint — see section 3 below)
   - Renders as a dated list/feed, newest first
   - Each item shows: date, title, category badge (colour-coded: Earnings Call / Board Meeting / Disclosure / General), download PDF button + optional audio link (for MP3 earnings calls)
   - Filter tabs above: All / Earnings / Board Meeting / Disclosures / General
   - If no announcements yet: show a "No announcements published yet" empty state

3. **Subsidiary Financial Statements** — fixed slots, same fetch-from-manifest pattern
   Two sub-sections: "IGPL International Ltd." and "IGPL Charitable Foundation"
   
   Blob paths:
   ```
   docs/subsidiaries/igpl-international-fy2425.pdf
   docs/subsidiaries/igpl-international-fy2324.pdf
   docs/subsidiaries/igpl-international-fy2223.pdf
   docs/subsidiaries/igpl-international-fy2122.pdf
   docs/subsidiaries/igpl-international-fy2021.pdf
   docs/subsidiaries/igpl-charitable-foundation-fy2425.pdf
   docs/subsidiaries/igpl-charitable-foundation-fy2324.pdf
   docs/subsidiaries/igpl-charitable-foundation-fy2223.pdf
   ```

4. **Investor Service Forms** — fixed slots, always available for download
   Small card grid at bottom. These are SEBI standard forms — just fixed upload slots.
   
   Blob paths:
   ```
   docs/investor-forms/form-isr1.pdf
   docs/investor-forms/form-isr2.pdf
   docs/investor-forms/form-isr3.pdf
   docs/investor-forms/form-isr4.pdf
   docs/investor-forms/form-sh13.pdf
   docs/investor-forms/form-sh14.pdf
   ```
   Labels: Form ISR-1 (KYC Update), Form ISR-2 (Signature Mismatch), Form ISR-3 (Opt-out Nomination), Form ISR-4 (Demat Securities), Form SH-13 (Nomination), Form SH-14 (Change in Nomination)

---

### 2. New API endpoint: `api/announcements.js`

This handles the dynamic Corporate Announcements feed.

**GET /api/announcements** — returns list of announcements sorted by date desc
**POST /api/announcements** — creates a new announcement (requires ADMIN_PASSWORD in body)

Announcement data structure:
```json
{
  "id": "uuid-or-timestamp",
  "title": "Transcripts of Earnings Call for Q3 FY 2025-26",
  "date": "2026-02-10",
  "category": "earnings",  // earnings | board | disclosure | general
  "pdfPath": "docs/announcements/q3fy2526-transcript.pdf",  // optional
  "pdfUrl": "https://blob.vercel.com/...",  // resolved URL from blob
  "audioPath": "docs/announcements/q3fy2526-audio.mp3",  // optional
  "audioUrl": "https://blob.vercel.com/..."  // optional
}
```

Store the announcements index as a JSON file in Vercel Blob at `announcements/index.json`. On GET, fetch and return it. On POST, upload the PDF/MP3 to Blob, then update the index JSON.

The upload API also needs to accept `.mp3` files for the audio path (currently it only allows `.pdf`). Update `api/upload.js` to also allow mp3 for paths under `docs/announcements/`.

---

### 3. Updated `admin.html` — REPLACE entirely

Change to a **tabbed layout** with 3 tabs:

**Tab 1: Financial Reports**
Same sections as current admin but reorganised:
- Annual Reports (6 slots)
- Quarterly Results (tabbed by year: FY 2025-26 through FY 2020-21, 4 quarters each)
- Investor Presentations (same year tabs, 4 per year)

**Tab 2: Governance**
- Board & Management (10 slots matching governance.html)
- Policies (13 slots)
- AGM Outcomes (6 slots)

**Tab 3: Filings & Announcements**
- **Corporate Announcements — NEW PUBLISH PANEL** at top:
  - Title input
  - Date input
  - Category selector (Earnings Call / Board Meeting / SEBI Disclosure / General)
  - PDF upload (optional)
  - Audio/MP3 upload (optional)  
  - "Publish Announcement" button
  - Below: shows existing announcements list with delete option
- Subsidiary Financial Statements (8 slots)
- Investor Service Forms (6 slots)

Keep the password field, status dots, upload-on-select behaviour, progress bars, and manifest-based status checking from the existing admin.html.

---

### 4. Nav updates — ALL existing HTML pages

Add a dropdown under "Investors" in the nav that includes:
- Investor Relations → investors.html
- Financial Reports → investor-library.html
- Corporate Governance → governance.html
- Filings & Announcements → filings.html
- Investor Library → investor-library.html  (keep existing link)

The nav already has a dropdown pattern (`.nav-dropdown`, `.nav-parent`) in the existing pages — follow the exact same pattern.

Pages to update: index.html, about.html, products.html, pa.html, ma.html, ba.html, dep.html, applications.html, sustainability.html, investors.html, investor-library.html, manufacturing.html, csr.html, careers.html, contact.html, legal.html

---

### 5. Update `api/upload.js` whitelist

Add ALL new blob paths to the ALLOWED_PATHS Set:
- All governance paths (docs/governance/*, docs/policies/*)
- All subsidiaries paths (docs/subsidiaries/*)
- All investor forms paths (docs/investor-forms/*)
- All older quarterly results (back to fy2021)
- All older presentations (back to fy2021)
- Announcements: docs/announcements/*.pdf and docs/announcements/*.mp3

For announcements paths, since they're dynamic, allow any path matching `docs/announcements/` prefix rather than exact matches. Check with: `destPath.startsWith('docs/announcements/')` and only allow `.pdf` or `.mp3` extensions.

---

## Design Rules

- Match the existing visual style EXACTLY: Tailwind CDN 3.4.0, Montserrat headings, Inter body, #007C66 teal, #0F2B4F dark navy, white cards, #F8FAFC backgrounds
- Use the EXACT same nav HTML structure as index.html (copy it verbatim, just update active states)
- Use the EXACT same footer HTML as index.html (copy verbatim)
- Scroll reveal animations: class="reveal" on sections (already handled by igpl.js)
- Card hover: translateY(-4px) + box shadow (class="card-lift" pattern)
- Download button style: bg-[#007C66] text-white, hover bg-[#005E4D], Montserrat bold uppercase
- "Not available" state: grey, no cursor pointer, text "Not yet available"
- All pages: meta robots noindex is NOT needed (these are public pages). Only admin.html gets noindex.

## Technical Rules

- All JS must be vanilla (no frameworks). Keep it inline in `<script>` tags at bottom of body.
- Fetch /api/manifest once on page load, build a Map of pathname→blob, then use it to render all slots
- No node_modules imports in HTML pages — Tailwind via CDN only
- api/*.js files use ESM (export default) — Vercel compiles them
- The announcements index.json stored in Blob should be fetched via the @vercel/blob `head()` + `getDownloadUrl()` pattern, or alternatively use a well-known public URL if the blob is public

## File locations

Project root: /Users/arpandhanuka/igpl-website/

Key existing files to reference for style/nav/footer:
- /Users/arpandhanuka/igpl-website/index.html (nav + footer source of truth)
- /Users/arpandhanuka/igpl-website/investors.html (investor page style reference)
- /Users/arpandhanuka/igpl-website/admin.html (existing admin — replace entirely)
- /Users/arpandhanuka/igpl-website/api/upload.js (update whitelist)
- /Users/arpandhanuka/igpl-website/api/manifest.js (read-only reference)

## After building

1. Run: `cd /Users/arpandhanuka/igpl-website && git add -A && git commit -m "Add governance + filings pages, dynamic announcements, tabbed admin, nav updates" && vercel --prod --yes`
2. Report the deployment URL
