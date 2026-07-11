// api/upload.js — Vercel Blob client-upload token handler
// Request 1: browser POSTs blob.generate-client-token → returns signed clientToken
// Request 2: Browser uploads directly to Vercel Blob with the signed token

import { handleUpload } from '@vercel/blob/client';
import { del } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

const ALLOWED_PATHS = new Set([
  // Annual Reports
  'docs/annual-reports/fy2526.pdf','docs/annual-reports/fy2425.pdf',
  'docs/annual-reports/fy2324.pdf','docs/annual-reports/fy2223.pdf',
  'docs/annual-reports/fy2122.pdf','docs/annual-reports/fy2021.pdf',
  // Quarterly Results
  'docs/earnings/q4fy2526.pdf','docs/earnings/q3fy2526.pdf','docs/earnings/q2fy2526.pdf','docs/earnings/q1fy2526.pdf',
  'docs/earnings/q4fy2425.pdf','docs/earnings/q3fy2425.pdf','docs/earnings/q2fy2425.pdf','docs/earnings/q1fy2425.pdf',
  'docs/earnings/q4fy2324.pdf','docs/earnings/q3fy2324.pdf','docs/earnings/q2fy2324.pdf','docs/earnings/q1fy2324.pdf',
  'docs/earnings/q4fy2223.pdf','docs/earnings/q3fy2223.pdf','docs/earnings/q2fy2223.pdf','docs/earnings/q1fy2223.pdf',
  'docs/earnings/q4fy2122.pdf','docs/earnings/q3fy2122.pdf','docs/earnings/q2fy2122.pdf','docs/earnings/q1fy2122.pdf',
  'docs/earnings/q4fy2021.pdf','docs/earnings/q3fy2021.pdf','docs/earnings/q2fy2021.pdf','docs/earnings/q1fy2021.pdf',
  // Investor Presentations
  'docs/investor-presentations/q4fy2526-presentation.pdf','docs/investor-presentations/q3fy2526-presentation.pdf','docs/investor-presentations/q2fy2526-presentation.pdf','docs/investor-presentations/q1fy2526-presentation.pdf',
  'docs/investor-presentations/q4fy2425-presentation.pdf','docs/investor-presentations/q3fy2425-presentation.pdf','docs/investor-presentations/q2fy2425-presentation.pdf','docs/investor-presentations/q1fy2425-presentation.pdf',
  'docs/investor-presentations/q4fy2324-presentation.pdf','docs/investor-presentations/q3fy2324-presentation.pdf','docs/investor-presentations/q2fy2324-presentation.pdf','docs/investor-presentations/q1fy2324-presentation.pdf',
  'docs/investor-presentations/q4fy2223-presentation.pdf','docs/investor-presentations/q3fy2223-presentation.pdf','docs/investor-presentations/q2fy2223-presentation.pdf','docs/investor-presentations/q1fy2223-presentation.pdf',
  'docs/investor-presentations/q4fy2122-presentation.pdf','docs/investor-presentations/q3fy2122-presentation.pdf','docs/investor-presentations/q2fy2122-presentation.pdf','docs/investor-presentations/q1fy2122-presentation.pdf',
  'docs/investor-presentations/q4fy2021-presentation.pdf','docs/investor-presentations/q3fy2021-presentation.pdf','docs/investor-presentations/q2fy2021-presentation.pdf','docs/investor-presentations/q1fy2021-presentation.pdf',
  // Governance — Board & Management
  'docs/governance/moa-aoa.pdf','docs/governance/constitution-of-committees.pdf',
  'docs/governance/directors-familiarization-programme.pdf','docs/governance/familiarization-programme-policy.pdf',
  'docs/governance/terms-independent-directors.pdf','docs/governance/directorship-full-time-positions.pdf',
  'docs/governance/kmp-contact-materiality.pdf','docs/governance/code-of-conduct-directors.pdf',
  'docs/governance/code-fair-disclosure.pdf','docs/governance/sebi-lodr-reg46.pdf',
  // Governance — AGM Outcomes
  'docs/governance/agm-outcome-fy2425.pdf','docs/governance/agm-outcome-fy2324.pdf',
  'docs/governance/agm-outcome-fy2223.pdf','docs/governance/agm-outcome-fy2122.pdf',
  'docs/governance/agm-outcome-fy2021.pdf','docs/governance/agm-outcome-fy2020.pdf',
  // Policies
  'docs/policies/dividend-distribution-policy.pdf','docs/policies/whistle-blower-policy.pdf',
  'docs/policies/related-party-transactions-policy.pdf','docs/policies/nomination-remuneration-policy.pdf',
  'docs/policies/risk-management-policy.pdf','docs/policies/posh-policy.pdf',
  'docs/policies/archival-policy.pdf','docs/policies/anti-bribery-policy.pdf',
  'docs/policies/equal-opportunity-policy.pdf','docs/policies/stakeholder-grievance-policy.pdf',
  'docs/policies/stakeholders-engagement-policy.pdf','docs/policies/board-policy-material-events.pdf',
  'docs/policies/sebi-lodr-reg30.pdf','docs/policies/material-subsidiaries-policy.pdf',
  // Subsidiaries
  'docs/subsidiaries/igpl-international-fy2425.pdf','docs/subsidiaries/igpl-international-fy2324.pdf',
  'docs/subsidiaries/igpl-international-fy2223.pdf','docs/subsidiaries/igpl-international-fy2122.pdf',
  'docs/subsidiaries/igpl-international-fy2021.pdf',
  'docs/subsidiaries/igpl-charitable-foundation-fy2425.pdf',
  'docs/subsidiaries/igpl-charitable-foundation-fy2324.pdf',
  'docs/subsidiaries/igpl-charitable-foundation-fy2223.pdf',
  'docs/subsidiaries/igpl-charitable-foundation-fy2122.pdf',
  'docs/subsidiaries/igpl-charitable-foundation-fy2021.pdf',
  // Investor Forms
  'docs/investor-forms/form-isr1.pdf','docs/investor-forms/form-isr2.pdf',
  'docs/investor-forms/form-isr3.pdf','docs/investor-forms/form-isr4.pdf',
  'docs/investor-forms/form-sh13.pdf','docs/investor-forms/form-sh14.pdf',
  // Investor Info (legacy)
  'docs/investor-info/corporate-governance.pdf','docs/investor-info/shareholding-pattern.pdf',
  'docs/investor-info/subsidiary-financials.pdf','docs/investor-info/related-party-transactions.pdf',
  // Product TDS/SDS
  'docs/products/tds-pa.pdf','docs/products/tds-ma.pdf','docs/products/tds-ba.pdf','docs/products/tds-dep.pdf',
  'docs/products/sds-pa.pdf','docs/products/sds-ma.pdf','docs/products/sds-ba.pdf','docs/products/sds-dep.pdf',
  // Shareholding
  'docs/shareholding/q4fy2526.pdf','docs/shareholding/q3fy2526.pdf','docs/shareholding/q2fy2526.pdf',
  'docs/shareholding/q1fy2526.pdf','docs/shareholding/q4fy2425.pdf',
  'docs/shareholding/q3fy2425.pdf','docs/shareholding/q2fy2425.pdf','docs/shareholding/q1fy2425.pdf',
  'docs/shareholding/q4fy2324.pdf','docs/shareholding/q3fy2324.pdf',
  'docs/shareholding/q2fy2324.pdf','docs/shareholding/q1fy2324.pdf',
  'docs/shareholding/q4fy2223.pdf','docs/shareholding/q3fy2223.pdf',
  'docs/shareholding/q2fy2223.pdf','docs/shareholding/q1fy2223.pdf',
  'docs/shareholding/q4fy2122.pdf','docs/shareholding/q3fy2122.pdf',
  'docs/shareholding/q2fy2122.pdf','docs/shareholding/q1fy2122.pdf',
  // Secretarial Compliance
  'docs/filings/secretarial-compliance-fy2526.pdf',
  'docs/filings/secretarial-compliance-fy2425.pdf','docs/filings/secretarial-compliance-fy2324.pdf',
  'docs/filings/secretarial-compliance-fy2223.pdf','docs/filings/secretarial-compliance-fy2122.pdf',
  'docs/filings/secretarial-compliance-fy2021.pdf',
  // Certifications (About section)
  'docs/certifications/halal-certificate-annexure.pdf','docs/certifications/halal-certificate.pdf',
  'docs/certifications/star-k-certificate.pdf','docs/certifications/iso-9001-2015.pdf',
  'docs/certifications/iso-14001-2015.pdf',
  // CSR documents
  'docs/policies/csr-policy.pdf','docs/policies/csr-annual-action-plan-fy2627.pdf',
  // Related Party Transactions (Financial Reports) — per financial year: H1 (30 Sep) & H2 (31 Mar)
  'docs/investor-info/rpt-h1-sep2025.pdf','docs/investor-info/rpt-h2-mar2026.pdf', // FY 2025-26
  'docs/investor-info/rpt-h1-sep2024.pdf','docs/investor-info/rpt-h2-mar2025.pdf', // FY 2024-25
  'docs/investor-info/rpt-h1-sep2023.pdf','docs/investor-info/rpt-h2-mar2024.pdf', // FY 2023-24
  'docs/investor-info/rpt-h1-sep2022.pdf','docs/investor-info/rpt-h2-mar2023.pdf', // FY 2022-23
  'docs/investor-info/rpt-h1-sep2021.pdf','docs/investor-info/rpt-h2-mar2022.pdf', // FY 2021-22
  'docs/investor-info/rpt-h1-sep2020.pdf','docs/investor-info/rpt-h2-mar2021.pdf', // FY 2020-21
  // IEPF Documents (Investor section)
  'docs/iepf/saksham-niveshak-notice.pdf','docs/iepf/unpaid-unclaimed-dividend-fy2425.pdf',
  'docs/iepf/unclaimed-dividend-since-fy1718.pdf','docs/iepf/shares-transferred-to-iepf.pdf',
  'docs/iepf/shares-liable-to-iepf.pdf',
  // Annual Return
  'docs/governance/annual-return-fy2425.pdf','docs/governance/annual-return-fy2324.pdf',
  'docs/governance/annual-return-fy2223.pdf','docs/governance/annual-return-fy2122.pdf',
  'docs/governance/annual-return-fy2021.pdf',
  // FY25-26 Subsidiaries
  'docs/subsidiaries/igpl-international-fy2526.pdf',
  'docs/subsidiaries/igpl-charitable-foundation-fy2526.pdf',
  'docs/subsidiaries/ig-biofuels-fy2526.pdf',
]);

function isAnnouncementPath(pathname) {
  const lowerPathname = pathname.toLowerCase();
  return pathname.startsWith('docs/announcements/') &&
    (lowerPathname.endsWith('.pdf') || lowerPathname.endsWith('.mp3') || lowerPathname.endsWith('.m4a'));
}

// Sustainability documents (EC compliance reports, policies) are managed dynamically
// via /api/sustainability, so their exact paths aren't pre-registered in ALLOWED_PATHS.
function isSustainabilityPath(pathname) {
  return pathname.startsWith('docs/sustainability/') && pathname.toLowerCase().endsWith('.pdf');
}

function allowedContentTypesFor(pathname) {
  const lowerPathname = pathname.toLowerCase();
  if (lowerPathname.endsWith('.pdf')) return ['application/pdf'];
  if (lowerPathname.endsWith('.mp3')) return ['audio/mpeg'];
  if (lowerPathname.endsWith('.m4a')) return ['audio/mp4', 'audio/x-m4a'];
  return [];
}

export default async function handler(req, res) {
  try {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });

  // Read the small JSON body manually (bodyParser is off)
  let body;
  try {
    const raw = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
    body = raw ? JSON.parse(raw) : {};
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body: ' + e.message });
  }

  // ── DELETE ─ remove an uploaded document blob ────────────────────────────
  if (req.method === 'DELETE') {
    const password = (body.password || req.query.password || '').trim();
    const pathname = String(body.pathname || req.query.pathname || '');
    if (!password || password !== adminPw.trim()) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    if (!ALLOWED_PATHS.has(pathname) && !isAnnouncementPath(pathname) && !isSustainabilityPath(pathname)) {
      return res.status(400).json({ error: 'Destination path not allowed' });
    }
    try {
      // Prefer deleting by exact blob URL when supplied, but only if it maps to
      // the already-authorized pathname — so a supplied URL can never widen
      // access beyond the whitelisted destination. Otherwise delete by pathname.
      const url = typeof body.url === 'string' ? body.url : '';
      const target = url && url.endsWith('/' + pathname) ? url : pathname;
      await del(target);
      return res.status(200).json({ ok: true, deleted: pathname });
    } catch (e) {
      console.error('Delete error:', e);
      return res.status(500).json({ error: 'Delete failed: ' + e.message });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Validate password from clientPayload
        let password;
        try {
          ({ password } = JSON.parse(clientPayload || '{}'));
        } catch {
          throw new Error('Invalid password');
        }
        if (!password || password.trim() !== adminPw.trim()) {
          throw new Error('Invalid password');
        }

        // Validate destination path
        const isAnnouncement = isAnnouncementPath(pathname);
        const isSustainability = isSustainabilityPath(pathname);

        if (!isAnnouncement && !isSustainability && !ALLOWED_PATHS.has(pathname)) {
          throw new Error('Destination path not allowed');
        }

        return {
          allowedContentTypes: allowedContentTypesFor(pathname),
          maximumSizeInBytes: 50 * 1024 * 1024,
          allowOverwrite: true,
          addRandomSuffix: false,
        };
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (e) {
    if (e.message === 'Invalid password') {
      return res.status(401).json({ error: 'Invalid password' });
    }
    if (e.message === 'Destination path not allowed') {
      return res.status(400).json({ error: 'Destination path not allowed' });
    }
    console.error('Upload handler error:', e);
    return res.status(500).json({ error: 'Upload failed' });
  }
  } catch (outer) {
    try {
      console.error('Outer handler crash:', outer);
      return res.status(500).json({ error: 'Internal server error' });
    } catch (_) {
      return;
    }
  }
}
