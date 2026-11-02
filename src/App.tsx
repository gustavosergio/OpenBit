import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LiveTickerBar } from './components/LiveTickerBar';
import { ForexConverter } from './components/ForexConverter';
import { CryptoDashboard } from './components/CryptoDashboard';
import { AboutSection } from './components/AboutSection';
import { fetchForexRates, fetchForexHistory } from './services/forexService';
import { fetchCryptoMarkets } from './services/cryptoService';
import { useLivePrices } from './hooks/useLivePrices';
import { CryptoCoin } from './types/crypto';
import { ForexRates, ForexPeriod, ForexHistoryPoint } from './types/forex';

export function App() {
  const [activeTab, setActiveTab] = useState<'forex' | 'crypto' | 'about'>('forex');
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('openbit_theme') !== 'light';
    } catch {
      return true;
    }
  });
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('BRL');
  const [forex, setForex] = useState<ForexRates | null>(null);
  const [historyData, setHistoryData] = useState<ForexHistoryPoint[]>([]);
  const [historyPeriod, setHistoryPeriod] = useState<ForexPeriod>('30d');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [coins, setCoins] = useState<CryptoCoin[]>([]);
  const [forexError, setForexError] = useState('');
  const [cryptoError, setCryptoError] = useState('');
  const [loadingCrypto, setLoadingCrypto] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const { prices: livePrices, connected: wsConnected } = useLivePrices(coins);
  const rates = forex?.base === baseCurrency ? forex.rates : {};
  const lastUpdated = forex?.lastUpdated ?? '';
  const source =
    forex?.base === baseCurrency
      ? forex.source
      : forexError
        ? 'Indisponível'
        : 'Carregando taxas...';
  const handleRefreshAll = () => setRefresh((value) => value + 1);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem('openbit_theme', darkMode ? 'dark' : 'light');
    } catch {
      /* Storage is optional. */
    }
  }, [darkMode]);
  useEffect(() => {
    let cancelled = false;
    setForex(null);
    setForexError('');
    fetchForexRates(baseCurrency, refresh > 0, targetCurrency)
      .then((data) => {
        if (!cancelled) setForex(data);
      })
      .catch(() => {
        if (!cancelled) setForexError('Taxas indisponíveis. Tente atualizar novamente.');
      });
    return () => {
      cancelled = true;
    };
  }, [baseCurrency, targetCurrency, refresh]);
  useEffect(() => {
    let cancelled = false;
    setCryptoError('');
    setCoins([]);
    setLoadingCrypto(true);
    fetchCryptoMarkets(refresh > 0)
      .then((data) => {
        if (!cancelled) setCoins(data);
      })
      .catch(() => {
        if (!cancelled) setCryptoError('Criptomoedas indisponíveis. Tente atualizar novamente.');
      })
      .finally(() => {
        if (!cancelled) setLoadingCrypto(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refresh]);
  useEffect(() => {
    let cancelled = false;
    setHistoryData([]);
    setLoadingHistory(true);
    fetchForexHistory(baseCurrency, targetCurrency, historyPeriod, refresh > 0)
      .then((data) => {
        if (!cancelled) setHistoryData(data);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });
    return () => {
      cancelled = true;
    };
  }, [baseCurrency, targetCurrency, historyPeriod, refresh]);

  return (
    <div
      className={`min-h-screen bg-dark-bg text-slate-100 flex flex-col selection:bg-brand-500 selection:text-black ${darkMode ? 'dark' : ''}`}
    >
      {/* Top Live Ticker */}
      <LiveTickerBar coins={coins} prices={livePrices} connected={wsConnected} />

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'forex' && forexError && (
          <p role="alert" className="mb-4 text-red-400">
            {forexError}
          </p>
        )}
        {activeTab === 'crypto' && cryptoError && (
          <p role="alert" className="mb-4 text-red-400">
            {cryptoError}
          </p>
        )}
        {activeTab === 'forex' && (
          <ForexConverter
            rates={rates}
            baseCurrency={baseCurrency}
            targetCurrency={targetCurrency}
            setBaseCurrency={setBaseCurrency}
            setTargetCurrency={setTargetCurrency}
            lastUpdated={lastUpdated}
            source={source}
            onRefresh={handleRefreshAll}
            historyData={historyData}
            historyPeriod={historyPeriod}
            setHistoryPeriod={setHistoryPeriod}
            loadingHistory={loadingHistory}
          />
        )}

        {activeTab === 'crypto' && (
          <CryptoDashboard
            coins={coins}
            connected={wsConnected}
            loading={loadingCrypto}
            livePrices={livePrices}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'about' && <AboutSection />}
      </main>

      {/* Footer */}
      <footer className="bg-dark-card border-t border-dark-border py-8 mt-12 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="flex items-center justify-center space-x-1">
            <span>OpenBit v2.0 • Desenvolvido com</span>
            <span className="text-brand-500 font-bold">React & TypeScript</span>
            <span>por Gustavo Sérgio</span>
          </p>
          <p className="text-slate-500">
            Licença MIT • Hospedado no GitHub Pages ({' '}
            <a
              href="https://github.com/gustavosergio/OpenBit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              github.com/gustavosergio/OpenBit
            </a>{' '}
            ) •{' '}
            <a
              href="https://www.linkedin.com/in/gustavo-sérgio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              LinkedIn de Gustavo Sérgio
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
