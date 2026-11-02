import { beforeEach, describe, expect, it, vi } from 'vitest';
const fetchMock = vi.fn();
const json = (data: unknown) => ({ ok: true, json: async () => data });
beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});

describe('forex data integrity', () => {
  it('validates rates and forces a fresh request on explicit refresh', async () => {
    const { fetchForexRates } = await import('./forexService');
    fetchMock.mockResolvedValue(
      json({ base: 'USD', date: '2026-10-30', rates: { BRL: 5, EUR: -1, GBP: 'bad' } })
    );
    expect((await fetchForexRates()).rates).toEqual({ USD: 1, BRL: 5 });
    await fetchForexRates();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fetchMock.mockResolvedValue(json({ base: 'USD', date: '2026-10-30', rates: { BRL: 6 } }));
    expect((await fetchForexRates('USD', true)).rates.BRL).toBe(6);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('uses the actual fallback base and publication timestamp', async () => {
    const { fetchForexRates } = await import('./forexService');
    fetchMock.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(
      json({
        result: 'success',
        base_code: 'BRL',
        rates: { USD: 0.2 },
        time_last_update_unix: 1793318400,
      })
    );
    const result = await fetchForexRates('BRL');
    expect(result.rates).toEqual({ BRL: 1, USD: 0.2 });
    expect(result.date).toBe(result.lastUpdated.slice(0, 10));
  });
  it('rejects outages instead of inventing exchange rates', async () => {
    const { fetchForexRates } = await import('./forexService');
    fetchMock.mockRejectedValue(new Error('offline'));
    await expect(fetchForexRates('EUR')).rejects.toThrow();
  });
  it('returns no fabricated history for outages or missing target rates', async () => {
    const { fetchForexHistory } = await import('./forexService');
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    expect(await fetchForexHistory('USD', 'ARS', '7d')).toEqual([]);
    fetchMock.mockResolvedValue(json({ rates: { '2026-10-29': { EUR: 0.9 } } }));
    expect(await fetchForexHistory('USD', 'BRL', '7d')).toEqual([]);
  });
  it('returns a constant identity rate without querying the API', async () => {
    const { fetchForexHistory } = await import('./forexService');
    expect((await fetchForexHistory('BRL', 'BRL', '90d')).map((point) => point.rate)).toEqual([
      1, 1,
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
describe('crypto data integrity', () => {
  it('maps exchange symbols by coin ID and rejects unrelated tokens', async () => {
    const { fetchCryptoMarkets } = await import('./cryptoService');
    fetchMock.mockResolvedValue(
      json([
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3000, market_cap: null },
        { id: 'unknown-token', symbol: 'btc', name: 'Fake Bitcoin', current_price: 100 },
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: null },
      ])
    );
    const coins = await fetchCryptoMarkets();
    expect(coins).toHaveLength(1);
    expect(coins[0]).toMatchObject({ id: 'ethereum', binanceSymbol: 'ethusdt', market_cap: 0 });
    expect(fetchMock.mock.calls[0][0]).toContain('ids=');
  });
  it('reports outages instead of showing demo prices', async () => {
    const { fetchCryptoMarkets, fetchCryptoHistory } = await import('./cryptoService');
    fetchMock.mockRejectedValue(new Error('offline'));
    await expect(fetchCryptoMarkets()).rejects.toThrow('offline');
    expect(await fetchCryptoHistory('bitcoin', 90)).toEqual([]);
  });
  it('drops malformed history points and sorts timestamps', async () => {
    const { fetchCryptoHistory } = await import('./cryptoService');
    fetchMock.mockResolvedValue(
      json({ prices: [[2000, 10], [1000, 9], [3000, -1], ['bad', 1], null] })
    );
    expect((await fetchCryptoHistory('bitcoin')).map((p) => [p.timestamp, p.price])).toEqual([
      [1000, 9],
      [2000, 10],
    ]);
  });
});
describe('network timeouts', () => {
  it('always releases timeout resources on request errors', async () => {
    vi.useFakeTimers();
    const { fetchJson } = await import('./http');
    fetchMock.mockRejectedValue(new Error('network'));
    await expect(fetchJson('https://example.test')).rejects.toThrow('network');
    expect(vi.getTimerCount()).toBe(0);
  });
  it('keeps the timeout active while reading the body', async () => {
    vi.useFakeTimers();
    const { fetchJson } = await import('./http');
    let signal: AbortSignal;
    fetchMock.mockImplementation(async (_url, options) => {
      signal = options.signal;
      return {
        ok: true,
        json: () =>
          new Promise((_resolve, reject) =>
            signal.addEventListener('abort', () => reject(new Error('aborted')))
          ),
      };
    });
    const assertion = expect(fetchJson('https://example.test', 50)).rejects.toThrow('aborted');
    await vi.advanceTimersByTimeAsync(50);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('fallback coverage', () => {
  it('uses the broader provider when the selected target is missing', async () => {
    const { fetchForexRates } = await import('./forexService');
    fetchMock
      .mockResolvedValueOnce(json({ base: 'USD', date: '2026-10-30', rates: { EUR: 0.9 } }))
      .mockResolvedValueOnce(
        json({
          result: 'success',
          base_code: 'USD',
          rates: { ARS: 1000 },
          time_last_update_unix: 1793318400,
        })
      );
    expect((await fetchForexRates('USD', false, 'ARS')).rates.ARS).toBe(1000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
