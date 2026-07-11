// api/stock.js — live IGPL share price proxy
// GET /api/stock → proxied from app.igpetro.com/Home/SharePrice
// Cached for 5 minutes.

const SHARE_PRICE_URL = 'https://app.igpetro.com/Home/SharePrice?refresh=1';
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache = null;
let cacheAt = 0;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) {
    return res.status(200).json(cache);
  }

  try {
    const apiRes = await fetch(SHARE_PRICE_URL, {
      headers: { Accept: 'application/json' },
    });

    if (!apiRes.ok) throw new Error(`SharePrice returned ${apiRes.status}`);

    const data = await apiRes.json();
    const ltp = data.nsePrice ?? data.bsePrice ?? 0;

    const result = {
      ltp,
      bsePrice: data.bsePrice ?? ltp,
      nsePrice: data.nsePrice ?? ltp,
      change: 0,
      pChange: 0,
      mktCapCr: data.marketCapCr ?? 0,
      paidUpCapCr: 31,
      weekHigh: null,
      weekLow: null,
      updatedAt: data.lastUpdated || new Date().toISOString(),
      source: data.priceSource || data.source || 'igpl-share-price',
      symbol: data.symbol || 'IGPL',
    };

    cache = result;
    cacheAt = Date.now();

    return res.status(200).json(result);
  } catch (err) {
    if (cache) {
      return res.status(200).json({ ...cache, stale: true });
    }
    return res.status(503).json({ error: 'Stock data unavailable', detail: err.message });
  }
}
