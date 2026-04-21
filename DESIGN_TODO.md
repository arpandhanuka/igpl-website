# IGPL Website — Design Critique Follow-ups

Things that still need a human to handle. The programmatic fixes from the critique have been made and are summarized at the bottom.

---

## 1. Replace AI-generated hero imagery (highest impact)

The Products, Investors, and Sustainability hero images are clearly AI-generated — fake chemical labels on glass jars, holographic boardroom charts, fabricated worker signage. For a real 30-year industrial company with actual plants in Taloja, authenticity is a trust signal. Replace each of the following with real photography at ~1920×1080 (or better) and save over the existing filenames so no code changes are needed:

| File to replace | Used by | What to shoot |
|---|---|---|
| `products-hero.webp` | `products.html` hero | Macro of PA flakes, bagged product on a pallet, or a real filler/packing line |
| `investors-hero.webp` | `investors.html` hero | Real boardroom photo, plant exec portrait, or a clean shot of the Taloja campus from the ground |
| `sustainability-hero.webp` | `sustainability.html` hero | Real operator at the ETP/MEE, a UF/RO skid, or the stack monitoring gallery |
| `boardroom.webp` | (currently referenced in investors flow) | Real IGPL boardroom or a governance meeting |
| `csr-classroom.webp` | `csr.html` | Real CSR classroom photo from an IGPL-funded school |
| `generated-content-photos/` folder (all) | Scattered use | Review each one; replace with real plant / product photos |
| `generated-hero-photos/` folder (all) | Scattered use | Same |
| `generated-product-photos/pa/ma/ba/dep-product-photo.webp` | Homepage + Products | Real photos of IGPL PA flakes, MA/BA flakes, DEP liquid sample — a small photo booth at the QC lab would do it |

A single day with a photographer at Taloja can cover all of these.

## 2. Full color-contrast audit (#94A3B8 usages)

The automated audit flagged ~137 instances of `text-[#94A3B8]` that MAY be on light backgrounds across `about.html`, `contact.html`, `ba.html`, `pa.html`, `ma.html`, `dep.html`, and others. `#94A3B8` on white = 2.56:1 (fails WCAG AA). However the color is also used on dark sections (stats band, dark hero blocks) where it's fine. A mass swap would fix one and break the other, so this needs a contextual review.

**Recommended approach:** introduce a second token in `design-system.css`:
```css
--igpl-text-muted-light: #64748B;   /* 4.74:1 on white — AA passing */
--igpl-text-muted-dark:  #94A3B8;   /* 5.8:1 on #1E293B — already used */
```
Then review each `text-[#94A3B8]` instance, and swap to `text-[#64748B]` where the surrounding section bg is white or `#F8FAFC`. Start with the files most likely to have the issue: `contact.html`, `about.html`, `legal.html`.

## 3. Number formatting (international vs. lakh)

The site uses `270,000 MTPA` consistently across main pages (good). The automated counter on homepage hero uses `toLocaleString('en-IN')` which produces the Indian `2,70,000` format — this is set in `js/igpl.js` line ~41. Decide on ONE format and make both match:
- **Option A (international):** change `toLocaleString('en-IN')` → `toLocaleString('en-US')` in `js/igpl.js`
- **Option B (Indian):** change hardcoded `270,000` everywhere → `2,70,000` (34 instances across 8 files)

Most B2B buyers outside India expect international format, and SEO favors it. Recommend Option A.

## 4. CTA copy review

All desktop and mobile nav "Contact" CTAs were renamed to "Request Quote" (see summary below). Consider reviewing these with a sales lead to confirm it's the right top-of-funnel primary action vs. alternatives like "Request TDS", "Talk to Sales", or "Get a Sample". The contact page form may need to surface TDS/SDS/sample-request as distinct options.

## 5. Housekeeping: remove `.bak` files

Running `sed -i.bak` to do bulk edits left one `.bak` backup for every HTML file. `*.bak` has been added to `.gitignore` but the files still exist on disk. Delete them when convenient:
```bash
cd /path/to/igpl-website
rm -f *.bak
```

## 6. Product-level hero imagery

`pa.html`, `ma.html`, `ba.html`, `dep.html` each have their own hero. Audit these for the same AI-image authenticity issue once the main 3 are replaced.

## 7. Verify mobile accordion pattern across full site

The mobile menu's Products and Investors sub-items are now collapsed into accordions via `js/igpl.js`. Verify visually on:
- Real iOS Safari (not just Chrome DevTools device mode)
- Real Android Chrome
- Check the chevron rotation and expand animation feel right

## 8. Consider a second primary CTA for investors

B2B buyers click "Request Quote" but investor-audience visitors may want "Download Annual Report" or "Investor Deck" as their equivalent top-line action. Consider adding a secondary nav entry or differentiating the CTA on `investors.html` / `filings.html`.

---

# Done Programmatically (summary of what was fixed)

| # | Fix | Files touched |
|---|---|---|
| 1 | Desktop nav breakpoint raised from `lg:` (1024px) to `xl:` (1280px) so laptops show the horizontal nav | all 18 HTML pages |
| 2 | Mobile hamburger button breakpoint matched: `xl:hidden` | all 18 HTML pages |
| 3 | Mobile menu becomes a full-viewport fixed overlay (below the 72px nav) so hero CTAs can't bleed through | `css/design-system.css` |
| 4 | Mobile menu: body scroll locks while open; Escape closes; tapping a link closes | `js/igpl.js` |
| 5 | Mobile menu: Products + Investors sub-items are now collapsed behind tap-to-expand accordions with rotating chevrons | `js/igpl.js` + `css/design-system.css` |
| 6 | Primary nav CTA renamed `Contact` → `Request Quote` (desktop + mobile) — sharpens the top-of-funnel action for B2B buyers | all 18 HTML pages |
| 7 | Sustainability page breadcrumb separator changed from `>` (chevron SVG) to `/` (text) to match all other pages | `sustainability.html` |
| 8 | Products hero overlay changed from flat 70% dark to a directional gradient (92% → 55%, left→right) so "A Complete Chemical Portfolio" H1 wins the first 2 seconds over the jar imagery | `products.html` |
| 9 | Homepage heading order: 12 orphan `<h4>` items under "From Feedstock to End Use" and "A Complete Chemical Value Chain" promoted to `<h3>` for cleaner screen-reader navigation | `index.html` |
| 10 | Homepage hero height reduced from `100vh min 600px max 1000px` to `clamp(560px, 82vh, 780px)` so the value-prop row peeks above the fold on laptops | `index.html` |
| 11 | `.gitignore` now ignores `*.bak` | `.gitignore` |

## False-positive corrections from the original critique

- **Alt text**: re-audited — all 10 homepage images are correctly tagged. The 2 "missing" alts have `alt="" aria-hidden="true"`, which is the proper practice for purely decorative background images. No site-wide alt-text issues found.
- **#00A88A contrast**: only 4 inline-text usages across the whole site, all are eyebrow labels on dark hero backgrounds where contrast is ~4.6:1 (passes AA). No swap needed.
