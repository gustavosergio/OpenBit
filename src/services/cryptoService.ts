import { CryptoCoin, CryptoHistoryPoint } from '../types/crypto';
import { fetchJson, isPositive, isRecord } from './http';
// Explicit IDs avoid collisions between unrelated tokens with the same symbol.
export const SUPPORTED_COINS: Record<string, string> = {
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
let marketCache: { data: CryptoCoin[]; timestamp: number } | undefined;
export async function fetchCryptoMarkets(force = false): Promise<CryptoCoin[]> {
  if (!force && marketCache && Date.now() - marketCache.timestamp < 60000) return marketCache.data;
  const ids = encodeURIComponent(Object.keys(SUPPORTED_COINS).join(','));
  const data = await fetchJson(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' +
      ids +
      '&order=market_cap_desc&per_page=12&page=1&sparkline=true&price_change_percentage=24h'
  );
  if (!Array.isArray(data)) throw new Error('Invalid CoinGecko response');
  const coins: CryptoCoin[] = data.flatMap((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      !Object.prototype.hasOwnProperty.call(SUPPORTED_COINS, item.id) ||
      typeof item.symbol !== 'string' ||
      typeof item.name !== 'string' ||
      !isPositive(item.current_price)
    )
      return [];
    return [
      {
        id: item.id,
        symbol: item.symbol.toLowerCase(),
        name: item.name,
        binanceSymbol: SUPPORTED_COINS[item.id],
        image: typeof item.image === 'string' ? item.image : '',
        current_price: item.current_price,
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
  if (!coins.length)
    throw new Error('Nenhum dado de criptomoedas disponível. Tente atualizar novamente.');
  marketCache = { data: coins, timestamp: Date.now() };
  return coins;
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
