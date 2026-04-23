// api/manifest.js — returns list of all uploaded blobs as a JSON manifest
// GET /api/manifest
// Public endpoint — returns {blobs: [{url, pathname, size, uploadedAt}]}
// Used by admin.html (status) and investor-library.html (download links)

import { list } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const allBlobs = [];
    let cursor;
    do {
      const page = await list({ cursor });
      for (const b of page.blobs) {
        allBlobs.push({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt });
      }
      cursor = page.cursor;
      if (!page.hasMore) break;
    } while (true);
    return res.status(200).json({ blobs: allBlobs });
  } catch (e) {
    console.error('Manifest error:', e);
    return res.status(500).json({ error: 'Failed to list blobs: ' + e.message });
  }
}
