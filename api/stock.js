// api/stock.js — live IGPL share price proxy
// GET /api/stock → proxied from app.igpetro.com/home/shareprice
// Cached for 5 minutes.

const SHARE_PRICE_URL = 'https://app.igpetro.com/home/shareprice?refresh=1';
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache = null;
let cacheAt = 0;

/** First defined numeric from explicit keys, then any key matching 52-week / year range naming. */
function pickRangeValue(data, kind) {
  const highKeys = [
    'nse52WeekHigh',
    'nseWeek52High',
    'week52High',
    'fiftyTwoWeekHigh',
    'yearHigh',
    'w52High',
    'bse52WeekHigh',
    'bseWeek52High',
  ];
  const lowKeys = [
    'nse52WeekLow',
    'nseWeek52Low',
    'week52Low',
    'fiftyTwoWeekLow',
    'yearLow',
    'w52Low',
    'bse52WeekLow',
    'bseWeek52Low',
  ];
  const keys = kind === 'high' ? highKeys : lowKeys;
  for (const key of keys) {
    if (data[key] != null && data[key] !== '') {
      const n = Number(data[key]);
      if (!Number.isNaN(n)) return n;
    }
  }
  const re =
    kind === 'high'
      ? /(52.*high|high.*52|fiftytwo.*high|yearhigh|week52high)/i
      : /(52.*low|low.*52|fiftytwo.*low|yearlow|week52low)/i;
  for (const [key, val] of Object.entries(data)) {
    if (re.test(key) && val != null && val !== '') {
      const n = Number(val);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

async function fetchYahoo52WeekRange() {
  const res = await fetch(
    'https://query1.finance.yahoo.com/v8/finance/chart/IGPL.NS?interval=1d&range=1d',
    { headers: { Accept: 'application/json', 'User-Agent': 'igpl-website/1.0' } }
  );
  if (!res.ok) return { weekHigh: null, weekLow: null };
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  return {
    weekHigh: meta?.fiftyTwoWeekHigh ?? null,
    weekLow: meta?.fiftyTwoWeekLow ?? null,
  };
}

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

    let weekHigh = pickRangeValue(data, 'high');
    let weekLow = pickRangeValue(data, 'low');
    if (weekHigh == null || weekLow == null) {
      try {
        const yahoo = await fetchYahoo52WeekRange();
        if (weekHigh == null) weekHigh = yahoo.weekHigh;
        if (weekLow == null) weekLow = yahoo.weekLow;
      } catch {
        /* keep null if Yahoo unavailable */
      }
    }

    const change =
      data.nseChange ?? data.change ?? data.bseChange ?? 0;
    const pChange =
      data.nseChangePercent ??
      data.pChange ??
      data.changePercent ??
      data.bseChangePercent ??
      0;

    const result = {
      ltp,
      bsePrice: data.bsePrice ?? ltp,
      nsePrice: data.nsePrice ?? ltp,
      change: Number(change) || 0,
      pChange: Number(pChange) || 0,
      mktCapCr: data.marketCapCr ?? 0,
      paidUpCapCr: data.paidUpCapCr ?? 31,
      weekHigh,
      weekLow,
      nseDayHigh: data.nseDayHigh ?? null,
      nseDayLow: data.nseDayLow ?? null,
      bseDayHigh: data.bseDayHigh ?? null,
      bseDayLow: data.bseDayLow ?? null,
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
