import React, { useState } from 'react';
import { Search, Star, ArrowDownUp, RefreshCw, TrendingUp, ShieldCheck } from 'lucide-react';
import { ForexHistoryPoint, ForexPeriod } from '../types/forex';
import { ALL_CURRENCIES, getCurrencyMeta } from '../utils/flags';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import { triggerConfetti } from '../utils/confetti';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface ForexConverterProps {
  rates: Record<string, number>;
  baseCurrency: string;
  targetCurrency: string;
  setBaseCurrency: (c: string) => void;
  setTargetCurrency: (c: string) => void;
  lastUpdated: string;
  source: string;
  onRefresh: () => void;
  historyData: ForexHistoryPoint[];
  historyPeriod: ForexPeriod;
  setHistoryPeriod: (p: ForexPeriod) => void;
  loadingHistory: boolean;
}

export const ForexConverter: React.FC<ForexConverterProps> = ({
  rates,
  baseCurrency,
  targetCurrency,
  setBaseCurrency,
  setTargetCurrency,
  lastUpdated,
  source,
  onRefresh,
  historyData,
  historyPeriod,
  setHistoryPeriod,
  loadingHistory,
}) => {
  const [amount, setAmount] = useState<string>('100');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('openbit_forex_favorites');
      return saved ? JSON.parse(saved) : ['USD', 'EUR', 'BTC', 'GBP'];
    } catch {
      return ['USD', 'EUR', 'BTC', 'GBP'];
    }
  });

  const [baseSearchOpen, setBaseSearchOpen] = useState(false);
  const [targetSearchOpen, setTargetSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const baseRate = rates[baseCurrency] || 1;
  const targetRate = rates[targetCurrency] || 1;

  // Convert amount via USD base: value in USD = numAmount / baseRate. Then target = usd * targetRate
  const convertedValue = baseCurrency === targetCurrency ? numAmount : (numAmount / baseRate) * targetRate;
  const exchangeRate = baseCurrency === targetCurrency ? 1 : (1 / baseRate) * targetRate;

  const baseMeta = getCurrencyMeta(baseCurrency);
  const targetMeta = getCurrencyMeta(targetCurrency);

  const toggleFavorite = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(code)) {
      updated = favorites.filter((c) => c !== code);
    } else {
      updated = [...favorites, code];
      triggerConfetti();
    }
    setFavorites(updated);
    try {
      localStorage.setItem('openbit_forex_favorites', JSON.stringify(updated));
    } catch {}
  };

  const handleInvert = () => {
    const temp = baseCurrency;
    setBaseCurrency(targetCurrency);
    setTargetCurrency(temp);
  };

  const filteredCurrencies = ALL_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Banner & Status */}
      <div className="bg-gradient-to-r from-dark-card to-dark-subtle border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-brand-500 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-brand-accent" />
            <span>Taxas Oficiais em Tempo Real</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Conversor Global de Câmbio</h1>
          <p className="text-sm text-slate-400 mt-1">
            Fonte: <span className="text-slate-200 font-medium">{source}</span>
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-dark-bg/60 border border-dark-border px-4 py-3 rounded-xl">
          <div className="text-right">
            <p className="text-[11px] text-slate-400">Última atualização</p>
            <p className="text-xs font-mono font-semibold text-slate-200">{new Date(lastUpdated).toLocaleTimeString()}</p>
          </div>
          <button
            onClick={onRefresh}
            className="w-9 h-9 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 flex items-center justify-center transition-colors"
            title="Atualizar taxas"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Converter Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Conversion Panel */}
        <div className="lg:col-span-7 bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="absolute top-4 right-6 text-xs font-mono text-slate-500 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-ping"></span>
            <span>Taxas Ativas</span>
          </div>

          <div className="space-y-6">
            
            {/* From Currency Block */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Moeda de Origem</label>
              <div className="flex items-center space-x-3 bg-dark-bg border border-dark-border hover:border-brand-500/50 rounded-2xl p-4 transition-colors">
                <button
                  onClick={() => {
                    setBaseSearchOpen(true);
                    setTargetSearchOpen(false);
                  }}
                  className="flex items-center space-x-2 bg-dark-card border border-dark-border px-3 py-2 rounded-xl text-slate-200 font-bold hover:bg-dark-hover transition-colors shrink-0"
                >
                  <span className="text-xl">{baseMeta.flag}</span>
                  <span className="font-mono">{baseCurrency}</span>
                  <span className="text-xs text-slate-400">▼</span>
                </button>

                <div className="flex-1 text-right">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent text-right font-mono text-2xl sm:text-3xl font-bold text-slate-100 focus:outline-none"
                    placeholder="0.00"
                  />
                  <span className="text-xs text-slate-400 font-medium">{baseMeta.name}</span>
                </div>
              </div>
            </div>

            {/* Invert Button */}
            <div className="flex justify-center -my-3 relative z-10">
              <button
                onClick={handleInvert}
                className="w-12 h-12 rounded-2xl bg-brand-500 hover:bg-brand-400 text-dark-bg font-bold flex items-center justify-center shadow-lg shadow-brand-500/30 hover:rotate-180 transition-all duration-300"
                title="Inverter moedas"
              >
                <ArrowDownUp className="w-5 h-5" />
              </button>
            </div>

            {/* To Currency Block */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Moeda de Destino</label>
              <div className="flex items-center space-x-3 bg-dark-bg border border-dark-border hover:border-brand-500/50 rounded-2xl p-4 transition-colors">
                <button
                  onClick={() => {
                    setTargetSearchOpen(true);
                    setBaseSearchOpen(false);
                  }}
                  className="flex items-center space-x-2 bg-dark-card border border-dark-border px-3 py-2 rounded-xl text-slate-200 font-bold hover:bg-dark-hover transition-colors shrink-0"
                >
                  <span className="text-xl">{targetMeta.flag}</span>
                  <span className="font-mono">{targetCurrency}</span>
                  <span className="text-xs text-slate-400">▼</span>
                </button>

                <div className="flex-1 text-right">
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-brand-400 truncate">
                    {formatCurrency(convertedValue, targetCurrency)}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{targetMeta.name}</span>
                </div>
              </div>
            </div>

            {/* Exchange Rate Summary */}
            <div className="bg-dark-bg/60 border border-dark-border rounded-xl p-4 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Taxa de Câmbio:</span>
              <span className="font-bold text-slate-200">
                1 {baseCurrency} = {exchangeRate.toFixed(4)} {targetCurrency}
              </span>
            </div>

            {/* Favorites Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                  <span>Favoritos Salvos</span>
                </span>
                <span className="text-[11px] text-slate-500">Clique para alternar destino</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {favorites.map((fav) => {
                  const meta = getCurrencyMeta(fav);
                  const isSelected = targetCurrency === fav;
                  return (
                    <button
                      key={fav}
                      onClick={() => setTargetCurrency(fav)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                        isSelected
                          ? 'bg-brand-500 text-dark-bg border-brand-500 shadow-md shadow-brand-500/20'
                          : 'bg-dark-bg border-dark-border hover:border-slate-500 text-slate-300'
                      }`}
                    >
                      <span>{meta.flag}</span>
                      <span>{fav}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: History & Chart */}
        <div className="lg:col-span-5 bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-lg text-slate-100">Histórico do Par</h3>
              </div>
              <div className="flex space-x-1 bg-dark-bg p-1 rounded-xl border border-dark-border">
                {(['7d', '30d', '90d'] as ForexPeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setHistoryPeriod(period)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      historyPeriod === period
                        ? 'bg-brand-500 text-dark-bg'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Variação histórica para <span className="text-slate-200 font-bold">{baseCurrency}/{targetCurrency}</span>
            </p>
          </div>

          <div className="h-64 my-4 relative flex items-center justify-center">
            {loadingHistory ? (
              <div className="flex flex-col items-center space-y-2 text-brand-500">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-xs font-medium text-slate-400">Carregando histórico...</span>
              </div>
            ) : historyData.length === 0 ? (
              <p className="text-xs text-slate-500">Sem dados históricos disponíveis.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="forexGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(val) => formatShortDate(val)} />
                  <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} tickFormatter={(val) => val.toFixed(2)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121824', borderColor: '#2A364F', borderRadius: '12px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: any) => [Number(value).toFixed(4), `${baseCurrency}/${targetCurrency}`]}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#forexGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-dark-bg/60 border border-dark-border rounded-xl p-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Par ativo: <strong className="text-slate-200">{baseCurrency} ⇄ {targetCurrency}</strong></span>
            <span className="text-brand-500 font-semibold">Atualização Automática</span>
          </div>
        </div>

      </div>

      {/* Currency Selection Modal / Search Drawer */}
      {(baseSearchOpen || targetSearchOpen) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">
                Selecionar Moeda ({baseSearchOpen ? 'Origem' : 'Destino'})
              </h3>
              <button
                onClick={() => {
                  setBaseSearchOpen(false);
                  setTargetSearchOpen(false);
                }}
                className="w-8 h-8 rounded-xl bg-dark-hover hover:bg-dark-border text-slate-400 hover:text-slate-200 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código ou nome (ex: BRL, Real)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                autoFocus
              />
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {filteredCurrencies.map((c) => {
                const isFav = favorites.includes(c.code);
                return (
                  <div
                    key={c.code}
                    onClick={() => {
                      if (baseSearchOpen) setBaseCurrency(c.code);
                      else setTargetCurrency(c.code);
                      setBaseSearchOpen(false);
                      setTargetSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-dark-bg hover:bg-dark-hover border border-dark-border cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-100">{c.code}</span>
                          <span className="text-xs text-slate-400 font-medium">{c.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => toggleFavorite(c.code, e)}
                        className={`p-2 rounded-lg transition-colors ${
                          isFav ? 'text-brand-500 bg-brand-500/10' : 'text-slate-600 hover:text-slate-400'
                        }`}
                        title="Favoritar"
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-brand-500' : ''}`} />
                      </button>
                      <span className="text-xs text-slate-500 group-hover:text-brand-400 font-mono font-bold">Selecionar →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
