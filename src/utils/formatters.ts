export function formatCurrency(
  value: number,
  currencyCode = 'BRL',
  locale = 'pt-BR'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode.length === 3 && currencyCode !== 'BTC' && currencyCode !== 'ETH' ? currencyCode : 'USD',
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale = 'pt-BR'
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return value.toLocaleString();
  }
}

export function formatPercent(value: number, locale = 'pt-BR'): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(value / 100);
  return formatted;
}

export function formatDate(dateStr: string, locale = 'pt-BR'): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string, locale = 'pt-BR'): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  } catch {
    return dateStr;
  }
}
