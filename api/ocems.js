// api/ocems.js — OCEMS stack emission data proxy
// GET /api/ocems → live stack parameters from app.igpetro.com
// API key kept server-side via OCEMS_API_KEY env var. Cached 60 seconds.

const OCEMS_URL = 'https://app.igpetro.com/Ocems/Stack';
const CACHE_TTL_MS = 60 * 1000;

let cache = null;
let cacheAt = 0;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) {
    return res.status(200).json(cache);
  }

  const apiKey = process.env.OCEMS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'OCEMS API key not configured' });
  }

  try {
    const apiRes = await fetch(`${OCEMS_URL}?apiKey=${encodeURIComponent(apiKey)}`, {
      headers: { Accept: 'application/json' },
    });

    if (!apiRes.ok) throw new Error(`OCEMS returned ${apiRes.status}`);

    const data = await apiRes.json();
    const result = {
      ...data,
      updatedAt: new Date().toISOString(),
      source: 'OCEMS',
    };

    cache = result;
    cacheAt = Date.now();

    return res.status(200).json(result);
  } catch (err) {
    if (cache) {
      return res.status(200).json({ ...cache, stale: true });
    }
    return res.status(503).json({ error: 'OCEMS data unavailable', detail: err.message });
  }
}
