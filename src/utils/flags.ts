import { Currency } from '../types/forex';

export const POPULAR_CURRENCIES: Currency[] = [
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', flag: '🇧🇷' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Iene Japonês', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Franco Suíço', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Yuan Chinês', symbol: '¥', flag: '🇨🇳' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
  { code: 'BTC', name: 'Bitcoin (Crypto)', symbol: '₿', flag: '₿' },
  { code: 'ETH', name: 'Ethereum (Crypto)', symbol: 'Ξ', flag: 'Ξ' },
];

export const ALL_CURRENCIES: Currency[] = [
  ...POPULAR_CURRENCIES,
  { code: 'NZD', name: 'Dólar Neozelandês', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'SEK', name: 'Coroa Sueca', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Coroa Norueguesa', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Coroa Dinamarquesa', symbol: 'kr', flag: '🇩🇰' },
  { code: 'SGD', name: 'Dólar de Cingapura', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD', name: 'Dólar de Hong Kong', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'KRW', name: 'Won Sul-Coreano', symbol: '₩', flag: '🇰🇷' },
  { code: 'INR', name: 'Rúpia Indiana', symbol: '₹', flag: '🇮🇳' },
  { code: 'TRY', name: 'Lira Turca', symbol: '₺', flag: '🇹🇷' },
  { code: 'ZAR', name: 'Rand Sul-Africano', symbol: 'R', flag: '🇿🇦' },
  { code: 'PLN', name: 'Zloty Polonês', symbol: 'zł', flag: '🇵🇱' },
  { code: 'THB', name: 'Baht Tailandês', symbol: '฿', flag: '🇹🇭' },
  { code: 'ILS', name: 'Novo Shekel Israelense', symbol: '₪', flag: '🇮🇱' },
];

export function getCurrencyMeta(code: string): Currency {
  const found = ALL_CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  if (found) return found;
  return {
    code: code.toUpperCase(),
    name: code.toUpperCase(),
    symbol: code.toUpperCase(),
    flag: '🌐',
  };
}
