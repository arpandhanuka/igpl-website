// api/upload.js — Vercel Blob upload handler
// POST multipart/form-data with fields: password, dest_path, file
// Requires env vars: ADMIN_PASSWORD, BLOB_READ_WRITE_TOKEN

import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // we parse multipart manually via formidable
  },
};

// Allowed destination paths (whitelist)
const ALLOWED_PATHS = new Set([
  // Annual Reports
  'docs/annual-reports/fy2526.pdf',
  'docs/annual-reports/fy2425.pdf',
  'docs/annual-reports/fy2324.pdf',
  'docs/annual-reports/fy2223.pdf',
  'docs/annual-reports/fy2122.pdf',
  'docs/annual-reports/fy2021.pdf',
  // Quarterly Results
  'docs/earnings/q3fy2526.pdf',
  'docs/earnings/q2fy2526.pdf',
  'docs/earnings/q1fy2526.pdf',
  'docs/earnings/q4fy2425.pdf',
  'docs/earnings/q3fy2425.pdf',
  'docs/earnings/q2fy2425.pdf',
  'docs/earnings/q1fy2425.pdf',
  // Investor Documents
  'docs/investor-info/corporate-governance.pdf',
  'docs/investor-info/shareholding-pattern.pdf',
  'docs/investor-info/subsidiary-financials.pdf',
  'docs/investor-info/related-party-transactions.pdf',
  // Governance
  'docs/governance/memorandum-articles.pdf',
  'docs/governance/board-committees.pdf',
  'docs/governance/dividend-policy.pdf',
  'docs/governance/vigil-mechanism.pdf',
  // Policies
  'docs/policies/csr-policy.pdf',
  'docs/policies/remuneration-policy.pdf',
  'docs/policies/risk-management.pdf',
  'docs/policies/sustainability-report.pdf',
  // Product TDS
  'docs/products/tds-pa.pdf',
  'docs/products/tds-ma.pdf',
  'docs/products/tds-ba.pdf',
  'docs/products/tds-dep.pdf',
  // Product SDS
  'docs/products/sds-pa.pdf',
  'docs/products/sds-ma.pdf',
  'docs/products/sds-ba.pdf',
  'docs/products/sds-dep.pdf',
  // Investor Presentations
  'docs/investor-presentations/q3fy2526-presentation.pdf',
  'docs/investor-presentations/q2fy2526-presentation.pdf',
  'docs/investor-presentations/q1fy2526-presentation.pdf',
  'docs/investor-presentations/q4fy2425-presentation.pdf',
  // Shareholding
  'docs/shareholding/q3fy2526.pdf',
  'docs/shareholding/q2fy2526.pdf',
  'docs/shareholding/q1fy2526.pdf',
  'docs/shareholding/q4fy2425.pdf',
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
        let fileBuffer = null;
        let fileName = '';
        let fileType = '';

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
          // Part data is between partStart+2 (skip \r\n) and nextIdx-2 (trim \r\n)
          const part = buf.slice(partStart + 2, nextIdx - 2);
          parts.push(part);
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
          const name = nameMatch[1];

          if (filenameMatch) {
            fileName = filenameMatch[1];
            fileType = ctMatch ? ctMatch[1].trim() : 'application/octet-stream';
            fileBuffer = body;
          } else {
            fields[name] = body.toString();
          }
        }

        resolve({ fields, fileBuffer, fileName, fileType });
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) return res.status(500).json({ error: 'Server misconfigured: ADMIN_PASSWORD not set' });

  let parsed;
  try {
    parsed = await parseMultipart(req);
  } catch (e) {
    return res.status(400).json({ error: 'Failed to parse upload: ' + e.message });
  }

  const { fields, fileBuffer, fileType } = parsed;

  if (!fields.password || fields.password.trim() !== adminPw.trim()) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const destPath = (fields.dest_path || '').trim();
  if (!destPath) return res.status(400).json({ error: 'Missing dest_path' });
  if (!ALLOWED_PATHS.has(destPath)) return res.status(400).json({ error: 'Destination path not allowed' });

  if (!fileBuffer || fileBuffer.length === 0) return res.status(400).json({ error: 'No file uploaded' });
  if (fileBuffer.length > 30 * 1024 * 1024) return res.status(413).json({ error: 'File too large (max 30MB)' });

  try {
    const blob = await put(destPath, fileBuffer, {
      access: 'public',
      contentType: fileType || 'application/pdf',
      allowOverwrite: true,
    });

    return res.status(200).json({
      ok: true,
      url: blob.url,
      path: destPath,
      size: fileBuffer.length,
    });
  } catch (e) {
    console.error('Blob upload error:', e);
    return res.status(500).json({ error: 'Upload failed: ' + e.message });
  }
}
