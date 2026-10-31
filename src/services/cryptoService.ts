import { CryptoCoin, CryptoHistoryPoint } from '../types/crypto';

export const INITIAL_COINS: CryptoCoin[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    binanceSymbol: 'btcusdt',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 91500.0,
    market_cap: 1800000000000,
    market_cap_rank: 1,
    total_volume: 35000000000,
    high_24h: 93200.0,
    low_24h: 89800.0,
    price_change_24h: 2150.0,
    price_change_percentage_24h: 2.41,
    sparkline_in_7d: { price: [88000, 89200, 88500, 90100, 91000, 90500, 91500] }
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    binanceSymbol: 'ethusdt',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3450.0,
    market_cap: 415000000000,
    market_cap_rank: 2,
    total_volume: 18000000000,
    high_24h: 3520.0,
    low_24h: 3380.0,
    price_change_24h: 85.0,
    price_change_percentage_24h: 2.53,
    sparkline_in_7d: { price: [3300, 3350, 3320, 3400, 3420, 3390, 3450] }
  },
  {
    id: 'solana',
    symbol: 'sol',
    binanceSymbol: 'solusdt',
    name: 'Solana',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    current_price: 185.50,
    market_cap: 88000000000,
    market_cap_rank: 3,
    total_volume: 5200000000,
    high_24h: 192.00,
    low_24h: 179.00,
    price_change_24h: 5.20,
    price_change_percentage_24h: 2.88,
    sparkline_in_7d: { price: [172, 175, 178, 182, 180, 183, 185.5] }
  },
  {
    id: 'binancecoin',
    symbol: 'bnb',
    binanceSymbol: 'bnbusdt',
    name: 'BNB',
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    current_price: 645.0,
    market_cap: 94000000000,
    market_cap_rank: 4,
    total_volume: 1400000000,
    high_24h: 655.0,
    low_24h: 638.0,
    price_change_24h: 7.0,
    price_change_percentage_24h: 1.10,
    sparkline_in_7d: { price: [630, 635, 632, 640, 642, 639, 645] }
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    binanceSymbol: 'xrpusdt',
    name: 'XRP',
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    current_price: 2.35,
    market_cap: 134000000000,
    market_cap_rank: 5,
    total_volume: 7800000000,
    high_24h: 2.48,
    low_24h: 2.22,
    price_change_24h: 0.12,
    price_change_percentage_24h: 5.38,
    sparkline_in_7d: { price: [2.10, 2.15, 2.20, 2.18, 2.25, 2.30, 2.35] }
  },
  {
    id: 'cardano',
    symbol: 'ada',
    binanceSymbol: 'adausdt',
    name: 'Cardano',
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    current_price: 0.78,
    market_cap: 27000000000,
    market_cap_rank: 6,
    total_volume: 1100000000,
    high_24h: 0.82,
    low_24h: 0.75,
    price_change_24h: 0.03,
    price_change_percentage_24h: 4.00,
    sparkline_in_7d: { price: [0.72, 0.74, 0.73, 0.76, 0.75, 0.77, 0.78] }
  },
  {
    id: 'dogecoin',
    symbol: 'doge',
    binanceSymbol: 'dogeusdt',
    name: 'Dogecoin',
    image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    current_price: 0.28,
    market_cap: 41000000000,
    market_cap_rank: 7,
    total_volume: 3200000000,
    high_24h: 0.30,
    low_24h: 0.26,
    price_change_24h: 0.015,
    price_change_percentage_24h: 5.66,
    sparkline_in_7d: { price: [0.25, 0.26, 0.255, 0.27, 0.275, 0.272, 0.28] }
  },
  {
    id: 'avalanche-2',
    symbol: 'avax',
    binanceSymbol: 'avaxusdt',
    name: 'Avalanche',
    image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    current_price: 35.20,
    market_cap: 14200000000,
    market_cap_rank: 8,
    total_volume: 650000000,
    high_24h: 36.50,
    low_24h: 34.10,
    price_change_24h: 0.80,
    price_change_percentage_24h: 2.32,
    sparkline_in_7d: { price: [33, 34, 33.5, 34.8, 35, 34.9, 35.2] }
  },
  {
    id: 'chainlink',
    symbol: 'link',
    binanceSymbol: 'linkusdt',
    name: 'Chainlink',
    image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    current_price: 18.40,
    market_cap: 11200000000,
    market_cap_rank: 9,
    total_volume: 480000000,
    high_24h: 19.10,
    low_24h: 17.80,
    price_change_24h: 0.50,
    price_change_percentage_24h: 2.79,
    sparkline_in_7d: { price: [17.2, 17.6, 17.5, 18.0, 18.2, 18.1, 18.4] }
  },
  {
    id: 'polkadot',
    symbol: 'dot',
    binanceSymbol: 'dotusdt',
    name: 'Polkadot',
    image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    current_price: 7.45,
    market_cap: 10500000000,
    market_cap_rank: 10,
    total_volume: 350000000,
    high_24h: 7.80,
    low_24h: 7.20,
    price_change_24h: 0.15,
    price_change_percentage_24h: 2.05,
    sparkline_in_7d: { price: [7.1, 7.3, 7.2, 7.4, 7.5, 7.35, 7.45] }
  },
  {
    id: 'sui',
    symbol: 'sui',
    binanceSymbol: 'suiusdt',
    name: 'Sui',
    image: 'https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png',
    current_price: 3.25,
    market_cap: 9200000000,
    market_cap_rank: 11,
    total_volume: 950000000,
    high_24h: 3.45,
    low_24h: 3.10,
    price_change_24h: 0.12,
    price_change_percentage_24h: 3.84,
    sparkline_in_7d: { price: [2.9, 3.0, 3.1, 3.15, 3.2, 3.18, 3.25] }
  },
  {
    id: 'polygon-ecosystem-token',
    symbol: 'pol',
    binanceSymbol: 'polusdt',
    name: 'Polygon (POL)',
    image: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
    current_price: 0.58,
    market_cap: 5800000000,
    market_cap_rank: 12,
    total_volume: 280000000,
    high_24h: 0.61,
    low_24h: 0.56,
    price_change_24h: 0.01,
    price_change_percentage_24h: 1.75,
    sparkline_in_7d: { price: [0.55, 0.57, 0.56, 0.58, 0.59, 0.57, 0.58] }
  }
];

export async function fetchCryptoMarkets(): Promise<CryptoCoin[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=true&price_change_percentage=24h',
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`CoinGecko HTTP error: ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid CoinGecko response');
    }

    const mapped: CryptoCoin[] = data.map((item: any, index: number) => {
      const fallback = INITIAL_COINS[index] || {};
      return {
        id: item.id || fallback.id || item.symbol,
        symbol: (item.symbol || fallback.symbol || '').toLowerCase(),
        binanceSymbol: `${(item.symbol || fallback.symbol || '').toLowerCase()}usdt`,
        name: item.name || fallback.name || item.symbol,
        image: item.image || fallback.image || '',
        current_price: Number(item.current_price ?? fallback.current_price ?? 1),
        market_cap: Number(item.market_cap ?? fallback.market_cap ?? 1000),
        market_cap_rank: Number(item.market_cap_rank ?? fallback.market_cap_rank ?? (index + 1)),
        total_volume: Number(item.total_volume ?? fallback.total_volume ?? 100),
        high_24h: Number(item.high_24h ?? fallback.high_24h ?? item.current_price * 1.05),
        low_24h: Number(item.low_24h ?? fallback.low_24h ?? item.current_price * 0.95),
        price_change_24h: Number(item.price_change_24h ?? fallback.price_change_24h ?? 0),
        price_change_percentage_24h: Number(item.price_change_percentage_24h ?? fallback.price_change_percentage_24h ?? 0),
        sparkline_in_7d: item.sparkline_in_7d || fallback.sparkline_in_7d || { price: [item.current_price] },
      };
    });

    return mapped;
  } catch (err) {
    console.warn('CoinGecko API failed or rate-limited, using fallback crypto data:', err);
    return INITIAL_COINS;
  }
}

export async function fetchCryptoHistory(coinId: string, days = 7): Promise<CryptoHistoryPoint[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`CoinGecko chart HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const prices: [number, number][] = data.prices || [];

    return prices.map(([timestamp, price]) => {
      const d = new Date(timestamp);
      const dateStr = days <= 1
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
      return {
        timestamp,
        date: dateStr,
        price: Number(price),
      };
    });
  } catch (err) {
    console.warn(`Failed to fetch history for ${coinId}, generating simulated points:`, err);
    const points: CryptoHistoryPoint[] = [];
    const count = days <= 1 ? 24 : days === 7 ? 42 : 60;
    const basePrice = coinId === 'bitcoin' ? 91500 : coinId === 'ethereum' ? 3450 : 100;
    
    for (let i = count; i >= 0; i--) {
      const d = new Date();
      d.setHours(d.getHours() - (days <= 1 ? i : i * 4));
      const variation = Math.sin(i * 0.4) * 0.03 + (Math.random() - 0.5) * 0.015;
      const price = Number((basePrice * (1 + variation)).toFixed(2));
      points.push({
        timestamp: d.getTime(),
        date: days <= 1 ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { day: '2-digit', month: '2-digit' }),
        price,
      });
    }
    return points;
  }
}
