import { fireEvent, render, screen } from '@testing-library/react';
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
