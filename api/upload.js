// api/upload.js — Vercel Blob upload handler
// POST multipart/form-data: password, dest_path, file

import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

const ALLOWED_PATHS = new Set([
  // Annual Reports
  'docs/annual-reports/fy2526.pdf','docs/annual-reports/fy2425.pdf',
  'docs/annual-reports/fy2324.pdf','docs/annual-reports/fy2223.pdf',
  'docs/annual-reports/fy2122.pdf','docs/annual-reports/fy2021.pdf',
  // Quarterly Results
  'docs/earnings/q3fy2526.pdf','docs/earnings/q2fy2526.pdf','docs/earnings/q1fy2526.pdf',
  'docs/earnings/q4fy2425.pdf','docs/earnings/q3fy2425.pdf','docs/earnings/q2fy2425.pdf','docs/earnings/q1fy2425.pdf',
  'docs/earnings/q4fy2324.pdf','docs/earnings/q3fy2324.pdf','docs/earnings/q2fy2324.pdf','docs/earnings/q1fy2324.pdf',
  'docs/earnings/q4fy2223.pdf','docs/earnings/q3fy2223.pdf','docs/earnings/q2fy2223.pdf','docs/earnings/q1fy2223.pdf',
  'docs/earnings/q4fy2122.pdf','docs/earnings/q3fy2122.pdf','docs/earnings/q2fy2122.pdf','docs/earnings/q1fy2122.pdf',
  'docs/earnings/q4fy2021.pdf','docs/earnings/q3fy2021.pdf','docs/earnings/q2fy2021.pdf','docs/earnings/q1fy2021.pdf',
  // Investor Presentations
  'docs/investor-presentations/q3fy2526-presentation.pdf','docs/investor-presentations/q2fy2526-presentation.pdf','docs/investor-presentations/q1fy2526-presentation.pdf',
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
  'docs/policies/sebi-lodr-reg30.pdf',
  // Subsidiaries
  'docs/subsidiaries/igpl-international-fy2425.pdf','docs/subsidiaries/igpl-international-fy2324.pdf',
  'docs/subsidiaries/igpl-international-fy2223.pdf','docs/subsidiaries/igpl-international-fy2122.pdf',
  'docs/subsidiaries/igpl-international-fy2021.pdf',
  'docs/subsidiaries/igpl-charitable-foundation-fy2425.pdf',
  'docs/subsidiaries/igpl-charitable-foundation-fy2324.pdf',
  'docs/subsidiaries/igpl-charitable-foundation-fy2223.pdf',
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
  'docs/shareholding/q3fy2526.pdf','docs/shareholding/q2fy2526.pdf',
  'docs/shareholding/q1fy2526.pdf','docs/shareholding/q4fy2425.pdf',
]);

async function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const boundary = (() => {
      const ct = req.headers['content-type'] || '';
      const m = ct.match(/boundary=([^\s;]+)/);
      return m ? m[1] : null;
    })();
    if (!boundary) return reject(new Error('No boundary in Content-Type'));
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try {
        const buf = Buffer.concat(chunks);
        const fields = {};
        let fileBuffer = null, fileName = '', fileType = '';
        const boundaryBuf = Buffer.from('--' + boundary);
        let start = 0;
        const parts = [];
        while (true) {
          const idx = buf.indexOf(boundaryBuf, start);
          if (idx === -1) break;
          const partStart = idx + boundaryBuf.length;
          start = partStart;
          const nextIdx = buf.indexOf(boundaryBuf, start);
          if (nextIdx === -1) break;
          parts.push(buf.slice(partStart + 2, nextIdx - 2));
          start = nextIdx;
        }
        for (const part of parts) {
          const headerEnd = part.indexOf('\r\n\r\n');
          if (headerEnd === -1) continue;
          const headerStr = part.slice(0, headerEnd).toString();
          const body = part.slice(headerEnd + 4);
          const nameMatch = headerStr.match(/name="([^"]+)"/);
          const filenameMatch = headerStr.match(/filename="([^"]+)"/);
          const ctMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);
          if (!nameMatch) continue;
          if (filenameMatch) {
            fileName = filenameMatch[1];
            fileType = ctMatch ? ctMatch[1].trim() : 'application/octet-stream';
            fileBuffer = body;
          } else {
            fields[nameMatch[1]] = body.toString();
          }
        }
        resolve({ fields, fileBuffer, fileName, fileType });
      } catch(e) { reject(e); }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });

  let parsed;
  try { parsed = await parseMultipart(req); }
  catch(e) { return res.status(400).json({ error: 'Parse error: ' + e.message }); }

  const { fields, fileBuffer, fileType } = parsed;
  if (!fields.password || fields.password.trim() !== adminPw.trim()) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const destPath = (fields.dest_path || '').trim();
  if (!destPath) return res.status(400).json({ error: 'Missing dest_path' });

  // Dynamic allow for announcements
  const isAnnouncement = destPath.startsWith('docs/announcements/') &&
    (destPath.endsWith('.pdf') || destPath.endsWith('.mp3') || destPath.endsWith('.m4a'));

  if (!isAnnouncement && !ALLOWED_PATHS.has(destPath)) {
    return res.status(400).json({ error: 'Destination path not allowed' });
  }

  if (!fileBuffer || fileBuffer.length === 0) return res.status(400).json({ error: 'No file uploaded' });
  if (fileBuffer.length > 50 * 1024 * 1024) return res.status(413).json({ error: 'File too large (max 50MB)' });

  try {
    const blob = await put(destPath, fileBuffer, {
      access: 'public',
      contentType: fileType || 'application/pdf',
      allowOverwrite: true,
    });
    return res.status(200).json({ ok: true, url: blob.url, path: destPath, size: fileBuffer.length });
  } catch(e) {
    console.error('Blob upload error:', e);
    return res.status(500).json({ error: 'Upload failed: ' + e.message });
  }
}
