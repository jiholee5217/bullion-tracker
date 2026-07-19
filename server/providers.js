class ProviderError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.statusCode = statusCode;
  }
}

function parsePrice(value) {
  const price = Number.parseFloat(value);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function parseNumber(value, fallback = 0) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : fallback;
}

async function readJson(response, provider) {
  if (!response.ok) {
    throw new ProviderError(`${provider} request failed`);
  }

  try {
    return await response.json();
  } catch {
    throw new ProviderError(`${provider} returned an invalid response`);
  }
}

async function getMetalQuote(symbol) {
  const metal = String(symbol || "").toUpperCase();
  if (!new Set(["XAU", "XAG"]).has(metal)) {
    throw new ProviderError("Unsupported metal symbol", 400);
  }

  if (process.env.GOLDAPI_IO_KEY) {
    try {
      const response = await fetch(`https://www.goldapi.io/api/${metal}/USD`, {
        headers: { "x-access-token": process.env.GOLDAPI_IO_KEY },
      });
      const data = await readJson(response, "GoldAPI.io");
      const price = parsePrice(data.price);
      const change = parseNumber(data.ch);
      const changePct = parseNumber(data.chp);

      if (price) {
        return {
          price,
          prev: price - change,
          change,
          changePct,
          source: "GoldAPI.io",
        };
      }
    } catch {
      // Try the next configured provider.
    }
  }

  if (process.env.METALS_DEV_KEY) {
    try {
      const params = new URLSearchParams({
        api_key: process.env.METALS_DEV_KEY,
        currency: "USD",
        unit: "toz",
      });
      const response = await fetch(`https://api.metals.dev/v1/latest?${params}`);
      const data = await readJson(response, "Metals.dev");
      const metalName = metal === "XAU" ? "gold" : "silver";
      const price = parsePrice(data.metals?.[metalName]);

      if (price) {
        return {
          price,
          prev: price,
          change: 0,
          changePct: 0,
          source: "Metals.dev",
        };
      }
    } catch {
      // Use the public fallback below.
    }
  }

  const response = await fetch(`https://api.gold-api.com/price/${metal}`);
  const data = await readJson(response, "Gold-API.com");
  const price = parsePrice(data.price);
  if (!price) {
    throw new ProviderError(`No price is available for ${metal}`);
  }

  return {
    price,
    prev: price,
    change: 0,
    changePct: 0,
    source: "Gold-API.com",
  };
}

function requireFinnhubKey() {
  if (!process.env.FINNHUB_KEY) {
    throw new ProviderError(
      "S&P 500 data is unavailable until the backend is configured",
      503
    );
  }

  return process.env.FINNHUB_KEY;
}

async function getSP500Quote() {
  const token = requireFinnhubKey();
  const params = new URLSearchParams({ symbol: "SPY", token });
  const response = await fetch(`https://finnhub.io/api/v1/quote?${params}`);
  const data = await readJson(response, "Finnhub");
  const price = parsePrice(data.c);

  if (!price) {
    throw new ProviderError("Finnhub did not return an S&P 500 price");
  }

  return {
    price,
    prev: parseNumber(data.pc, price),
    change: parseNumber(data.d),
    changePct: parseNumber(data.dp),
    source: "Finnhub (SPY ETF)",
  };
}

async function getSP500History(days) {
  const token = requireFinnhubKey();
  const period = Number.parseInt(days, 10);

  if (!Number.isInteger(period) || period < 1 || period > 1825) {
    throw new ProviderError("Days must be between 1 and 1825", 400);
  }

  const resolution = period <= 7 ? "30" : period <= 30 ? "D" : "W";
  const to = Math.floor(Date.now() / 1000);
  const from = to - period * 86400;
  const params = new URLSearchParams({
    symbol: "SPY",
    resolution,
    from: String(from),
    to: String(to),
    token,
  });
  const response = await fetch(`https://finnhub.io/api/v1/stock/candle?${params}`);
  const data = await readJson(response, "Finnhub");

  if (data.s !== "ok" || !Array.isArray(data.t) || !Array.isArray(data.c)) {
    throw new ProviderError("Finnhub did not return S&P 500 history");
  }

  return data.t.map((timestamp, index) => ({
    ts: timestamp * 1000,
    price: data.c[index],
  }));
}

module.exports = {
  ProviderError,
  getMetalQuote,
  getSP500Quote,
  getSP500History,
};
