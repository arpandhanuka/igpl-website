// api/announcements.js — dynamic corporate announcements feed
// GET  /api/announcements            → returns sorted list
// POST /api/announcements            → publish new announcement (requires ADMIN_PASSWORD)
// DELETE /api/announcements?id=xxx   → delete announcement (requires ADMIN_PASSWORD in body/query)

import { put, head } from '@vercel/blob';

const INDEX_PATH = 'announcements/index.json';

const EXCHANGE_ANNOUNCEMENTS = [
  {
    id: 'nse-106581786',
    title: 'Disclosure under SEBI Takeover Regulations',
    date: '2026-04-09',
    category: 'disclosure',
    pdfUrl: 'https://nsearchives.nseindia.com/corporate/team_sandeshc_07042026122014_11.pdf',
    audioUrl: null,
    pdfPath: null,
    audioPath: null,
    source: 'NSE',
  },
  {
    id: 'nse-106580941',
    title: 'Certificate under SEBI Depositories and Participants Regulations, 2018',
    date: '2026-04-06',
    category: 'disclosure',
    pdfUrl: 'https://nsearchives.nseindia.com/corporate/IGPL_06042026183105_IGPL745Q42526.pdf',
    audioUrl: null,
    pdfPath: null,
    audioPath: null,
    source: 'NSE',
  },
  {
    id: 'nse-106574154',
    title: 'Mechanical completion of Plasticizer plant',
    date: '2026-03-30',
    category: 'general',
    pdfUrl: 'https://nsearchives.nseindia.com/corporate/IGPL_30032026153516_Reg30_Plasticizer_Plant.pdf',
    audioUrl: null,
    pdfPath: null,
    audioPath: null,
    source: 'NSE',
  },
  {
    id: 'nse-106565638',
    title: 'Closure of Trading Window',
    date: '2026-03-24',
    category: 'disclosure',
    pdfUrl: 'https://nsearchives.nseindia.com/corporate/IGPL_24032026161742_IGPL_ClosingOfTradingWindow.pdf',
    audioUrl: null,
    pdfPath: null,
    audioPath: null,
    source: 'NSE',
  },
  {
    id: 'nse-106548011',
    title: 'Newspaper publication regarding special window for transfer and dematerialisation of physical securities',
    date: '2026-03-02',
    category: 'general',
    pdfUrl: 'https://nsearchives.nseindia.com/corporate/IGPL_02032026124855_NewspaperAdvertisement_IGPL.pdf',
    audioUrl: null,
    pdfPath: null,
    audioPath: null,
    source: 'NSE',
  },
];

function mergeExchangeAnnouncements(items) {
  const seen = new Set();
  return [...items, ...EXCHANGE_ANNOUNCEMENTS].filter((item) => {
    const key = item.pdfUrl || item.pdfPath || `${item.date}|${item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

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


export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    const items = mergeExchangeAnnouncements(await getIndex());
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

  let rawBody = '';
  await new Promise((resolve, reject) => {
    req.on('data', c => rawBody += c);
    req.on('end', resolve);
    req.on('error', reject);
  });

  let fields;
  try { fields = JSON.parse(rawBody); }
  catch(e) { return res.status(400).json({ error: 'Invalid JSON body' }); }

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
  const entry = {
    id,
    title,
    date,
    category,
    pdfUrl: fields.pdfUrl || null,
    audioUrl: fields.audioUrl || null,
    pdfPath: fields.pdfPath || null,
    audioPath: fields.audioPath || null,
  };

  let items;
  try { items = await getIndex(); } catch(e) { items = []; }
  items.push(entry);
  try { await saveIndex(items); } catch(e) {
    return res.status(500).json({ error: 'Failed to save index: ' + e.message });
  }
  return res.status(200).json({ ok: true, announcement: entry });
}
