export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface ForexRates {
  base: string;
  date: string;
  rates: Record<string, number>;
  source: string;
  lastUpdated: string;
}

export interface ForexHistoryPoint {
  date: string;
  rate: number;
}

export type ForexPeriod = '7d' | '30d' | '90d';
