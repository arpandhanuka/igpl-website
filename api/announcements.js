// api/announcements.js — dynamic corporate announcements feed
// GET  /api/announcements            → returns sorted list
// POST /api/announcements            → publish new announcement (requires ADMIN_PASSWORD)
// DELETE /api/announcements?id=xxx   → delete announcement (requires ADMIN_PASSWORD in body/query)

import { put, head } from '@vercel/blob';

const INDEX_PATH = 'announcements/index.json';

async function getIndex() {
  try {
    const blob = await head(INDEX_PATH);
    const res = await fetch(blob.url + '?t=' + Date.now());
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

async function saveIndex(items) {
  await put(INDEX_PATH, JSON.stringify(items), {
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
  });
}

async function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const ct = req.headers['content-type'] || '';
    const boundary = (ct.match(/boundary=([^\s;]+)/) || [])[1];
    if (!boundary) {
      // Try JSON body
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try { resolve({ fields: JSON.parse(body), files: {} }); }
        catch(e) { resolve({ fields: {}, files: {} }); }
      });
      req.on('error', reject);
      return;
    }

    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try {
        const buf = Buffer.concat(chunks);
        const boundaryBuf = Buffer.from('--' + boundary);
        const fields = {};
        const files = {};
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
          const name = nameMatch[1];
          if (filenameMatch) {
            files[name] = { buffer: body, filename: filenameMatch[1], contentType: ctMatch ? ctMatch[1].trim() : 'application/octet-stream' };
          } else {
            fields[name] = body.toString();
          }
        }
        resolve({ fields, files });
      } catch(e) { reject(e); }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    const items = await getIndex();
    const sorted = [...items].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return res.status(200).json({ announcements: sorted });
  }

  // ── DELETE ───────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    let body = '';
    await new Promise(r => { req.on('data', c => body += c); req.on('end', r); });
    let parsed = {};
    try { parsed = JSON.parse(body); } catch(e) {}
    const pw = parsed.password || req.query.password || '';
    const id = parsed.id || req.query.id || '';
    if (!pw || pw !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid password' });
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const items = await getIndex();
    const filtered = items.filter(i => i.id !== id);
    await saveIndex(filtered);
    return res.status(200).json({ ok: true, removed: items.length - filtered.length });
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let parsed;
  try { parsed = await parseMultipart(req); }
  catch(e) { return res.status(400).json({ error: 'Parse error: ' + e.message }); }

  const { fields, files } = parsed;
  if (!fields.password || fields.password.trim() !== (process.env.ADMIN_PASSWORD || '').trim()) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const title = (fields.title || '').trim();
  const date = (fields.date || '').trim();
  const category = (fields.category || 'general').trim();
  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (!date) return res.status(400).json({ error: 'Date is required' });
  if (!['earnings','board','disclosure','general'].includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const id = Date.now().toString();
  const entry = { id, title, date, category, pdfUrl: null, audioUrl: null, pdfPath: null, audioPath: null };

  // Upload PDF if present
  if (files.pdf && files.pdf.buffer && files.pdf.buffer.length > 0) {
    const pdfPath = fields.pdf_path ? fields.pdf_path.trim() : `docs/announcements/${id}.pdf`;
    if (!pdfPath.startsWith('docs/announcements/') || !pdfPath.endsWith('.pdf')) {
      return res.status(400).json({ error: 'Invalid PDF path' });
    }
    try {
      const blob = await put(pdfPath, files.pdf.buffer, { access: 'public', contentType: 'application/pdf', allowOverwrite: true });
      entry.pdfUrl = blob.url;
      entry.pdfPath = pdfPath;
    } catch(e) {
      return res.status(500).json({ error: 'PDF upload failed: ' + e.message });
    }
  }

  // Upload audio if present
  if (files.audio && files.audio.buffer && files.audio.buffer.length > 0) {
    const audioPath = fields.audio_path ? fields.audio_path.trim() : `docs/announcements/${id}.mp3`;
    if (!audioPath.startsWith('docs/announcements/') || !(audioPath.endsWith('.mp3') || audioPath.endsWith('.m4a'))) {
      return res.status(400).json({ error: 'Invalid audio path' });
    }
    try {
      const blob = await put(audioPath, files.audio.buffer, { access: 'public', contentType: 'audio/mpeg', allowOverwrite: true });
      entry.audioUrl = blob.url;
      entry.audioPath = audioPath;
    } catch(e) {
      return res.status(500).json({ error: 'Audio upload failed: ' + e.message });
    }
  }

  const items = await getIndex();
  items.push(entry);
  await saveIndex(items);
  return res.status(200).json({ ok: true, announcement: entry });
}
