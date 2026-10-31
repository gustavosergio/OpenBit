import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, RefreshCw, Zap, ExternalLink } from 'lucide-react';
import { CryptoCoin, CryptoSortOption } from '../types/crypto';
import { formatCurrency } from '../utils/formatters';
import { triggerGoldenRain } from '../utils/confetti';
import { fetchCryptoHistory } from '../services/cryptoService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface CryptoDashboardProps {
  coins: CryptoCoin[];
  livePrices: Record<string, { price: number; dir: 'up' | 'down' | 'neutral' }>;
  onRefresh: () => void;
}

export const CryptoDashboard: React.FC<CryptoDashboardProps> = ({
  coins,
  livePrices,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<CryptoSortOption>('rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<CryptoCoin | null>(null);
  const [coinHistory, setCoinHistory] = useState<any[]>([]);
  const [historyDays, setHistoryDays] = useState<number>(7);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Track ATH alert trigger to avoid repeat confetti every single tick
  const notifiedAthRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    // Check if any coin hit new 24h high live
    coins.forEach((c) => {
      const sym = c.symbol.toUpperCase();
      const live = livePrices[sym];
      if (live && live.price >= c.high_24h && !notifiedAthRef.current[sym]) {
        notifiedAthRef.current[sym] = true;
        triggerGoldenRain();
      }
    });
  }, [livePrices, coins]);

  const handleOpenDetail = async (coin: CryptoCoin) => {
    setSelectedCoin(coin);
    setLoadingHistory(true);
    const hist = await fetchCryptoHistory(coin.id, historyDays);
    setCoinHistory(hist);
    setLoadingHistory(false);
  };

  const handleDaysChange = async (days: number) => {
    if (!selectedCoin) return;
    setHistoryDays(days);
    setLoadingHistory(true);
    const hist = await fetchCryptoHistory(selectedCoin.id, days);
    setCoinHistory(hist);
    setLoadingHistory(false);
  };

  const filtered = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let valA = 0;
    let valB = 0;
    switch (sortOption) {
      case 'rank':
        valA = a.market_cap_rank;
        valB = b.market_cap_rank;
        break;
      case 'price':
        valA = a.current_price;
        valB = b.current_price;
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
            <span>Binance WebSocket Stream Ativo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Painel de Criptomoedas</h1>
          <p className="text-sm text-slate-400 mt-1">Preços em tempo real com piscar dinâmico e dados CoinGecko.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cripto (ex: BTC, Solana)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>Ordenar por:</span>
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
                sortOption === opt ? 'bg-brand-500 text-dark-bg' : 'bg-dark-bg hover:bg-dark-hover text-slate-300 border border-dark-border'
              }`}
            >
              {opt === 'rank' ? 'Ranking' : opt === 'price' ? 'Preço' : opt === 'change24h' ? '24h %' : opt === 'volume' ? 'Volume' : 'Nome'}
              {sortOption === opt && (sortAsc ? ' ▲' : ' ▼')}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Exibindo <strong className="text-slate-200">{sorted.length}</strong> ativos
        </div>
      </div>

      {/* Crypto Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sorted.map((coin) => {
          const sym = coin.symbol.toUpperCase();
          const live = livePrices[sym];
          const currentPrice = live ? live.price : coin.current_price;
          const isUp = live?.dir === 'up';
          const isDown = live?.dir === 'down';
          const change24h = coin.price_change_percentage_24h;

          return (
            <div
              key={coin.id}
              onClick={() => handleOpenDetail(coin)}
              className={`bg-dark-card border border-dark-border hover:border-brand-500/50 rounded-3xl p-6 shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 relative group ${
                isUp ? 'animate-flash-green' : isDown ? 'animate-flash-red' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full bg-dark-bg p-1 border border-dark-border" />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-slate-100">{sym}</span>
                      <span className="text-[10px] text-slate-500 font-mono">#{coin.market_cap_rank}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{coin.name}</p>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-1 text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                    change24h >= 0 ? 'text-brand-accent bg-brand-accent/10' : 'text-red-400 bg-red-400/10'
                  }`}
                >
                  {change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%</span>
                </div>
              </div>

              <div className="space-y-1 my-4">
                <p className="text-xs text-slate-400 font-medium">Preço ao Vivo (Binance)</p>
                <div className="font-mono text-2xl font-extrabold text-slate-100">
                  {formatCurrency(currentPrice, 'USD')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-dark-border text-xs font-mono text-slate-400">
                <div>
                  <span className="block text-[10px] text-slate-500">Mkt Cap</span>
                  <span className="text-slate-300 font-semibold">${(coin.market_cap / 1e9).toFixed(2)}B</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-500">Máx 24h</span>
                  <span className="text-slate-300 font-semibold">${coin.high_24h.toLocaleString()}</span>
                </div>
              </div>

              {/* Sparkline preview or bottom action */}
              <div className="mt-4 pt-3 border-t border-dark-border/60 flex items-center justify-between text-xs font-semibold text-brand-400 group-hover:text-brand-300">
                <span>Ver gráficos & detalhes</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coin Detail Modal */}
      {selectedCoin && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={selectedCoin.image} alt={selectedCoin.name} className="w-12 h-12 rounded-full bg-dark-bg p-1 border border-dark-border" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-black text-slate-100">{selectedCoin.name}</h2>
                    <span className="font-mono text-xs font-bold bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded border border-brand-500/30">
                      {selectedCoin.symbol.toUpperCase()}/USDT
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Ranking global #{selectedCoin.market_cap_rank}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCoin(null)}
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
                  {formatCurrency(livePrices[selectedCoin.symbol.toUpperCase()]?.price || selectedCoin.current_price, 'USD')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Variação 24h</span>
                <span className={`text-lg font-bold ${selectedCoin.price_change_percentage_24h >= 0 ? 'text-brand-accent' : 'text-red-400'}`}>
                  {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}{selectedCoin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Máxima 24h</span>
                <span className="text-lg font-bold text-slate-300">${selectedCoin.high_24h.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Mínima 24h</span>
                <span className="text-lg font-bold text-slate-300">${selectedCoin.low_24h.toLocaleString()}</span>
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
                        historyDays === p.days ? 'bg-brand-500 text-dark-bg' : 'text-slate-400 hover:text-slate-200'
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
                      <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} tickFormatter={(val) => `$${val}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#121824', borderColor: '#2A364F', borderRadius: '12px', fontSize: '12px' }}
                        labelStyle={{ color: '#94a3b8' }}
                        formatter={(value: any) => [formatCurrency(Number(value), 'USD'), 'Preço']}
                      />
                      <Area type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#cryptoGrad)" />
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
