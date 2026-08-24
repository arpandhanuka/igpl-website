// api/investor-forms.js — dynamic, admin-managed Investor Service Forms.
// Mirrors the /api/sustainability store: one JSON blob holds the ordered list,
// the PDFs themselves live in Vercel Blob under docs/investor-forms/… and are
// uploaded through /api/upload.
//
// GET    /api/investor-forms          → active forms only, ordered (public site)
// GET    /api/investor-forms?all=1    → every form incl. inactive (admin panel)
// POST   /api/investor-forms {password,item}  → add (no id) or update (with id)
// DELETE /api/investor-forms {password,id}    → remove an entry
//
// Item shape: {id, name, description, pdfPath, pdfUrl, order, active}

import { put, head } from '@vercel/blob';

const INDEX_PATH = 'investor-forms/config.json';

// Seed content — served until the admin makes the first change, then fully
// editable. pdfPath values match the historic upload slots so PDFs already in
// Blob storage keep resolving.
const DEFAULT_FORMS = [
  { id: 'isr1', name: 'Form ISR-1', description: 'Request for registering PAN/KYC details or change/updation', pdfPath: 'docs/investor-forms/form-isr1.pdf', order: 1, active: true },
  { id: 'isr2', name: 'Form ISR-2', description: 'Confirmation of Signature of Securities Holder by the Banker', pdfPath: 'docs/investor-forms/form-isr2.pdf', order: 2, active: true },
  { id: 'isr3', name: 'Form ISR-3', description: 'Declaration Form for Opting-out of Nomination', pdfPath: 'docs/investor-forms/form-isr3.pdf', order: 3, active: true },
  { id: 'isr4', name: 'Form ISR-4', description: 'Duplicate and Other Services in Demat', pdfPath: 'docs/investor-forms/form-isr4.pdf', order: 4, active: true },
  { id: 'sh13', name: 'Form SH-13', description: 'Nomination Form', pdfPath: 'docs/investor-forms/form-sh13.pdf', order: 5, active: true },
  { id: 'sh14', name: 'Form SH-14', description: 'Cancellation or Variation of Nomination', pdfPath: 'docs/investor-forms/form-sh14.pdf', order: 6, active: true },
];

function cloneDefaults() {
  return { forms: DEFAULT_FORMS.map((x) => ({ ...x })) };
}

function formPath(item) {
  return item.pdfPath || 'docs/investor-forms/' + item.id + '.pdf';
}

function sanitize(item, index) {
  return {
    id: String(item.id),
    name: String(item.name || ''),
    description: String(item.description || ''),
    pdfPath: formPath(item),
    pdfUrl: item.pdfUrl || null,
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : index + 1,
    active: item.active !== false,
  };
}

function normalize(cfg) {
  if (!cfg || typeof cfg !== 'object' || !Array.isArray(cfg.forms)) return cloneDefaults();
  const forms = cfg.forms.filter((x) => x && x.id).map(sanitize);
  return { forms };
}

function sortByOrder(forms) {
  return forms.slice().sort((a, b) => (a.order - b.order) || String(a.name).localeCompare(String(b.name)));
}

async function getConfig() {
  try {
    const blob = await head(INDEX_PATH);
    const res = await fetch(blob.url + '?t=' + Date.now());
    if (!res.ok) return cloneDefaults();
    return normalize(await res.json());
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

  // ── GET ────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    const cfg = await getConfig();
    const includeInactive = String(req.query.all || '') === '1';
    const forms = sortByOrder(includeInactive ? cfg.forms : cfg.forms.filter((f) => f.active !== false));
    return res.status(200).json({ forms });
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const body = await readJsonBody(req);
    const pw = (body.password || req.query.password || '').trim();
    const id = String(body.id || req.query.id || '');
    if (!checkPassword(pw)) return res.status(401).json({ error: 'Invalid password' });
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const cfg = await getConfig();
    const before = cfg.forms.length;
    cfg.forms = cfg.forms.filter((x) => String(x.id) !== id);
    try { await saveConfig(cfg); } catch (e) { return res.status(500).json({ error: 'Failed to save: ' + e.message }); }
    return res.status(200).json({ ok: true, removed: before - cfg.forms.length, forms: sortByOrder(cfg.forms) });
  }

  // ── POST (add or update) ───────────────────────────────────────────────────
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = await readJsonBody(req);
  if (!checkPassword(body.password)) return res.status(401).json({ error: 'Invalid password' });

  const item = body.item && typeof body.item === 'object' ? body.item : null;
  if (!item) return res.status(400).json({ error: 'Missing item' });

  const name = (item.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Form name is required' });

  const cfg = await getConfig();
  const existingId = item.id ? String(item.id) : '';
  const idx = existingId ? cfg.forms.findIndex((x) => String(x.id) === existingId) : -1;

  const entry = { name: name, description: (item.description || '').trim() };
  if (item.order !== undefined && Number.isFinite(Number(item.order))) entry.order = Number(item.order);
  if (item.active !== undefined) entry.active = item.active !== false;
  if (item.pdfUrl !== undefined) entry.pdfUrl = item.pdfUrl || null;

  let saved;
  if (idx >= 0) {
    saved = sanitize({ ...cfg.forms[idx], ...entry, id: existingId }, idx);
    cfg.forms[idx] = saved;
  } else {
    const id = existingId || 'f' + Date.now().toString();
    const maxOrder = cfg.forms.reduce((m, f) => Math.max(m, Number(f.order) || 0), 0);
    saved = sanitize({
      ...entry,
      id: id,
      order: entry.order !== undefined ? entry.order : maxOrder + 1,
      active: entry.active !== undefined ? entry.active : true,
      pdfPath: 'docs/investor-forms/' + id + '.pdf',
    }, cfg.forms.length);
    cfg.forms.push(saved);
  }

  try { await saveConfig(cfg); } catch (e) { return res.status(500).json({ error: 'Failed to save: ' + e.message }); }
  return res.status(200).json({ ok: true, item: saved, forms: sortByOrder(cfg.forms) });
}
