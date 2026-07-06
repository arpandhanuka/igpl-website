// api/sustainability.js — dynamic, admin-managed config for the Sustainability page.
// Stores three collections in one JSON blob:
//   ecReports    → Environment Clearances & Compliance Report documents
//   policies     → Sustainability policy documents
//   oceansLinks  → Live Oceans / OCEMS external links
//
// GET    /api/sustainability                      → returns the full config (public)
// POST   /api/sustainability {password,collection,item}   → add (no id) or update (with id) an entry
// DELETE /api/sustainability {password,collection,id}     → remove an entry
//
// Documents themselves are uploaded to Vercel Blob via /api/upload at paths
// under docs/sustainability/… ; this store only tracks their metadata + public URL.

import { put, head } from '@vercel/blob';

const INDEX_PATH = 'sustainability/config.json';
const COLLECTIONS = ['ecReports', 'policies', 'oceansLinks'];

// Seed content — shown until the admin makes the first change, then fully editable.
const DEFAULT_CONFIG = {
  ecReports: [
    { id: 'ec1',  label: 'MA-3 EC 2008' },
    { id: 'ec2',  label: 'PA-V EC Amendment' },
    { id: 'ec3',  label: 'PA-V EC' },
    { id: 'ec4',  label: 'PA-V EC Compliance – April 2023 to September 2023' },
    { id: 'ec5',  label: 'PA-1 Expansion EC 2007' },
    { id: 'ec6',  label: 'PA-2 EC 1997' },
    { id: 'ec7',  label: 'PA-3 EC 2009' },
    { id: 'ec8',  label: 'PA-4 EC Amendment' },
    { id: 'ec9',  label: 'PA-4 MA-4 Dep DMP' },
    { id: 'ec10', label: 'PA-5 EC Compliance – October 2024 to March 2025' },
    { id: 'ec11', label: 'Plasticizer EC Amendment 2025' },
    { id: 'ec12', label: 'Plasticizer EC – 16 February 2024' },
    { id: 'ec13', label: 'EC Compliance Report MA-3 – April 2018 to September 2018' },
    { id: 'ec14', label: 'EC Compliance Report – April 2017 to September 2017' },
    { id: 'ec15', label: 'EC Compliance Report – October 2017 to March 2018' },
    { id: 'ec16', label: 'EC Compliance Report – April 2018 to September 2018' },
    { id: 'ec17', label: 'EC Compliance Report – October 2019 to March 2020' },
    { id: 'ec18', label: 'EC Compliance Report – April 2020 to September 2020' },
    { id: 'ec19', label: 'EC Compliance Report – October 2020 to March 2021' },
    { id: 'ec20', label: 'EC Compliance Report – April 2021 to September 2021' },
    { id: 'ec21', label: 'EC Compliance Report – October 2021 to March 2022' },
    { id: 'ec22', label: 'EC Compliance Report – April 2022 to September 2022' },
    { id: 'ec23', label: 'EC Compliance Report – October 2022 to March 2023' },
    { id: 'ec24', label: 'EC Compliance Report – April 2023 to September 2023' },
    { id: 'ec25', label: 'EC Compliance Report – October 2023 to March 2024' },
    { id: 'ec26', label: 'EC Compliance Report – April 2024 to September 2024' },
    { id: 'ec27', label: 'EC Compliance Report – October 2024 to March 2025' },
    { id: 'ec28', label: 'EC Compliance Report – April 2025 to September 2025' },
    { id: 'ec29', label: 'EC Compliance Report – October 2025 to March 2026' },
    { id: 'ec30', label: 'Plasticizer EC Compliance – October 2023 to March 2024' },
    { id: 'ec31', label: 'Plasticizer EC Compliance – October 2024 to March 2025' },
    { id: 'ec32', label: 'Plasticizer EC Compliance – October 2025 to March 2026' },
  ],
  policies: [
    { id: 'pol1', label: 'Business Responsibility & Sustainability Policy' },
    { id: 'pol2', label: 'IT Security Policy' },
    { id: 'pol3', label: 'QEOHS Policy' },
  ],
  oceansLinks: [
    { id: 'ocems', label: 'Live OCEMS Link', url: '' },
  ],
};

function cloneDefaults() {
  return {
    ecReports: DEFAULT_CONFIG.ecReports.map((x) => ({ ...x })),
    policies: DEFAULT_CONFIG.policies.map((x) => ({ ...x })),
    oceansLinks: DEFAULT_CONFIG.oceansLinks.map((x) => ({ ...x })),
  };
}

function normalize(cfg) {
  const out = cloneDefaults();
  if (cfg && typeof cfg === 'object') {
    COLLECTIONS.forEach((c) => {
      if (Array.isArray(cfg[c])) out[c] = cfg[c];
    });
  }
  return out;
}

async function getConfig() {
  try {
    const blob = await head(INDEX_PATH);
    const res = await fetch(blob.url + '?t=' + Date.now());
    if (!res.ok) return cloneDefaults();
    const parsed = await res.json();
    return normalize(parsed);
  } catch (e) {
    // No persisted config yet → serve the seed defaults.
    return cloneDefaults();
  }
}

async function saveConfig(cfg) {
  await put(INDEX_PATH, JSON.stringify(cfg), {
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
  });
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const raw = await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function checkPassword(pw) {
  return pw && pw.trim() === (process.env.ADMIN_PASSWORD || '').trim();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(await getConfig());
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const body = await readJsonBody(req);
    const pw = (body.password || req.query.password || '').trim();
    const collection = String(body.collection || req.query.collection || '');
    const id = String(body.id || req.query.id || '');
    if (!checkPassword(pw)) return res.status(401).json({ error: 'Invalid password' });
    if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Invalid collection' });
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const cfg = await getConfig();
    const before = cfg[collection].length;
    cfg[collection] = cfg[collection].filter((x) => String(x.id) !== id);
    try { await saveConfig(cfg); } catch (e) { return res.status(500).json({ error: 'Failed to save: ' + e.message }); }
    return res.status(200).json({ ok: true, removed: before - cfg[collection].length, config: cfg });
  }

  // ── POST (add or update) ────────────────────────────────────────────────────
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = await readJsonBody(req);
  if (!checkPassword(body.password)) return res.status(401).json({ error: 'Invalid password' });

  const collection = String(body.collection || '');
  if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Invalid collection' });

  const item = body.item && typeof body.item === 'object' ? body.item : null;
  if (!item) return res.status(400).json({ error: 'Missing item' });

  const label = (item.label || '').trim();
  if (!label) return res.status(400).json({ error: 'Label is required' });

  const cfg = await getConfig();
  const list = cfg[collection];
  const existingId = item.id ? String(item.id) : '';
  const idx = existingId ? list.findIndex((x) => String(x.id) === existingId) : -1;

  // Build the sanitized entry per collection shape.
  const entry = {};
  if (collection === 'oceansLinks') {
    entry.label = label;
    entry.url = (item.url || '').trim();
  } else {
    entry.label = label;
    if (item.pdfUrl !== undefined) entry.pdfUrl = item.pdfUrl || null;
    if (item.pdfPath !== undefined) entry.pdfPath = item.pdfPath || null;
  }

  let saved;
  if (idx >= 0) {
    saved = { ...list[idx], ...entry, id: existingId };
    list[idx] = saved;
  } else {
    saved = { ...entry, id: existingId || Date.now().toString() };
    list.push(saved);
  }

  try { await saveConfig(cfg); } catch (e) { return res.status(500).json({ error: 'Failed to save: ' + e.message }); }
  return res.status(200).json({ ok: true, item: saved, config: cfg });
}
