import { ForexRates, ForexHistoryPoint, ForexPeriod } from '../types/forex';
import { fetchJson, isRecord, isPositive } from './http';
interface CacheItem<T> {
  data: T;
  timestamp: number;
}
const rateCache = new Map<string, CacheItem<ForexRates>>();
const historyCache = new Map<string, CacheItem<ForexHistoryPoint[]>>();
const CACHE_TTL = 5 * 60 * 1000;
function parseRates(value: unknown): Record<string, number> {
  if (!isRecord(value)) throw new Error('Invalid exchange rates');
  const rates = Object.fromEntries(
    Object.entries(value).filter(([, rate]) => isPositive(rate))
  ) as Record<string, number>;
  if (!Object.keys(rates).length) throw new Error('Empty exchange rates');
  return rates;
}
export async function fetchForexRates(
  base = 'USD',
  force = false,
  target?: string
): Promise<ForexRates> {
  const cached = rateCache.get(base);
  if (
    !force &&
    cached &&
    Date.now() - cached.timestamp < CACHE_TTL &&
    (!target || isPositive(cached.data.rates[target]))
  )
    return cached.data;
  let result: ForexRates;
  try {
    const data = await fetchJson(
      'https://api.frankfurter.dev/v1/latest?base=' + encodeURIComponent(base)
    );
    if (
      !isRecord(data) ||
      data.base !== base ||
      typeof data.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
      !Number.isFinite(Date.parse(data.date))
    )
      throw new Error('Invalid Frankfurter response');
    const rates = { ...parseRates(data.rates), [base]: 1 };
    if (target && !isPositive(rates[target]))
      throw new Error('Pair requires broader currency coverage');
    result = {
      base,
      date: data.date,
      rates,
      source: 'Frankfurter API (taxas diárias / BCE)',
      lastUpdated: data.date + 'T00:00:00Z',
    };
  } catch {
    const data = await fetchJson('https://open.er-api.com/v6/latest/' + encodeURIComponent(base));
    if (
      !isRecord(data) ||
      data.result !== 'success' ||
      data.base_code !== base ||
      !isPositive(data.time_last_update_unix)
    ) {
      throw new Error('Não foi possível obter as taxas de câmbio. Tente atualizar novamente.');
    }
    const updated = new Date(data.time_last_update_unix * 1000).toISOString();
    result = {
      base,
      date: updated.slice(0, 10),
      rates: { ...parseRates(data.rates), [base]: 1 },
      source: 'ExchangeRate-API (taxas diárias)',
      lastUpdated: updated,
    };
  }
  rateCache.set(base, { data: result, timestamp: Date.now() });
  return result;
}
export async function fetchForexHistory(
  base: string,
  target: string,
  period: ForexPeriod,
  force = false
): Promise<ForexHistoryPoint[]> {
  const key = [base, target, period].join('_');
  const cached = historyCache.get(key);
  if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL * 3) return cached.data;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - days);
  if (base === target)
    return [start, end].map((date) => ({ date: date.toISOString().slice(0, 10), rate: 1 }));
  try {
    const data = await fetchJson(
      'https://api.frankfurter.dev/v1/' +
        start.toISOString().slice(0, 10) +
        '..' +
        end.toISOString().slice(0, 10) +
        '?base=' +
        encodeURIComponent(base) +
        '&symbols=' +
        encodeURIComponent(target),
      9000
    );
    if (!isRecord(data) || !isRecord(data.rates)) throw new Error('Invalid history');
    const points = Object.entries(data.rates)
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([date, rates]) =>
        isRecord(rates) && isPositive(rates[target]) ? [{ date, rate: rates[target] }] : []
      );
    if (!points.length) throw new Error('Empty history');
    historyCache.set(key, { data: points, timestamp: Date.now() });
    return points;
  } catch {
    return [];
  } // Never invent prices for unsupported pairs or outages.
}
