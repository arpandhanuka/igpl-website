# IGPL Corporate Website v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing IGPL website (`~/igpl-website/`) to the v2 spec — adding missing pages, upgrading all sections, and aligning every page to the IGPL "Crisp Authority" design system.

**Architecture:** Static HTML + Tailwind v3.4 CDN + Montserrat/Inter fonts. No build step. Each page is a self-contained `.html` file sharing the same nav/footer pattern. New pages are created; existing pages are rewritten in-place.

**Tech Stack:** HTML5, Tailwind v3.4 CDN (`https://cdn.tailwindcss.com/3.4.0`), Montserrat + Inter (Google Fonts), vanilla JS (Intersection Observer for scroll reveal, Fetch API for stock ticker). Server for local preview: `cd ~/igpl-website && python3 server.py` (runs on port 8000).

---

## Current State vs. v2 Target

| File | Status | Action |
|------|--------|--------|
| `index.html` | Exists (v1) | Rebuild — new sections: stat strip, bento grid, interactive value chain, applications preview, careers preview |
| `about.html` | Exists (v1) | Upgrade — new sections: stats band, vision/mission, core strengths, facility split |
| `products.html` | Exists (v1) | Upgrade — rewrite to 2x2 detailed cards, TDS CTA band |
| `sustainability.html` | Exists (v1) | Upgrade — add ESG pillars, specifics list |
| `investors.html` | Exists (v1) | Upgrade — KPI strip, snapshot bento, resource cards |
| `csr.html` | Exists (v1) | Upgrade — focus areas grid, impact cards |
| `careers.html` | Exists (v1) | Upgrade — role families grid, why-join split |
| `contact.html` | Exists (v1) | Upgrade — smart form with subject routing, two-location cards |
| `legal.html` | Exists (v1) | Upgrade — tabbed Privacy Policy + Terms layout |
| `manufacturing.html` | **MISSING** | Create new |
| `applications.html` | **MISSING** | Create new |
| `pa.html` | **MISSING** | Create new (PA detail page) |
| `ma.html` | **MISSING** | Create new (MA detail page) |
| `ba.html` | **MISSING** | Create new (BA detail page) |
| `dep.html` | **MISSING** | Create new (DEP detail page) |

## File Structure

```
~/igpl-website/
├── index.html          # Homepage — rebuild
├── about.html          # About — upgrade
├── manufacturing.html  # NEW — Manufacturing page
├── products.html       # Products overview — upgrade
├── pa.html             # NEW — PA detail page
├── ma.html             # NEW — MA detail page
├── ba.html             # NEW — BA detail page
├── dep.html            # NEW — DEP detail page
├── applications.html   # NEW — Applications page
├── contact.html        # Contact — upgrade
├── investors.html      # Investors — upgrade
├── sustainability.html # Sustainability — upgrade
├── csr.html            # CSR — upgrade
├── careers.html        # Careers — upgrade
├── legal.html          # Legal — upgrade
└── [images already present — no new image downloads]
```

## Design Rules (from igpl-website skill — MUST follow)

- **No marketing color overlays on hero images.** Do not use dark color washes or teal/navy fills over photos. H1 in white only. No subtitles in hero. If a specific photo has a bright area that makes H1 unreadable, use `text-shadow: 0 2px 8px rgba(0,0,0,0.5)` on the H1 only — not a full overlay.
- **Teal (#007C66) for buttons, links, accents ONLY** — never as section background.
- **No decorative large numbers** ("92", "270K" as text overlays).
- **Footer:** white background, dark text (#475569), 3px teal accent strip above.
- **Nav:** white, 3px teal bottom border, sticky. Center links: About, Products, Applications, Manufacturing, Sustainability, Investors, CSR, Careers. Right CTA: Contact (teal button).
- **Active nav item:** current page link gets `text-[#007C66]` and persistent `after:w-full` underline. Implemented via inline `aria-current="page"` on the matching `<a>` plus CSS: `.nav-link[aria-current="page"]::after { width: 100%; }` and `.nav-link[aria-current="page"] { color: #007C66; }`.
- **Hero pattern:** `<section class="relative overflow-hidden aspect-[21/9]">` (index only) with photo or video, H1 in white.
- **All images must be verified to exist in `~/igpl-website/` before referencing.** If the intended image is missing, use the nearest available alternative from the existing asset library. Never reference a non-existent file. Never leave an `<img>` with a broken src.
- **Stock price must use Fetch API with timestamp — never hardcoded.**
- **Every page must contain one primary CTA and one secondary CTA** relevant to the page audience: product pages → TDS/SDS + Contact Sales; investor pages → Annual Reports + Investor Contact; careers → View Openings + Send Resume; manufacturing/applications → Contact Commercial Team.
- **Copy direction:** prefer concrete over abstract. "Supplies approximately half of India's phthalic anhydride demand" is stronger than "foundational supplier to the value chain." The existing validated copy in index.html is already calibrated — do not overwrite validated phrases, but write new copy to the concrete standard.

## Shared Nav/Footer Template

Every page uses this exact nav and footer. Copy verbatim — do not invent variations.

### Nav
```html
<nav class="bg-white border-b-[3px] border-[#007C66] sticky top-0 z-[100]">
  <div class="max-w-[1280px] mx-auto px-6">
    <div class="flex items-center justify-between h-16">
      <a href="index.html"><img src="igpl-logo.png" alt="IGPL" class="h-10 w-auto"></a>
      <div class="hidden md:flex items-center gap-6">
        <a href="about.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151] hover:text-[#007C66] transition-colors nav-link">About</a>
        <a href="products.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151] hover:text-[#007C66] transition-colors nav-link">Products</a>
        <a href="applications.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151] hover:text-[#007C66] transition-colors nav-link">Applications</a>
        <a href="manufacturing.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151] hover:text-[#007C66] transition-colors nav-link">Manufacturing</a>
        <a href="sustainability.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151] hover:text-[#007C66] transition-colors nav-link">Sustainability</a>
        <a href="investors.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151] hover:text-[#007C66] transition-colors nav-link">Investors</a>
        <a href="csr.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151] hover:text-[#007C66] transition-colors nav-link">CSR</a>
        <a href="careers.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151] hover:text-[#007C66] transition-colors nav-link">Careers</a>
        <a href="contact.html" class="bg-[#007C66] text-white font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] px-4 py-2 rounded hover:bg-[#005E4D] transition-colors">Contact</a>
      </div>
      <button id="menu-toggle" class="md:hidden p-2 text-[#374151]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
  </div>
  <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-[#E5E7EB]">
    <div class="px-6 py-4 flex flex-col gap-4">
      <a href="about.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151]">About</a>
      <a href="products.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151]">Products</a>
      <a href="applications.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151]">Applications</a>
      <a href="manufacturing.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151]">Manufacturing</a>
      <a href="sustainability.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151]">Sustainability</a>
      <a href="investors.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151]">Investors</a>
      <a href="csr.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151]">CSR</a>
      <a href="careers.html" class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] text-[#374151]">Careers</a>
      <a href="contact.html" class="bg-[#007C66] text-white font-[Montserrat] font-bold text-xs uppercase tracking-[0.06em] px-4 py-2 rounded text-center">Contact</a>
    </div>
  </div>
</nav>
<div id="menu-backdrop" class="fixed inset-0 bg-black/30 z-[90] hidden" onclick="document.getElementById('mobile-menu').classList.add('hidden');document.getElementById('menu-backdrop').classList.add('hidden')"></div>
```

### Footer
```html
<footer class="bg-white border-t-[3px] border-[#007C66] pt-12 pb-8">
  <div class="max-w-[1280px] mx-auto px-6">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
      <div class="md:col-span-2">
        <img src="igpl-logo.png" alt="IGPL" class="h-10 w-auto mb-4">
        <p class="font-[Inter] text-sm text-[#475569] leading-relaxed max-w-xs">India's leading manufacturer of Phthalic Anhydride. Taloja, Maharashtra.</p>
        <p class="font-[Inter] text-xs text-[#94A3B8] mt-3">NSE: IGPL | BSE: 500199</p>
      </div>
      <div>
        <h4 class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.1em] text-[#0F172A] mb-4">Products</h4>
        <ul class="space-y-2">
          <li><a href="pa.html" class="font-[Inter] text-sm text-[#475569] hover:text-[#007C66]">Phthalic Anhydride</a></li>
          <li><a href="ma.html" class="font-[Inter] text-sm text-[#475569] hover:text-[#007C66]">Maleic Anhydride</a></li>
          <li><a href="ba.html" class="font-[Inter] text-sm text-[#475569] hover:text-[#007C66]">Benzoic Acid</a></li>
          <li><a href="dep.html" class="font-[Inter] text-sm text-[#475569] hover:text-[#007C66]">Diethyl Phthalate</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.1em] text-[#0F172A] mb-4">Company</h4>
        <ul class="space-y-2">
          <li><a href="about.html" class="font-[Inter] text-sm text-[#475569] hover:text-[#007C66]">About</a></li>
          <li><a href="manufacturing.html" class="font-[Inter] text-sm text-[#475569] hover:text-[#007C66]">Manufacturing</a></li>
          <li><a href="investors.html" class="font-[Inter] text-sm text-[#475569] hover:text-[#007C66]">Investors</a></li>
          <li><a href="sustainability.html" class="font-[Inter] text-sm text-[#475569] hover:text-[#007C66]">Sustainability</a></li>
          <li><a href="csr.html" class="font-[Inter] text-sm text-[#475569] hover:text-[#007C66]">CSR</a></li>
          <li><a href="careers.html" class="font-[Inter] text-sm text-[#475569] hover:text-[#007C66]">Careers</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-[Montserrat] font-bold text-xs uppercase tracking-[0.1em] text-[#0F172A] mb-4">Contact</h4>
        <p class="font-[Inter] text-sm text-[#475569]">401-404, Raheja Centre<br>214 Nariman Point<br>Mumbai 400021</p>
        <a href="tel:+912240586100" class="font-[Inter] text-sm text-[#475569] hover:text-[#007C66] mt-2 block">+91 22 4058 6100</a>
        <a href="mailto:igpl@igpetro.com" class="font-[Inter] text-sm text-[#475569] hover:text-[#007C66] mt-1 block">igpl@igpetro.com</a>
        <a href="https://www.linkedin.com/company/ig-petrochemicals" target="_blank" class="font-[Inter] text-sm text-[#007C66] hover:underline mt-2 block">LinkedIn</a>
      </div>
    </div>
    <div class="border-t border-[#E5E7EB] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="font-[Inter] text-xs text-[#94A3B8]">&copy; 2026 IG Petrochemicals Ltd. All rights reserved. CIN: L51496GA1988PLC000915</p>
      <div class="flex gap-6">
        <a href="legal.html#privacy" class="font-[Inter] text-xs text-[#94A3B8] hover:text-[#007C66]">Privacy Policy</a>
        <a href="legal.html#terms" class="font-[Inter] text-xs text-[#94A3B8] hover:text-[#007C66]">Terms of Use</a>
      </div>
    </div>
  </div>
</footer>
```

### Standard `<head>` block (paste into every page)
```html
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="igpl-logo.png" type="image/png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><!-- PAGE TITLE --></title>
  <meta name="description" content="<!-- META DESCRIPTION -->">
  <!-- Canonical -->
  <link rel="canonical" href="https://www.igpetro.com/<!-- PAGE-SLUG.html -->">
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="IG Petrochemicals Ltd.">
  <meta property="og:title" content="<!-- PAGE TITLE -->">
  <meta property="og:description" content="<!-- META DESCRIPTION -->">
  <meta property="og:image" content="https://www.igpetro.com/igpl-logo.png">
  <meta property="og:url" content="https://www.igpetro.com/<!-- PAGE-SLUG.html -->">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<!-- PAGE TITLE -->">
  <meta name="twitter:description" content="<!-- META DESCRIPTION -->">
  <!-- JSON-LD: Organization (homepage only — paste on index.html) -->
  <!-- <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IG Petrochemicals Ltd.",
    "alternateName": "IGPL",
    "url": "https://www.igpetro.com",
    "logo": "https://www.igpetro.com/igpl-logo.png",
    "contactPoint": { "@type": "ContactPoint", "telephone": "+91-22-4058-6100", "contactType": "customer service" },
    "address": { "@type": "PostalAddress", "streetAddress": "401-404, Raheja Centre, 214 Nariman Point", "addressLocality": "Mumbai", "postalCode": "400021", "addressCountry": "IN" }
  }
  </script> -->
  <!-- JSON-LD: Product (product detail pages only — fill in per product) -->
  <!-- <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "<!-- PRODUCT NAME -->",
    "description": "<!-- PRODUCT DESCRIPTION -->",
    "brand": { "@type": "Brand", "name": "IG Petrochemicals Ltd." },
    "manufacturer": { "@type": "Organization", "name": "IG Petrochemicals Ltd." }
  }
  </script> -->
  <script src="https://cdn.tailwindcss.com/3.4.0"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600&display=swap">
  <style>
    body { font-family: 'Inter', sans-serif; }
    h1, h2, h3, h4, .font-display { font-family: 'Montserrat', sans-serif; }
    .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-left { opacity: 0; transform: translateX(-40px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal-left.visible { opacity: 1; transform: translateX(0); }
    .reveal-right { opacity: 0; transform: translateX(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal-right.visible { opacity: 1; transform: translateX(0); }
    .stagger > * { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
    .stagger.visible > *:nth-child(1) { transition-delay: 0s; }
    .stagger.visible > *:nth-child(2) { transition-delay: 0.1s; }
    .stagger.visible > *:nth-child(3) { transition-delay: 0.2s; }
    .stagger.visible > *:nth-child(4) { transition-delay: 0.3s; }
    .stagger.visible > *:nth-child(5) { transition-delay: 0.35s; }
    .stagger.visible > *:nth-child(6) { transition-delay: 0.4s; }
    .stagger.visible > * { opacity: 1; transform: translateY(0); }
    .card-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .card-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,124,102,0.1); }
    .nav-link { position: relative; }
    .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #007C66; transition: width 0.3s ease; }
    .nav-link:hover::after, .nav-link[aria-current="page"]::after { width: 100%; }
    .nav-link[aria-current="page"] { color: #007C66; }
    /* Counter animation */
    .counter { transition: all 0.1s; }
  </style>
</head>
```

### Standard scroll-reveal + mobile menu JS (paste before `</body>` on every page)
```html
<script>
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.stagger').forEach(el => obs.observe(el));
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
    document.getElementById('menu-backdrop').classList.toggle('hidden');
  });
</script>
```

---

## Task 1: Rebuild index.html (Homepage v2)

**Files:** Modify `~/igpl-website/index.html`

**Sections to implement (in order):**
1. `<head>` — title: "IGPL | India's Leading Phthalic Anhydride Manufacturer", use standard block above
2. Nav (v2 — includes Applications + Manufacturing links)
3. **Hero** — video background (`hero-hq.webm` / `hero-hq.mp4`), `aspect-[21/9]` on desktop, no overlay. H1: "India's Leading Phthalic Anhydride Manufacturer". Two CTAs: "Explore Products" + "Investor Relations"
4. **Stat strip** — teal gradient band (`bg-gradient-to-r from-[#007C66] to-[#00A88A]`), 4 animated counters: 270,000 MTPA / 5 Plants / ~50% Market Share / 30+ Years. JS counter animates on scroll.
5. **Who We Are** — two-col: copy left, `pa-flakes.png` right. Headline: "A foundational supplier to India's chemical value chain"
6. **Interactive Value Chain** — horizontal connected nodes: O-Xylene → PA → [Plasticizers | Coatings & Resins | Specialty Chemicals] with branch labels MA, BA, DEP below PA node. Hover shows detail tooltip. Scroll-triggered reveal.
7. **Why IGPL** — bento grid 1+3: large card "Scale that supports reliability" + 3 small cards (Process-led manufacturing, Strategic logistics, Deep industry relevance). White cards, teal left border.
8. **Products preview** — 4-col card grid: PA (Core Product), MA (Byproduct), BA (Byproduct), DEP (Downstream). Images from existing files. Cards link to `pa.html`, `ma.html`, `ba.html`, `dep.html`.
9. **Applications preview** — 6-sector icon grid: PVC & Plasticizers, Paints & Coatings, Resins & Composites, Packaging, Fragrance & Personal Care, Specialty Chemicals. CTA → `applications.html`
10. **Manufacturing preview** — split layout: `dcs-control-room.png` left, copy right on dark `#1E293B` background. CTA → `manufacturing.html`
11. **Investor snapshot** — light gray band. "NSE: IGPL | BSE: 500199". CTA → `investors.html`. **Do NOT hardcode stock price.**
12. **Careers preview** — `team-outdoor-v2.png` + copy. CTA → `careers.html`
13. **Contact CTA band** — full-width teal band. "Need product, technical, or investor information?" Two buttons: Contact Us + Request TDS/SDS
14. Footer (v2)
15. Scripts

**Counter JS pattern:**
```javascript
function animateCounter(el, target, suffix, duration) {
  const start = performance.now();
  const isApprox = String(target).includes('~');
  const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * num);
    el.textContent = (isApprox ? '~' : '') + current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(update);
}
// Trigger on scroll
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = '1';
      const el = e.target.querySelector('.counter');
      animateCounter(el, e.target.dataset.target, e.target.dataset.suffix || '', 1500);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));
```

**Interactive value chain pattern:**
```html
<div class="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-0 reveal">
  <!-- OX node -->
  <div class="flex flex-col items-center">
    <div class="bg-[#F8FAFC] border-2 border-[#007C66] rounded-xl px-6 py-4 text-center min-w-[140px]">
      <div class="font-[Montserrat] font-bold text-sm text-[#0F172A]">O-Xylene</div>
      <div class="font-[Inter] text-xs text-[#94A3B8] mt-1">Feedstock</div>
    </div>
  </div>
  <!-- Arrow -->
  <div class="flex items-center justify-center w-10 h-16 lg:h-auto lg:w-auto lg:mt-6 flex-shrink-0">
    <svg class="rotate-90 lg:rotate-0" width="32" height="16" viewBox="0 0 32 16"><path d="M0 8h28M22 2l6 6-6 6" stroke="#007C66" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
  </div>
  <!-- PA node (highlighted) -->
  <div class="flex flex-col items-center relative group">
    <div class="bg-[#007C66] rounded-xl px-8 py-5 text-center min-w-[200px] shadow-lg cursor-pointer">
      <div class="font-[Montserrat] font-black text-base text-white">Phthalic Anhydride</div>
      <div class="font-[Inter] text-xs text-white/70 mt-1">270,000 MTPA</div>
    </div>
    <!-- Branch byproducts below PA -->
    <div class="flex gap-3 mt-3">
      <a href="ma.html" class="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-center hover:border-[#007C66] transition-colors">
        <div class="font-[Montserrat] font-bold text-xs text-[#0F172A]">Maleic Anhydride</div>
        <div class="font-[Inter] text-[10px] text-[#94A3B8]">Byproduct</div>
      </a>
      <a href="ba.html" class="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-center hover:border-[#007C66] transition-colors">
        <div class="font-[Montserrat] font-bold text-xs text-[#0F172A]">Benzoic Acid</div>
        <div class="font-[Inter] text-[10px] text-[#94A3B8]">Byproduct</div>
      </a>
      <a href="dep.html" class="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-center hover:border-[#007C66] transition-colors">
        <div class="font-[Montserrat] font-bold text-xs text-[#0F172A]">Diethyl Phthalate</div>
        <div class="font-[Inter] text-[10px] text-[#94A3B8]">Downstream</div>
      </a>
    </div>
  </div>
  <!-- Arrow -->
  <div class="flex items-center justify-center w-10 h-16 lg:h-auto lg:mt-6 flex-shrink-0">
    <svg class="rotate-90 lg:rotate-0" width="32" height="16" viewBox="0 0 32 16"><path d="M0 8h28M22 2l6 6-6 6" stroke="#007C66" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
  </div>
  <!-- Downstream nodes -->
  <div class="flex flex-col gap-3">
    <a href="applications.html" class="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-6 py-3 hover:border-[#007C66] transition-colors">
      <div class="font-[Montserrat] font-bold text-sm text-[#0F172A]">Plasticizers</div>
      <div class="font-[Inter] text-xs text-[#94A3B8]">Flexible PVC, cables, flooring</div>
    </a>
    <a href="applications.html" class="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-6 py-3 hover:border-[#007C66] transition-colors">
      <div class="font-[Montserrat] font-bold text-sm text-[#0F172A]">Coatings & Resins</div>
      <div class="font-[Inter] text-xs text-[#94A3B8]">Alkyd, UPR, composites</div>
    </a>
    <a href="applications.html" class="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-6 py-3 hover:border-[#007C66] transition-colors">
      <div class="font-[Montserrat] font-bold text-sm text-[#0F172A]">Specialty Chemicals</div>
      <div class="font-[Inter] text-xs text-[#94A3B8]">Packaging, fragrance, pharma</div>
    </a>
  </div>
</div>
```

- [ ] **Step 1: Write full index.html** following sections 1–15 above
- [ ] **Step 2: Verify in browser** — `cd ~/igpl-website && python3 server.py` → open `http://localhost:8000`
  - Stat counters animate on scroll
  - Value chain renders on mobile (flex-col) and desktop (flex-row)
  - Hero video plays, no overlay, H1 visible
  - All product card links point to `pa.html`, `ma.html`, etc.
- [ ] **Step 3: Commit**
  ```bash
  git -C ~/igpl-website add index.html
  git -C ~/igpl-website commit -m "feat: homepage v2 — stat strip, bento grid, interactive value chain"
  ```

---

## Task 2: Rebuild about.html (About v2)

**Files:** Modify `~/igpl-website/about.html`

**Sections:**
1. Head — title: "About IGPL | IG Petrochemicals Ltd.", meta as per spec
2. Nav (v2)
3. **Hero** — `plant-night.jpg` background, H1: "About IG Petrochemicals Ltd."
4. **Company overview** — two-col copy + `supply-chain-full.png` right
5. **Industry role** — copy section: "IGPL's role in the chemical value chain"
6. **Stats band** — 4 animated counters: 270,000 MTPA / 5 Plants / ~50% / 30+
7. **Vision/Mission** — side-by-side two cards with teal top border
8. **Core strengths** — 3-col card grid with inline SVG icons: Strategic location, Manufacturing scale, Process technology, Operational experience, Byproduct value realization, Established customer relevance
9. **Facility** — split layout: `plant-aerial.png` left (lg:col-span-2), copy right with mini stats: "50 km from JNPT", "Operations since 1992", "5 PA plants on one campus"
10. Footer, scripts

- [ ] **Step 1: Write full about.html**
- [ ] **Step 2: Verify** — check stats animate, vision/mission cards align, facility split works on mobile
- [ ] **Step 3: Commit**
  ```bash
  git -C ~/igpl-website add about.html
  git -C ~/igpl-website commit -m "feat: about page v2 — stats, vision/mission, core strengths"
  ```

---

## Task 3: Create manufacturing.html (NEW)

**Files:** Create `~/igpl-website/manufacturing.html`

**Page framing:** This page communicates **manufacturing capability as a business advantage**, not a facility tour. Every section should answer: why does this manufacturing setup make IGPL a more reliable and cost-competitive supplier? Scale concentration, proven technology, logistics proximity, and operating maturity are the four business arguments — the page must make all four explicit.

**Sections:**
1. Head — title: "Manufacturing | IGPL", meta as per spec
2. Nav (v2)
3. **Hero** — `plant-site.jpg`, H1: "Manufacturing"
4. **Site overview** — split: `plant-aerial.png` left, copy right. "Five dedicated PA plants on a single campus in Maharashtra's chemical corridor. 50 km from JNPT port. Integrated production allows unified logistics, shared utilities, and consistent quality management across all output."
5. **Technology** — copy + `dcs-control-room.png` right. "Von-Heyden Low Energy Process — Wacker Chemie's proven vapour-phase oxidation. PA purity ≥99.8%. Three decades of continuous optimisation and debottlenecking. Single-site concentration supports fast response to customer requirements."
6. **Strengths bento** — 2-col × 3-row grid of 6 cards, each framed as a supply advantage:
   - Integrated production (5 plants, one campus)
   - Byproduct recovery (MA, BA)
   - Energy efficiency (steam recovery)
   - Quality systems (consistent product)
   - Logistics advantage (50 km from JNPT)
   - 30+ year track record (since 1992)
7. **Photo gallery** — responsive masonry/grid: `plant-aerial.png`, `dcs-control-room.png`, `lab-scientist.png`, `steam-pipes.png`, `team-outdoor-v2.png`
8. Footer, scripts

- [ ] **Step 1: Write full manufacturing.html**
- [ ] **Step 2: Verify** — gallery responsive, bento grid correct, split layouts work on mobile
- [ ] **Step 3: Commit**
  ```bash
  git -C ~/igpl-website add manufacturing.html
  git -C ~/igpl-website commit -m "feat: new manufacturing page — site, technology, strengths, gallery"
  ```

---

## Task 4: Rebuild products.html (Products Overview v2)

**Files:** Modify `~/igpl-website/products.html`

**Sections:**
1. Head — title: "Products | IGPL"
2. Nav (v2)
3. **Hero** — `products-hero.png`, H1: "Products"
4. **Product grid** — 2×2 detailed cards. Each card: image, tag pill, product name, summary, specs line, "Learn More" link
   - PA: `pa-flakes.png`, "Core Product", href `pa.html`
   - MA: `ma-applications.png`, "Byproduct", href `ma.html`
   - BA: `ba-applications.png`, "Byproduct", href `ba.html`
   - DEP: `dep-applications-v2.png`, "Downstream", href `dep.html`
5. **TDS CTA band** — teal-bordered band. "Need technical documents?" Buttons: "Request TDS/SDS" → `contact.html#tds`, "Contact Sales" → `contact.html`
6. Footer, scripts

- [ ] **Step 1: Write full products.html**
- [ ] **Step 2: Verify** — 2×2 grid responsive (1-col mobile, 2-col desktop), all 4 product links correct
- [ ] **Step 3: Commit**
  ```bash
  git -C ~/igpl-website add products.html
  git -C ~/igpl-website commit -m "feat: products overview v2 — 2x2 grid with detail page links"
  ```

---

## Task 5: Create pa.html (Phthalic Anhydride detail)

**Files:** Create `~/igpl-website/pa.html`

**Sections:**
1. Head — title: "Phthalic Anhydride | IGPL", SEO meta as per spec. Include Product JSON-LD (see head template above). Fill in: name "Phthalic Anhydride", description from spec.
2. Nav (v2), with `aria-current="page"` on the Products link
3. **Breadcrumb** — one line below nav, above hero: `Home / Products / Phthalic Anhydride`. Link Home → `index.html`, Products → `products.html`. Styled: `font-[Inter] text-xs text-[#94A3B8]`, separator `/`.
4. **Hero** — `pa-applications-hero.png`, eyebrow "Core Product", H1: "Phthalic Anhydride"
4. **Overview** — two-col: copy left, KPI card right ("270,000 MTPA Production Capacity" in teal bordered card)
5. **Applications icon list** — 4 bullet points with inline SVG check icons:
   - Plasticizers for PVC cables, flooring, footwear, films
   - Alkyd resins for paints, coatings, and enamels
   - Unsaturated polyester resins for composites and building materials
   - Other downstream specialty intermediates
6. **Process** — copy + `steam-pipes.png`. "Von-Heyden Low Energy Process — catalytic oxidation of O-Xylene. Fixed-bed vanadium catalyst. PA purity ≥99.8%."
7. **Spec table** — clean table, alternating `#F8FAFC` rows:
   | Parameter | Specification |
   |-----------|---------------|
   | Appearance | Snow white free flowing flakes |
   | Color (molten) | 20 HU max. |
   | Solidification point | 130.8°C min. |
   | Purity | 99.8% min. |
   | Acid value | 753–763 mg KOH/g |
8. **Why source from IGPL** — 4-col proof grid: Scale & established operations / Consistent quality profile / Strategic logistics advantage / Strong relevance to major downstream sectors
9. **FAQ accordion** — 4 questions/answers:
   - What is Phthalic Anhydride used for?
   - What industries does IGPL serve with PA?
   - How can I request technical specifications or SDS?
   - Where is IGPL's production located?
10. **CTA band** — "Request technical or commercial information" → TDS/SDS + Contact Sales
11. Footer, scripts

- [ ] **Step 1: Write full pa.html**
- [ ] **Step 2: Verify** — FAQ accordion works (JS toggle), spec table renders correctly, KPI card visible on mobile
- [ ] **Step 3: Commit**
  ```bash
  git -C ~/igpl-website add pa.html
  git -C ~/igpl-website commit -m "feat: PA detail page — spec table, FAQ accordion, process section"
  ```

---

## Task 6: Create applications.html (NEW)

**Files:** Create `~/igpl-website/applications.html`

**Sections:**
1. Head — title: "Applications | IGPL Products in End-Use Industries"
2. Nav (v2)
3. **Hero** — `supply-chain-specialty.png`, H1: "Applications"
4. **Sector grid** — 6 cards, each with three explicit layers: **sector name → IGPL product(s) that feed it → what the product does in that sector**. Use existing images as visual anchors.
   - PVC and Plasticizers — `pa-applications.png` — PA + DEP → plasticisers for flexible PVC in pipes, cables, flooring, footwear
   - Paints and Coatings — `pa-production.png` — PA → alkyd resin systems for protective and decorative coatings
   - Resins and Composites — `steam-pipes.png` — PA + MA → UPR and related formulations for construction and automotive
   - Packaging — `dep-applications-v2.png` — DEP → plasticiser for food-grade and industrial film applications
   - Fragrance and Personal Care — `ba-applications.png` — BA + DEP → fragrance fixative, solvent in perfumes and cosmetics
   - Specialty Chemicals — `supply-chain-specialty.png` — MA → agrochemicals, water treatment, food additives
   Each card layout: image top, sector name (H3), IGPL product pills (small teal badges), use description (body text)
5. **Value chain context** — copy section: "Why application context matters"
6. **CTA band** — "Want to discuss your application?" → Contact Us
7. Footer, scripts

- [ ] **Step 1: Write full applications.html**
- [ ] **Step 2: Verify** — sector grid 3-col on desktop, 1-col mobile, images display correctly
- [ ] **Step 3: Commit**
  ```bash
  git -C ~/igpl-website add applications.html
  git -C ~/igpl-website commit -m "feat: new applications page — 6 sector cards with product linkage"
  ```

---

## Task 7: Rebuild contact.html (Contact v2)

**Files:** Modify `~/igpl-website/contact.html`

**Sections:**
1. Head — title: "Contact Us | IGPL"
2. Nav (v2)
3. **Hero** — `plant-site.jpg` (small), H1: "Contact Us"
4. **Smart form** — fields: Full Name, Email, Phone, Company Name, Subject (dropdown: Product Inquiry / TDS / SDS Request / Investor Relations / Careers / General Inquiry), Message. On submit: show success message (JS, no backend needed for static site). Add `id="tds"` anchor on the TDS/SDS subject option pre-selection (URL hash `#tds` should auto-select "TDS / SDS Request" in dropdown via JS).
5. **Two-location cards** — side-by-side:
   - Corporate Office: 401-404 Raheja Centre, 214 Nariman Point, Mumbai 400021 | +91 22 4058 6100 | igpl@igpetro.com
   - Manufacturing Facility: Taloja, Maharashtra | 50 km from JNPT port
6. Footer, scripts

**TDS pre-selection JS:**
```javascript
// Auto-select TDS/SDS if URL contains #tds
if (window.location.hash === '#tds') {
  const subjectSelect = document.getElementById('subject');
  if (subjectSelect) subjectSelect.value = 'tds-sds';
}
```

- [ ] **Step 1: Write full contact.html**
- [ ] **Step 2: Verify** — navigate to `contact.html#tds`, confirm dropdown auto-selects TDS/SDS; form success message shows on submit
- [ ] **Step 3: Commit**
  ```bash
  git -C ~/igpl-website add contact.html
  git -C ~/igpl-website commit -m "feat: contact v2 — smart form, subject routing, #tds auto-select"
  ```

---

## Task 8: Rebuild investors.html (Investors v2)

**Files:** Modify `~/igpl-website/investors.html`

**Sections:**
1. Head — title: "Investor Relations | IGPL"
2. Nav (v2)
3. **Hero** — `investors-hero.png`, H1: "Investor Relations"
4. **KPI strip** — 3 items: "NSE: IGPL | BSE: 500199", "270,000 MTPA PA Capacity", "~50% India Market Share"
5. **Snapshot** — copy + bento stat grid (4 stats same as homepage)
6. **Stock ticker** — teal-bordered card: "IGPL Stock Price" + price fetched from Yahoo Finance proxy API. Show "Loading..." initially. Include timestamp. **Fetch pattern:**
   ```javascript
   fetch('/api/stock')  // proxy in ~/igpl-website/api/ — check if exists, else use fallback text
     .then(r => r.json())
     .then(data => {
       document.getElementById('stock-price').textContent = '₹' + data.price;
       document.getElementById('stock-time').textContent = 'As of ' + new Date(data.timestamp).toLocaleString('en-IN');
     })
     .catch(() => {
       document.getElementById('stock-price').textContent = 'Live market data unavailable. Refer to NSE or BSE for latest quoted price.';
       document.getElementById('stock-time').textContent = '';
     });
   ```
7. **Resources grid** — cards (only show if content exists, hide "coming soon"):
   - Annual Reports → link to `docs/annual-reports/`
   - Corporate Governance → link to `docs/investor-info/`
   - Stock Exchange Filings → external NSE/BSE link
   - Investor Contact → `contact.html?subject=investor`
8. **IR contact card** — name/email/phone for investor queries
9. Footer, scripts

- [ ] **Step 1: Write full investors.html**
- [ ] **Step 2: Verify** — stock ticker shows fallback gracefully if API unavailable; no "coming soon" cards shown; annual reports link points to existing docs folder
- [ ] **Step 3: Commit**
  ```bash
  git -C ~/igpl-website add investors.html
  git -C ~/igpl-website commit -m "feat: investors v2 — KPI strip, stock ticker, resource cards"
  ```

---

## Task 9: Rebuild sustainability.html (Sustainability v2)

**Files:** Modify `~/igpl-website/sustainability.html`

**Sections:**
1. Head — title: "Sustainability | IGPL"
2. Nav (v2)
3. **Hero** — `sustainability-hero.png`, H1: "Sustainability"
4. **ESG pillars** — 3 cards side-by-side: Environmental, Social, Governance. Each with teal top border and specific body text from spec.
5. **Specifics list** — "What responsible manufacturing looks like": 4 bullet points (steam recovery, byproduct recovery, quality/safety systems, process discipline)
6. **Photo section** — `lab-scientist.png` full-width image with caption
7. Footer, scripts

- [ ] **Step 1: Write full sustainability.html**
- [ ] **Step 2: Verify** — 3 pillar cards responsive, photo section loads
- [ ] **Step 3: Commit**
  ```bash
  git -C ~/igpl-website add sustainability.html
  git -C ~/igpl-website commit -m "feat: sustainability v2 — ESG pillars, specifics list"
  ```

---

## Task 10: Rebuild csr.html (CSR v2)

**Files:** Modify `~/igpl-website/csr.html`

**Sections:**
1. Head — title: "CSR | IGPL"
2. Nav (v2)
3. **Hero** — `csr-education.jpg`, H1: "Corporate Social Responsibility"
4. **Focus areas** — 5-item grid with icons: Skill development, Education and literacy, Environment protection, Community health, Local development
5. **Impact cards** — 2–3 examples. Use **verified IGPL CSR content only**. If confirmed activities are not available, use truthful high-level thematic copy (e.g. "Supporting skill development in communities around the Taloja facility") without inventing program names, locations, metrics, or impact claims. IGPL is a listed company — fabricated CSR content carries reputational and regulatory risk.
6. Footer, scripts

- [ ] **Step 1: Write full csr.html**
- [ ] **Step 2: Verify** — focus areas grid renders, no "coming soon" placeholder visible
- [ ] **Step 3: Commit**
  ```bash
  git -C ~/igpl-website add csr.html
  git -C ~/igpl-website commit -m "feat: CSR v2 — focus areas grid, impact cards"
  ```

---

## Task 11: Rebuild careers.html (Careers v2)

**Files:** Modify `~/igpl-website/careers.html`

**Sections:**
1. Head — title: "Careers | IGPL"
2. Nav (v2)
3. **Hero** — `careers-team.jpg`, H1: "Careers"
4. **Why join** — split: copy left, `team-outdoor-v2.png` right. Copy must be specific, not generic HR language. Include: safety-first operating culture at a large-scale plant, exposure to the full manufacturing system (production, maintenance, quality, logistics in one location), and the professional credibility of working at India's leading PA producer.
5. **Role families grid** — 6 cards: Plant operations / Process and production / Maintenance and engineering / Quality and laboratory / Commercial and supply chain / Finance, HR, and corporate
6. **CTA section** — "Interested in joining us?" Buttons: View Opportunities (anchor to #openings), Send Your Resume → `contact.html`
7. **Openings section** — `id="openings"`, note "Check back for current openings" or list role if known. Do NOT show fake listings.
8. Footer, scripts

- [ ] **Step 1: Write full careers.html**
- [ ] **Step 2: Verify** — role families 3-col → 1-col mobile, CTA links work
- [ ] **Step 3: Commit**
  ```bash
  git -C ~/igpl-website add careers.html
  git -C ~/igpl-website commit -m "feat: careers v2 — role families grid, why-join split"
  ```

---

## Task 12: Create ma.html, ba.html, dep.html (Secondary product pages)

**Files:** Create `~/igpl-website/ma.html`, `~/igpl-website/ba.html`, `~/igpl-website/dep.html`

Each follows the same pattern as pa.html. Structure per product:

### ma.html — Maleic Anhydride
- Hero: `ma-applications.png`, eyebrow "Byproduct", H1: "Maleic Anhydride"
- Overview: "Recovered from PA process wash water. Used in resins, lubricants, agrochemicals, food additives, and water treatment." CAS 108-31-6
- Applications: Unsaturated polyester resins / Agricultural chemicals / Food additives (antioxidant) / Water treatment chemicals / Lubricant additives
- FAQ: 3 questions about MA use, sourcing, specs

### ba.html — Benzoic Acid
- Hero: `ba-applications.png`, eyebrow "Byproduct", H1: "Benzoic Acid"
- Overview: "Technical grade Benzoic Acid recovered from IGPL's PA production process." CAS 65-85-0
- Applications: Perfumes and fragrances / Dyes and pigments / Paints and coatings / Plastics and rubber / Chemical intermediates
- FAQ: 3 questions

### dep.html — Diethyl Phthalate
- Hero: `dep-applications-v2.png`, eyebrow "Downstream", H1: "Diethyl Phthalate"
- Overview: "Plasticizer grade DEP, downstream value addition from PA. CAS 84-66-2"
- Applications: PVC and plastic applications / Personal care and cosmetics / Pharmaceutical packaging / Fragrance fixative / Film coatings
- FAQ: 3 questions

All three pages: include breadcrumb (`Home / Products / [Product Name]`), Product JSON-LD in head, `aria-current="page"` on Products nav link, CTA band → TDS/SDS + Contact Sales.

- [ ] **Step 1: Write ma.html**
- [ ] **Step 2: Write ba.html**
- [ ] **Step 3: Write dep.html**
- [ ] **Step 4: Verify all three** — hero images load, CTA links correct, FAQ toggles work
- [ ] **Step 5: Commit**
  ```bash
  git -C ~/igpl-website add ma.html ba.html dep.html
  git -C ~/igpl-website commit -m "feat: secondary product pages — MA, BA, DEP detail pages"
  ```

---

## Task 13: Rebuild legal.html (Legal v2)

**Files:** Modify `~/igpl-website/legal.html`

**Sections:**
1. Head — title: "Legal | IGPL"
2. Nav (v2)
3. **Hero** — `plant-site.jpg` (small), H1: "Legal"
4. **Tabbed layout** — two tabs: "Privacy Policy" (id="privacy") and "Terms of Use" (id="terms"). JS toggles visibility. URL hash `#privacy` / `#terms` activates correct tab.
5. **Privacy Policy content** — standard data collection disclosure appropriate for an Indian listed company's corporate website (contact form data, cookies, analytics, no sale of personal data)
6. **Terms of Use content** — standard terms (information accuracy, no investment advice, intellectual property, governing law India)
7. Footer, scripts

**Tab JS:**
```javascript
function showTab(tabId) {
  ['privacy','terms'].forEach(id => {
    document.getElementById('tab-' + id).classList.toggle('hidden', id !== tabId);
    document.getElementById('btn-' + id).classList.toggle('border-b-2', id === tabId);
    document.getElementById('btn-' + id).classList.toggle('border-[#007C66]', id === tabId);
  });
}
const hash = window.location.hash.replace('#','') || 'privacy';
showTab(['privacy','terms'].includes(hash) ? hash : 'privacy');
document.getElementById('btn-privacy').onclick = () => showTab('privacy');
document.getElementById('btn-terms').onclick = () => showTab('terms');
```

- [ ] **Step 1: Write full legal.html**
- [ ] **Step 2: Verify** — tabs switch correctly, `legal.html#terms` opens on Terms tab
- [ ] **Step 3: Commit**
  ```bash
  git -C ~/igpl-website add legal.html
  git -C ~/igpl-website commit -m "feat: legal v2 — tabbed Privacy Policy + Terms of Use"
  ```

---

## Task 14: Final verification pass

- [ ] **Step 1: Check all nav links work** across all 15 pages (no 404s)
  ```bash
  cd ~/igpl-website && python3 -c "
  import re, os
  pages = [f for f in os.listdir('.') if f.endswith('.html') and f != 'admin.html']
  links = set()
  for p in pages:
      links.update(re.findall(r'href=\"([^\"#?]+\.html)', open(p).read()))
  missing = [l for l in links if not os.path.exists(l)]
  print('Missing:', missing or 'None')
  "
  ```
- [ ] **Step 2: Mobile check** — open DevTools → iPhone 14 (390px) on index.html, pa.html, investors.html
- [ ] **Step 3: Footer phone number** — verify all pages use `+91 22 4058 6100` (no redacted `****`)
- [ ] **Step 4: No hardcoded stock prices** — grep for ₹ outside of stock ticker fetch result
  ```bash
  grep -r "₹[0-9]" ~/igpl-website/*.html | grep -v stock
  ```
- [ ] **Step 5: Final commit**
  ```bash
  git -C ~/igpl-website add -A
  git -C ~/igpl-website commit -m "chore: v2 final verification pass — all 15 pages linked and verified"
  ```

---

## Execution Checklist

| Task | Page | Status |
|------|------|--------|
| 1 | index.html | ⬜ |
| 2 | about.html | ⬜ |
| 3 | manufacturing.html (NEW) | ⬜ |
| 4 | products.html | ⬜ |
| 5 | pa.html (NEW) | ⬜ |
| 6 | applications.html (NEW) | ⬜ |
| 7 | contact.html | ⬜ |
| 8 | investors.html | ⬜ |
| 9 | sustainability.html | ⬜ |
| 10 | csr.html | ⬜ |
| 11 | careers.html | ⬜ |
| 12 | ma.html / ba.html / dep.html (NEW ×3) | ⬜ |
| 13 | legal.html | ⬜ |
| 14 | Final verification | ⬜ |
