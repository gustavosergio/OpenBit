import { ForexRates, ForexHistoryPoint, ForexPeriod } from '../types/forex';

// Simple in-memory cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheItem<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchForexRates(base = 'USD'): Promise<ForexRates> {
  const cacheKey = `forex_${base}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Primary: Frankfurter API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${base}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Frankfurter HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const result: ForexRates = {
      base: data.base || base,
      date: data.date || new Date().toISOString().split('T')[0],
      rates: data.rates || {},
      source: 'Frankfurter API (Diário / Banco Central Europeu)',
      lastUpdated: new Date().toISOString(),
    };

    // Ensure base has rate 1.0
    result.rates[result.base] = 1.0;

    cache.set(cacheKey, { data: result, timestamp: now });
    return result;
  } catch (err) {
    console.warn('Frankfurter API failed, attempting fallback (open.er-api.com)...', err);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Fallback HTTP error: ${res.status}`);
      }

      const data = await res.json();
      const result: ForexRates = {
        base: data.base_code || base,
        date: data.time_last_update_utc ? data.time_last_update_utc.split(' ')[0] : new Date().toISOString().split('T')[0],
        rates: data.rates || {},
        source: 'ExchangeRate-API (Fallback)',
        lastUpdated: new Date().toISOString(),
      };

      result.rates[result.base] = 1.0;
      cache.set(cacheKey, { data: result, timestamp: now });
      return result;
    } catch (fallbackErr) {
      console.error('All forex APIs failed:', fallbackErr);
      // Return emergency offline fallback
      return {
        base: base,
        date: new Date().toISOString().split('T')[0],
        rates: {
          USD: 1.0,
          BRL: 5.85,
          EUR: 0.95,
          GBP: 0.79,
          JPY: 152.0,
          CAD: 1.43,
          AUD: 1.58,
          CHF: 0.90,
          CNY: 7.25,
          ARS: 1050.0,
          BTC: 0.000011,
          ETH: 0.00035,
        },
        source: 'Modo Offline (Dados Estimados)',
        lastUpdated: new Date().toISOString(),
      };
    }
  }
}

export async function fetchForexHistory(base: string, target: string, period: ForexPeriod): Promise<ForexHistoryPoint[]> {
  const cacheKey = `history_${base}_${target}_${period}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL * 3) {
    return cached.data;
  }

  try {
    const daysCount = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const endDateObj = new Date();
    const startDateObj = new Date();
    startDateObj.setDate(endDateObj.getDate() - daysCount);

    const endDate = endDateObj.toISOString().split('T')[0];
    const startDate = startDateObj.toISOString().split('T')[0];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(`https://api.frankfurter.dev/v1/${startDate}..${endDate}?base=${base}&symbols=${target}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`History HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const ratesObj = data.rates || {};

    const points: ForexHistoryPoint[] = Object.keys(ratesObj).sort().map((dateStr) => {
      const dayRates = ratesObj[dateStr];
      const rate = dayRates[target] ?? (target === base ? 1.0 : 1.0);
      return {
        date: dateStr,
        rate: Number(rate),
      };
    });

    if (points.length === 0) {
      throw new Error('No history points returned');
    }

    cache.set(cacheKey, { data: points, timestamp: now });
    return points;
  } catch (err) {
    console.warn('Failed to fetch forex history, generating simulated trend:', err);
    // Generate realistic fallback history based on current approximate rates
    const points: ForexHistoryPoint[] = [];
    const daysCount = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    let baseRate = target === 'BRL' ? 5.85 : target === 'EUR' ? 0.95 : 1.2;
    if (base !== 'USD') baseRate = 1.0;

    for (let i = daysCount; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      // Slight random walk
      const fluctuation = (Math.sin(i * 0.5) * 0.02) + ((Math.random() - 0.5) * 0.01);
      const rate = Number((baseRate * (1 + fluctuation)).toFixed(4));
      points.push({ date: dateStr, rate });
    }

    cache.set(cacheKey, { data: points, timestamp: now });
    return points;
  }
}
