export interface CryptoCoin {
  id: string;
  symbol: string;         // e.g. 'btc'
  binanceSymbol: string;  // e.g. 'btcusdt'
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
  lastPriceDirection?: 'up' | 'down' | 'neutral';
  lastPriceTimestamp?: number;
}

export type CryptoSortOption = 'rank' | 'price' | 'change24h' | 'name' | 'volume';

export interface CryptoTickerData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
}

export interface CryptoHistoryPoint {
  timestamp: number;
  date: string;
  price: number;
}
