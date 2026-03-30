// Vercel serverless function — Yahoo Finance CORS proxy for IGPL stock price
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const symbol = req.query.symbol || "IGPL.NS";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Yahoo Finance returned ${response.status}` });
    }

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta) {
      return res.status(502).json({ error: "Invalid response from Yahoo Finance" });
    }

    return res.status(200).json({
      price: meta.regularMarketPrice,
      time: meta.regularMarketTime,
      symbol,
    });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
