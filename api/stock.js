// api/stock.js — live IGPL stock data proxy
// GET /api/stock → returns { ltp, change, pChange, mktCapCr, paidUpCapCr, weekHigh, weekLow, updatedAt }
// Proxies NSE India API server-side to avoid CORS. Cached for 5 minutes.

const SYMBOL = 'IGPL';
const FACE_VALUE = 10;
const SHARES_ISSUED = 30794850;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache = null;
let cacheAt = 0;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Return cache if fresh
  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) {
    return res.status(200).json(cache);
  }

  try {
    // NSE requires a session cookie — first hit the quote page to get one
    const sessionRes = await fetch(`https://www.nseindia.com/get-quotes/equity?symbol=${SYMBOL}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    const cookies = sessionRes.headers.get('set-cookie') || '';

    const apiRes = await fetch(`https://www.nseindia.com/api/quote-equity?symbol=${SYMBOL}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.nseindia.com/',
        'Cookie': cookies,
      },
    });

    if (!apiRes.ok) throw new Error(`NSE returned ${apiRes.status}`);

    const data = await apiRes.json();
    const price = data.priceInfo || {};
    const whl = price.weekHighLow || {};

    const ltp = price.lastPrice || 0;
    const mktCapCr = parseFloat(((SHARES_ISSUED * ltp) / 1e7).toFixed(0));
    const paidUpCapCr = parseFloat(((SHARES_ISSUED * FACE_VALUE) / 1e7).toFixed(1));

    const result = {
      ltp,
      change: price.change || 0,
      pChange: parseFloat((price.pChange || 0).toFixed(2)),
      mktCapCr,
      paidUpCapCr,
      weekHigh: whl.max || 0,
      weekLow: whl.min || 0,
      updatedAt: new Date().toISOString(),
      source: 'NSE',
    };

    cache = result;
    cacheAt = Date.now();

    return res.status(200).json(result);
  } catch (err) {
    // If NSE fails, return last cache or a fallback with stale flag
    if (cache) {
      return res.status(200).json({ ...cache, stale: true });
    }
    return res.status(503).json({ error: 'Stock data unavailable', detail: err.message });
  }
}
