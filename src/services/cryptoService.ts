import { CryptoCoin, CryptoHistoryPoint } from '../types/crypto';
import { fetchJson, isPositive, isRecord } from './http';
// Explicit IDs avoid collisions between unrelated tokens with the same symbol.
export const VERIFIED_BINANCE_PAIRS: Record<string, string> = {
  bitcoin: 'btcusdt',
  ethereum: 'ethusdt',
  solana: 'solusdt',
  binancecoin: 'bnbusdt',
  ripple: 'xrpusdt',
  cardano: 'adausdt',
  dogecoin: 'dogeusdt',
  'avalanche-2': 'avaxusdt',
  chainlink: 'linkusdt',
  polkadot: 'dotusdt',
  sui: 'suiusdt',
  'polygon-ecosystem-token': 'polusdt',
};
const numeric = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;
export interface CryptoQuery {
  page: number;
  search: string;
  favoriteIds?: string[];
}
export interface CryptoPage {
  coins: CryptoCoin[];
  total: number;
}
export const CRYPTO_PAGE_SIZE = 48;
interface CatalogCoin {
  id: string;
  symbol: string;
  name: string;
}
let catalogCache: { coins: CatalogCoin[]; timestamp: number } | undefined;
let catalogPending: Promise<CatalogCoin[]> | undefined;
const pageCache = new Map<string, { data: CryptoCoin[]; timestamp: number }>();
const pendingPages = new Map<string, Promise<CryptoCoin[]>>();
export async function fetchCryptoCatalog(): Promise<CatalogCoin[]> {
  if (catalogCache && Date.now() - catalogCache.timestamp < 600000) return catalogCache.coins;
  if (catalogPending) return catalogPending;
  catalogPending = (async () => {
    const data = await fetchJson('https://api.coingecko.com/api/v3/coins/list', 15000);
    if (!Array.isArray(data)) throw new Error('Catálogo indisponível');
    const coins = data.filter(
      (coin): coin is CatalogCoin =>
        isRecord(coin) &&
        typeof coin.id === 'string' &&
        typeof coin.name === 'string' &&
        typeof coin.symbol === 'string'
    );
    if (!coins.length) throw new Error('Catálogo vazio');
    catalogCache = { coins, timestamp: Date.now() };
    return coins;
  })().finally(() => {
    catalogPending = undefined;
  });
  return catalogPending;
}
export async function fetchCryptoMarkets(
  force = false,
  page = 1,
  ids?: string[]
): Promise<CryptoCoin[]> {
  if (ids && ids.length === 0) return [];
  const params = new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: String(CRYPTO_PAGE_SIZE),
    page: String(Math.max(1, page)),
    sparkline: 'false',
  });
  if (ids) params.set('ids', ids.join(','));
  const key = params.toString();
  const cached = pageCache.get(key);
  if (!force && cached && Date.now() - cached.timestamp < 60000) return cached.data;
  const pending = pendingPages.get(key);
  if (pending) return pending;
  const request = (async () => {
    const data = await fetchJson('https://api.coingecko.com/api/v3/coins/markets?' + key, 15000);
    if (!Array.isArray(data)) throw new Error('Invalid CoinGecko response');
    const coins: CryptoCoin[] = data.flatMap((item) => {
      if (
        !isRecord(item) ||
        typeof item.id !== 'string' ||
        typeof item.symbol !== 'string' ||
        typeof item.name !== 'string'
      )
        return [];
      return [
        {
          id: item.id,
          symbol: item.symbol.toLowerCase(),
          name: item.name,
          // Only use verified ID-to-pair mappings. Symbols alone are not unique.
          binanceSymbol: Object.prototype.hasOwnProperty.call(VERIFIED_BINANCE_PAIRS, item.id)
            ? VERIFIED_BINANCE_PAIRS[item.id]
            : '',
          image: typeof item.image === 'string' ? item.image : '',
          current_price:
            typeof item.current_price === 'number' &&
            Number.isFinite(item.current_price) &&
            item.current_price >= 0
              ? item.current_price
              : null,
          market_cap: numeric(item.market_cap),
          market_cap_rank: numeric(item.market_cap_rank),
          total_volume: numeric(item.total_volume),
          high_24h: numeric(item.high_24h),
          low_24h: numeric(item.low_24h),
          price_change_24h: numeric(item.price_change_24h),
          price_change_percentage_24h: numeric(item.price_change_percentage_24h),
        },
      ];
    });
    if (pageCache.size >= 100) pageCache.delete(pageCache.keys().next().value!);
    pageCache.set(key, { data: coins, timestamp: Date.now() });
    return coins;
  })().finally(() => {
    pendingPages.delete(key);
  });
  pendingPages.set(key, request);
  return request;
}
export async function fetchCryptoPage(query: CryptoQuery, force = false): Promise<CryptoPage> {
  const catalog = await fetchCryptoCatalog();
  const search = query.search.trim().toLocaleLowerCase();
  const favorites = query.favoriteIds ? new Set(query.favoriteIds) : undefined;
  if (!search && !favorites) {
    return { coins: await fetchCryptoMarkets(force, query.page), total: catalog.length };
  }
  const matches = catalog
    .filter(
      (coin) =>
        (!favorites || favorites.has(coin.id)) &&
        (!search ||
          [coin.id, coin.symbol, coin.name].some((value) =>
            value.toLocaleLowerCase().includes(search)
          ))
    )
    .sort(
      (a, b) =>
        Number(b.symbol.toLowerCase() === search) - Number(a.symbol.toLowerCase() === search) ||
        a.name.localeCompare(b.name) ||
        a.id.localeCompare(b.id)
    );
  const selected = matches.slice(
    (query.page - 1) * CRYPTO_PAGE_SIZE,
    query.page * CRYPTO_PAGE_SIZE
  );
  const markets = await fetchCryptoMarkets(
    force,
    1,
    selected.map((coin) => coin.id)
  );
  const byId = new Map(markets.map((coin) => [coin.id, coin]));
  const coins = selected.map(
    (coin) =>
      byId.get(coin.id) ?? {
        ...coin,
        binanceSymbol: '',
        image: '',
        current_price: null,
        market_cap: 0,
        market_cap_rank: 0,
        total_volume: 0,
        high_24h: 0,
        low_24h: 0,
        price_change_24h: 0,
        price_change_percentage_24h: 0,
      }
  );
  return { coins, total: matches.length };
}
export async function fetchCryptoHistory(coinId: string, days = 7): Promise<CryptoHistoryPoint[]> {
  try {
    const data = await fetchJson(
      'https://api.coingecko.com/api/v3/coins/' +
        encodeURIComponent(coinId) +
        '/market_chart?vs_currency=usd&days=' +
        days
    );
    if (!isRecord(data) || !Array.isArray(data.prices)) return [];
    return data.prices
      .flatMap((point) => {
        if (
          !Array.isArray(point) ||
          !isPositive(point[0]) ||
          !isPositive(point[1]) ||
          !Number.isFinite(new Date(point[0]).getTime())
        )
          return [];
        const [timestamp, price] = point as [number, number];
        const date = new Date(timestamp);
        return [
          {
            timestamp,
            price,
            date:
              days <= 1
                ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          },
        ];
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  } catch {
    return [];
  }
}
