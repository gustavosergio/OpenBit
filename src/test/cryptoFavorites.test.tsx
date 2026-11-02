import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CryptoDashboard } from '../components/CryptoDashboard';
import { CryptoCoin } from '../types/crypto';

const bitcoin: CryptoCoin = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  binanceSymbol: 'btcusdt',
  image: '',
  current_price: 100,
  market_cap: 1000,
  market_cap_rank: 1,
  total_volume: 100,
  high_24h: 110,
  low_24h: 90,
  price_change_24h: 5,
  price_change_percentage_24h: 5,
};
const ethereum: CryptoCoin = {
  ...bitcoin,
  id: 'ethereum',
  symbol: 'eth',
  name: 'Ethereum',
  binanceSymbol: 'ethusdt',
  market_cap_rank: 2,
};
const props = {
  coins: [bitcoin, ethereum],
  livePrices: {},
  connected: false,
  loading: false,
  onRefresh: vi.fn(),
};

describe('crypto favorites', () => {
  it('toggles stars without opening details and filters the list', () => {
    render(<CryptoDashboard {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Bitcoin às favoritas' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(
      screen
        .getByRole('button', { name: 'Remover Bitcoin das favoritas' })
        .getAttribute('aria-pressed')
    ).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Favoritas' }));
    expect(screen.getByRole('article', { name: 'Bitcoin' })).toBeTruthy();
    expect(screen.queryByRole('article', { name: 'Ethereum' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Remover Bitcoin das favoritas' }));
    expect(screen.queryByRole('article')).toBeNull();
    expect(screen.getByText(/Nenhuma favorita disponível/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Favoritas' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('persists favorites by coin ID across visits and combines them with search', () => {
    const { unmount } = render(<CryptoDashboard {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Ethereum às favoritas' }));
    expect(JSON.parse(localStorage.getItem('openbit_crypto_favorites')!)).toEqual(['ethereum']);
    unmount();
    render(<CryptoDashboard {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Favoritas' }));
    expect(screen.getByRole('article', { name: 'Ethereum' })).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText(/Buscar cripto/), { target: { value: 'BTC' } });
    expect(screen.getByText('Nenhuma favorita encontrada para esta busca.')).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText(/Buscar cripto/), { target: { value: 'ETH' } });
    expect(screen.getByRole('article', { name: 'Ethereum' })).toBeTruthy();
  });

  it.each(['invalid json', '{}', '[null, 3]'])('handles invalid stored data: %s', (saved) => {
    localStorage.setItem('openbit_crypto_favorites', saved);
    render(<CryptoDashboard {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Favoritas' }));
    expect(screen.getByText(/Nenhuma favorita disponível/)).toBeTruthy();
  });

  it('keeps favorites usable when saving is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    render(<CryptoDashboard {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Bitcoin às favoritas' }));
    fireEvent.click(screen.getByRole('button', { name: 'Favoritas' }));
    expect(screen.getByRole('article', { name: 'Bitcoin' })).toBeTruthy();
    expect(screen.queryByRole('article', { name: 'Ethereum' })).toBeNull();
  });
});

describe('global catalog controls', () => {
  it('requests another page and resets to page one for the global search', async () => {
    vi.useFakeTimers();
    const onQueryChange = vi.fn();
    render(<CryptoDashboard {...props} total={120} onQueryChange={onQueryChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    expect(onQueryChange).toHaveBeenLastCalledWith({ page: 2, search: '', currency: 'USD' });
    fireEvent.change(screen.getByPlaceholderText(/Buscar cripto/), {
      target: { value: 'outside' },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(onQueryChange).toHaveBeenLastCalledWith({ page: 1, search: 'outside', currency: 'USD' });
  });
  it('sends all favorite IDs to the query instead of filtering only the visible page', () => {
    localStorage.setItem('openbit_crypto_favorites', '["off-page-coin"]');
    const onQueryChange = vi.fn();
    render(<CryptoDashboard {...props} total={120} onQueryChange={onQueryChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    fireEvent.click(screen.getByRole('button', { name: 'Favoritas' }));
    expect(onQueryChange).toHaveBeenLastCalledWith({
      page: 1,
      search: '',
      favoriteIds: ['off-page-coin'],
      currency: 'USD',
    });
  });
  it('does not apply a verified coin live price to another asset with the same symbol', () => {
    render(
      <CryptoDashboard
        {...props}
        coins={[{ ...bitcoin, id: 'other-bitcoin', name: 'Another token', binanceSymbol: '' }]}
        livePrices={{ BTC: { price: 999, dir: 'up' } }}
      />
    );
    expect(screen.getByRole('article', { name: 'Another token' }).textContent).not.toContain('999');
    expect(screen.getByText(/100,00/)).toBeTruthy();
  });
});

it('requests the selected currency, hides old quotes and does not use USDT ticks as BRL', () => {
  const onQueryChange = vi.fn();
  const { rerender } = render(<CryptoDashboard {...props} onQueryChange={onQueryChange} />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Moeda das criptomoedas' }), {
    target: { value: 'BRL' },
  });
  expect(onQueryChange).toHaveBeenLastCalledWith({ page: 1, search: '', currency: 'BRL' });
  expect(screen.queryByRole('article')).toBeNull();
  rerender(
    <CryptoDashboard
      {...props}
      currency="BRL"
      onQueryChange={onQueryChange}
      livePrices={{ BTC: { price: 999, dir: 'up' } }}
    />
  );
  expect(screen.getByRole('article', { name: 'Bitcoin' }).textContent).toContain('100,00');
  expect(screen.getByRole('article', { name: 'Bitcoin' }).textContent).not.toContain('999');
  expect(screen.getAllByText(/Último preço CoinGecko \(BRL\)/)).toHaveLength(2);
});
