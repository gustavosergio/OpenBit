import { useDialog } from '../hooks/useDialog';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Star, TrendingUp, TrendingDown, RefreshCw, Zap, ExternalLink } from 'lucide-react';
import { CryptoCoin, CryptoSortOption, CryptoHistoryPoint } from '../types/crypto';
import { formatCurrency } from '../utils/formatters';
import { triggerGoldenRain } from '../utils/confetti';
import { fetchCryptoHistory, CryptoQuery, CRYPTO_PAGE_SIZE } from '../services/cryptoService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface CryptoDashboardProps {
  coins: CryptoCoin[];
  livePrices: Record<string, { price: number; dir: 'up' | 'down' | 'neutral' }>;
  onRefresh: () => void;
  connected: boolean;
  loading: boolean;
  total?: number;
  onQueryChange?: (query: CryptoQuery) => void;
}

export const CryptoDashboard: React.FC<CryptoDashboardProps> = ({
  coins,
  livePrices,
  onRefresh,
  connected,
  loading,
  total = coins.length,
  onQueryChange,
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const searching = Boolean(onQueryChange) && search.trim() !== debouncedSearch;
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);
  const [sortOption, setSortOption] = useState<CryptoSortOption>('rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('openbit_crypto_favorites') ?? '[]');
      return Array.isArray(saved)
        ? [...new Set(saved.filter((id): id is string => typeof id === 'string'))]
        : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('openbit_crypto_favorites', JSON.stringify(favorites));
    } catch {
      // Favorites remain available for this visit if storage is blocked.
    }
  }, [favorites]);
  useEffect(() => {
    onQueryChange?.({
      page,
      search: debouncedSearch,
      ...(favoritesOnly ? { favoriteIds: favorites } : {}),
    });
  }, [page, debouncedSearch, favoritesOnly, favorites, onQueryChange]);
  const toggleFavorite = (id: string) => {
    if (favoritesOnly) setPage(1);
    setFavorites((previous) =>
      previous.includes(id) ? previous.filter((favorite) => favorite !== id) : [...previous, id]
    );
  };
  const [selectedCoin, setSelectedCoin] = useState<CryptoCoin | null>(null);
  const closeDialog = useCallback(() => setSelectedCoin(null), []);
  useDialog(selectedCoin !== null, closeDialog);
  const [coinHistory, setCoinHistory] = useState<CryptoHistoryPoint[]>([]);
  const [historyDays, setHistoryDays] = useState<number>(7);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Track ATH alert trigger to avoid repeat confetti every single tick
  const notifiedAthRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    // Check if any coin hit new 24h high live
    coins.forEach((c) => {
      const sym = c.symbol.toUpperCase();
      const live = c.binanceSymbol ? livePrices[sym] : undefined;
      if (live && c.high_24h > 0 && live.price > c.high_24h && !notifiedAthRef.current[sym]) {
        notifiedAthRef.current[sym] = true;
        triggerGoldenRain();
      }
    });
  }, [livePrices, coins]);

  useEffect(() => {
    let cancelled = false;
    setCoinHistory([]);
    if (!selectedCoin) {
      setLoadingHistory(false);
      return;
    }
    setLoadingHistory(true);
    fetchCryptoHistory(selectedCoin.id, historyDays)
      .then((history) => {
        if (!cancelled) setCoinHistory(history);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCoin, historyDays]);
  const handleOpenDetail = (coin: CryptoCoin) => setSelectedCoin(coin);
  const handleDaysChange = (days: number) => setHistoryDays(days);

  const filtered = coins.filter(
    (c) =>
      (!favoritesOnly || favorites.includes(c.id)) &&
      (c.id.toLowerCase().includes(search.trim().toLowerCase()) ||
        c.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.trim().toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    let valA = 0;
    let valB = 0;
    switch (sortOption) {
      case 'rank':
        valA = a.market_cap_rank || Number.MAX_SAFE_INTEGER;
        valB = b.market_cap_rank || Number.MAX_SAFE_INTEGER;
        break;
      case 'price':
        valA =
          (a.binanceSymbol ? livePrices[a.symbol.toUpperCase()]?.price : undefined) ??
          a.current_price ??
          -1;
        valB =
          (b.binanceSymbol ? livePrices[b.symbol.toUpperCase()]?.price : undefined) ??
          b.current_price ??
          -1;
        break;
      case 'change24h':
        valA = a.price_change_percentage_24h;
        valB = b.price_change_percentage_24h;
        break;
      case 'name':
        return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      case 'volume':
        valA = a.total_volume;
        valB = b.total_volume;
        break;
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header & Controls */}
      <div className="bg-gradient-to-r from-dark-card to-dark-subtle border border-dark-border rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-brand-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-brand-500 fill-brand-500 animate-pulse" />
            <span>
              {connected
                ? 'Binance conectada • preços em USDT'
                : 'Preços de referência CoinGecko em USD'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Painel de Criptomoedas
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Preços em tempo real com piscar dinâmico e dados CoinGecko.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cripto (ex: BTC, Solana)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 border border-brand-500/30 flex items-center justify-center transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sorting Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-dark-card border border-dark-border rounded-2xl px-6 py-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>Ordenar esta página:</span>
          {(['rank', 'price', 'change24h', 'volume', 'name'] as CryptoSortOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => {
                if (sortOption === opt) setSortAsc(!sortAsc);
                else {
                  setSortOption(opt);
                  setSortAsc(opt === 'rank' || opt === 'name');
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                sortOption === opt
                  ? 'bg-brand-500 text-brand-ink'
                  : 'bg-dark-bg hover:bg-dark-hover text-slate-300 border border-dark-border'
              }`}
            >
              {opt === 'rank'
                ? 'Ranking'
                : opt === 'price'
                  ? 'Preço'
                  : opt === 'change24h'
                    ? '24h %'
                    : opt === 'volume'
                      ? 'Volume'
                      : 'Nome'}
              {sortOption === opt && (sortAsc ? ' ▲' : ' ▼')}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={favoritesOnly}
            onClick={() => {
              setFavoritesOnly((previous) => !previous);
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
              favoritesOnly
                ? 'bg-brand-500 border-brand-500 text-brand-ink'
                : 'bg-dark-bg hover:bg-dark-hover text-slate-300 border-dark-border'
            }`}
          >
            <Star
              aria-hidden="true"
              className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-current' : ''}`}
            />
            Favoritas
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Exibindo <strong className="text-slate-200">{sorted.length}</strong> ativos
          {onQueryChange && (
            <span>
              {' '}
              • {total.toLocaleString('pt-BR')} no catálogo
              {favoritesOnly || debouncedSearch ? ' filtrado' : ' completo'}
            </span>
          )}
        </div>
      </div>

      {(loading || searching) && (
        <p role="status" className="text-sm text-slate-400">
          Carregando criptomoedas...
        </p>
      )}
      {!loading && !searching && sorted.length === 0 && (
        <p role="status" className="text-sm text-slate-400">
          {favoritesOnly
            ? search.trim()
              ? 'Nenhuma favorita encontrada para esta busca.'
              : 'Nenhuma favorita disponível. Marque a estrela nos ativos para vê-los aqui.'
            : 'Nenhum ativo disponível para esta busca.'}
        </p>
      )}
      {/* Crypto Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sorted.map((coin) => {
          const sym = coin.symbol.toUpperCase();
          const live = coin.binanceSymbol ? livePrices[sym] : undefined;
          const currentPrice = live ? live.price : coin.current_price;
          const isUp = live?.dir === 'up';
          const isDown = live?.dir === 'down';
          const change24h = coin.price_change_percentage_24h;

          return (
            <article
              key={coin.id}
              aria-label={coin.name}
              className={`bg-dark-card border border-dark-border hover:border-brand-500/50 rounded-3xl p-6 shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 relative group ${
                isUp ? 'animate-flash-green' : isDown ? 'animate-flash-red' : ''
              }`}
            >
              <button
                type="button"
                aria-label={`Ver detalhes de ${coin.name}`}
                onClick={() => handleOpenDetail(coin)}
                className="absolute inset-0 z-10 rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {coin.image ? (
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-10 h-10 rounded-full bg-dark-bg p-1 border border-dark-border"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="w-10 h-10 shrink-0 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold"
                    >
                      {coin.symbol.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-slate-100">{sym}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {coin.market_cap_rank > 0 ? '#' + coin.market_cap_rank : 'Sem ranking'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{coin.name}</p>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-1 text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                    change24h >= 0
                      ? 'text-brand-accent bg-brand-accent/10'
                      : 'text-red-400 bg-red-400/10'
                  }`}
                >
                  {change24h >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {change24h >= 0 ? '+' : ''}
                    {change24h.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-1 my-4">
                <p className="text-xs text-slate-400 font-medium">
                  {live ? 'Preço ao vivo (USDT ≈ USD)' : 'Último preço CoinGecko (USD)'}
                </p>
                <div className="font-mono text-2xl font-extrabold text-slate-100">
                  {currentPrice !== null
                    ? formatCurrency(currentPrice, 'USD')
                    : 'Cotação indisponível'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-dark-border text-xs font-mono text-slate-400">
                <div>
                  <span className="block text-[10px] text-slate-500">Mkt Cap</span>
                  <span className="text-slate-300 font-semibold">
                    ${(coin.market_cap / 1e9).toFixed(2)}B
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-500">Máx 24h</span>
                  <span className="text-slate-300 font-semibold">
                    ${coin.high_24h > 0 ? coin.high_24h.toLocaleString() : '—'}
                  </span>
                </div>
              </div>

              {/* Sparkline preview or bottom action */}
              <div className="mt-4 pt-3 border-t border-dark-border/60 flex items-center justify-between text-xs font-semibold text-brand-400 group-hover:text-brand-300">
                <span>Ver gráficos & detalhes</span>
                <button
                  type="button"
                  aria-label={`${favorites.includes(coin.id) ? 'Remover' : 'Adicionar'} ${coin.name} ${favorites.includes(coin.id) ? 'das' : 'às'} favoritas`}
                  aria-pressed={favorites.includes(coin.id)}
                  onClick={() => toggleFavorite(coin.id)}
                  className={`relative z-20 flex items-center justify-center w-10 h-10 rounded-xl border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                    favorites.includes(coin.id)
                      ? 'text-brand-500 bg-brand-500/10 border-brand-500/30'
                      : 'text-slate-400 bg-dark-bg border-dark-border hover:text-brand-500 hover:border-brand-500/50'
                  }`}
                >
                  <Star
                    aria-hidden="true"
                    className={`w-5 h-5 ${favorites.includes(coin.id) ? 'fill-current' : ''}`}
                  />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {onQueryChange && (
        <nav
          aria-label="Paginação de criptomoedas"
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            type="button"
            disabled={loading || searching || page <= 1}
            onClick={() => setPage((previous) => previous - 1)}
            className="px-4 py-2 rounded-xl border border-dark-border text-slate-200 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-400">
            Página {page} de {Math.max(1, Math.ceil(total / CRYPTO_PAGE_SIZE))}
          </span>
          <button
            type="button"
            disabled={loading || page * CRYPTO_PAGE_SIZE >= total}
            onClick={() => setPage((previous) => previous + 1)}
            className="px-4 py-2 rounded-xl border border-dark-border text-slate-200 disabled:opacity-40"
          >
            Próxima
          </button>
        </nav>
      )}
      {/* Coin Detail Modal */}
      {selectedCoin && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Detalhes da criptomoeda"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-dark-card border border-dark-border w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedCoin.image ? (
                  <img
                    src={selectedCoin.image}
                    alt={selectedCoin.name}
                    className="w-12 h-12 rounded-full bg-dark-bg p-1 border border-dark-border"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="w-12 h-12 shrink-0 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold"
                  >
                    {selectedCoin.symbol.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-black text-slate-100">{selectedCoin.name}</h2>
                    <span className="font-mono text-xs font-bold bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded border border-brand-500/30">
                      {selectedCoin.symbol.toUpperCase()}/
                      {selectedCoin.binanceSymbol && livePrices[selectedCoin.symbol.toUpperCase()]
                        ? 'USDT'
                        : 'USD'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Ranking global #{selectedCoin.market_cap_rank}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCoin(null)}
                aria-label="Fechar detalhes"
                className="w-10 h-10 rounded-2xl bg-dark-hover hover:bg-dark-border text-slate-400 hover:text-slate-200 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Price banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-dark-bg p-4 rounded-2xl border border-dark-border font-mono">
              <div>
                <span className="text-[11px] text-slate-500 block">Preço Atual</span>
                <span className="text-lg font-bold text-slate-100">
                  {(() => {
                    const price =
                      (selectedCoin.binanceSymbol
                        ? livePrices[selectedCoin.symbol.toUpperCase()]?.price
                        : undefined) ?? selectedCoin.current_price;
                    return price !== null ? formatCurrency(price, 'USD') : 'Indisponível';
                  })()}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Variação 24h</span>
                <span
                  className={`text-lg font-bold ${selectedCoin.price_change_percentage_24h >= 0 ? 'text-brand-accent' : 'text-red-400'}`}
                >
                  {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}
                  {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Máxima 24h</span>
                <span className="text-lg font-bold text-slate-300">
                  ${selectedCoin.high_24h.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Mínima 24h</span>
                <span className="text-lg font-bold text-slate-300">
                  ${selectedCoin.low_24h.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Chart Period Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200 text-sm">Histórico de Preços</h3>
                <div className="flex space-x-1 bg-dark-bg p-1 rounded-xl border border-dark-border">
                  {[
                    { label: '24h', days: 1 },
                    { label: '7D', days: 7 },
                    { label: '30D', days: 30 },
                    { label: '90D', days: 90 },
                  ].map((p) => (
                    <button
                      key={p.days}
                      onClick={() => handleDaysChange(p.days)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        historyDays === p.days
                          ? 'bg-brand-500 text-brand-ink'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-72 w-full bg-dark-bg/60 border border-dark-border rounded-2xl p-4 flex items-center justify-center">
                {loadingHistory ? (
                  <div className="flex flex-col items-center space-y-2 text-brand-500">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span className="text-xs text-slate-400">Carregando gráfico CoinGecko...</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={coinHistory}>
                      <defs>
                        <linearGradient id="cryptoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                      <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => `$${val}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgb(var(--surface-card))',
                          borderColor: 'rgb(var(--surface-border))',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: 'rgb(var(--text-muted))' }}
                        formatter={(value) => [formatCurrency(Number(value), 'USD'), 'Preço']}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#cryptoGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-dark-border">
              <a
                href={`https://www.coingecko.com/en/coins/${selectedCoin.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold"
              >
                <span>Ver no CoinGecko</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedCoin(null)}
                className="px-5 py-2.5 rounded-xl bg-dark-hover hover:bg-dark-border text-slate-300 font-bold text-xs transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
