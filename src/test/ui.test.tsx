import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ForexConverter } from '../components/ForexConverter';
import { useLivePrices } from '../hooks/useLivePrices';
import { CryptoCoin } from '../types/crypto';
import { formatShortDate } from '../utils/formatters';
vi.mock('../utils/confetti', () => ({ triggerConfetti: vi.fn(), triggerGoldenRain: vi.fn() }));
const props = {
  rates: { USD: 1, BRL: 5 },
  baseCurrency: 'USD',
  targetCurrency: 'BRL',
  setBaseCurrency: vi.fn(),
  setTargetCurrency: vi.fn(),
  lastUpdated: '2026-10-30T00:00:00Z',
  source: 'Test provider',
  onRefresh: vi.fn(),
  historyData: [],
  historyPeriod: '7d' as const,
  setHistoryPeriod: vi.fn(),
  loadingHistory: false,
};
describe('currency converter', () => {
  it('does not assume a missing rate is one', () => {
    render(<ForexConverter {...props} rates={{ USD: 1 }} />);
    expect(screen.getByText('Cotação indisponível para este par')).toBeTruthy();
    expect(screen.getByText('Indisponível')).toBeTruthy();
  });
  it('converts rates and rejects negative or empty amounts', () => {
    render(<ForexConverter {...props} />);
    expect(screen.getByText(/500,00/)).toBeTruthy();
    const input = screen.getByRole('spinbutton', { name: 'Valor a converter' });
    fireEvent.change(input, { target: { value: '-2' } });
    expect(screen.getByRole('alert')).toBeTruthy();
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByText('Indisponível')).toBeTruthy();
    fireEvent.change(input, { target: { value: '0' } });
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('handles corrupt favorites and removes unsupported saved currencies', () => {
    localStorage.setItem('openbit_forex_favorites', '{"not":"an array"}');
    const { unmount } = render(<ForexConverter {...props} />);
    expect(screen.getByText('Favoritos Salvos')).toBeTruthy();
    unmount();
    localStorage.setItem('openbit_forex_favorites', '["BTC", "USD", "USD", 1]');
    render(<ForexConverter {...props} />);
    expect(screen.queryByText('BTC')).toBeNull();
  });
  it('closes selection with Escape and restores focus', () => {
    render(<ForexConverter {...props} />);
    const origin = screen.getByRole('button', { name: /USD.*▼/ });
    origin.focus();
    fireEvent.click(origin);
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(origin);
    expect(document.body.style.overflow).toBe('');
  });
  it('keeps calendar dates on the same day in the user timezone', () => {
    expect(formatShortDate('2026-10-30')).toBe('30/10');
  });
});
const coin = { id: 'bitcoin', symbol: 'btc', binanceSymbol: 'btcusdt' } as CryptoCoin;
class FakeSocket {
  static instances: FakeSocket[] = [];
  onopen?: () => void;
  onclose?: () => void;
  onerror?: () => void;
  onmessage?: (event: { data: string }) => void;
  close = vi.fn(() => this.onclose?.());
  constructor(public url: string) {
    FakeSocket.instances.push(this);
  }
}
describe('live prices lifecycle', () => {
  it('avoids empty streams, rejects bad prices and cleans up timers', () => {
    vi.useFakeTimers();
    FakeSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeSocket);
    const { result, rerender, unmount } = renderHook(({ coins }) => useLivePrices(coins), {
      initialProps: { coins: [] as CryptoCoin[] },
    });
    expect(FakeSocket.instances).toHaveLength(0);
    rerender({ coins: [coin] });
    expect(FakeSocket.instances).toHaveLength(1);
    const socket = FakeSocket.instances[0];
    act(() => socket.onopen?.());
    expect(result.current.connected).toBe(true);
    act(() => socket.onmessage?.({ data: JSON.stringify({ data: { s: 'BTCUSDT', c: '100' } }) }));
    expect(result.current.prices.BTC.price).toBe(100);
    act(() => socket.onmessage?.({ data: JSON.stringify({ data: { s: 'BTCUSDT', c: 'NaN' } }) }));
    expect(result.current.prices.BTC.price).toBe(100);
    act(() => socket.onclose?.());
    expect(result.current.connected).toBe(false);
    expect(result.current.prices).toEqual({});
    unmount();
    act(() => vi.advanceTimersByTime(10000));
    expect(FakeSocket.instances).toHaveLength(1);
  });
});
vi.mock('../services/forexService', () => ({
  fetchForexRates: vi.fn(),
  fetchForexHistory: vi.fn().mockResolvedValue([]),
}));
vi.mock('../services/cryptoService', () => ({ fetchCryptoMarkets: vi.fn().mockResolvedValue([]) }));
import { fetchForexRates } from '../services/forexService';
import { fetchCryptoMarkets } from '../services/cryptoService';
import { App } from '../App';
import { ForexRates } from '../types/forex';
describe('application request ordering', () => {
  it('ignores late results from the previously selected base currency', async () => {
    let resolveUSD!: (value: ForexRates) => void;
    vi.mocked(fetchForexRates).mockImplementation((base) =>
      base === 'USD'
        ? new Promise((resolve) => {
            resolveUSD = resolve;
          })
        : Promise.resolve({
            base: 'EUR',
            rates: { EUR: 1, BRL: 6 },
            date: '2026-10-30',
            lastUpdated: '2026-10-30T00:00:00Z',
            source: 'EUR provider',
          })
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /USD.*▼/ }));
    fireEvent.click(screen.getByRole('button', { name: /EUR.*Euro.*Selecionar/ }));
    await waitFor(() => expect(screen.getByText('EUR provider')).toBeTruthy());
    await act(async () =>
      resolveUSD({
        base: 'USD',
        rates: { USD: 1, BRL: 5 },
        date: '2026-10-30',
        lastUpdated: '2026-10-30T00:00:00Z',
        source: 'Outdated USD provider',
      })
    );
    expect(screen.queryByText('Outdated USD provider')).toBeNull();
    expect(screen.getByText(/600,00/)).toBeTruthy();
    expect(fetchCryptoMarkets).toHaveBeenCalledTimes(1);
  });
  it('updates document theme and persists the choice', () => {
    vi.mocked(fetchForexRates).mockReturnValue(new Promise(() => {}));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Alternar tema' }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('openbit_theme')).toBe('light');
  });
});
