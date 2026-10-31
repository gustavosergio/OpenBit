import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { LiveTickerBar } from './components/LiveTickerBar';
import { ForexConverter } from './components/ForexConverter';
import { CryptoDashboard } from './components/CryptoDashboard';
import { AboutSection } from './components/AboutSection';
import { fetchForexRates, fetchForexHistory } from './services/forexService';
import { fetchCryptoMarkets } from './services/cryptoService';
import { CryptoCoin } from './types/crypto';
import { ForexPeriod, ForexHistoryPoint } from './types/forex';

export function App() {
  const [activeTab, setActiveTab] = useState<'forex' | 'crypto' | 'about'>('forex');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Forex state
  const [rates, setRates] = useState<Record<string, number>>({});
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [targetCurrency, setTargetCurrency] = useState<string>('BRL');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [source, setSource] = useState<string>('Frankfurter API');
  const [historyData, setHistoryData] = useState<ForexHistoryPoint[]>([]);
  const [historyPeriod, setHistoryPeriod] = useState<ForexPeriod>('30d');
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Crypto state
  const [coins, setCoins] = useState<CryptoCoin[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, { price: number; dir: 'up' | 'down' | 'neutral' }>>({});
  const [, setWsConnected] = useState<boolean>(false);
  const prevPricesRef = useRef<Record<string, number>>({});

  // Initial data loading
  useEffect(() => {
    loadForexData(baseCurrency);
    loadCryptoData();
  }, [baseCurrency]);

  // Load history when forex pair or period changes
  useEffect(() => {
    loadForexHistoryData(baseCurrency, targetCurrency, historyPeriod);
  }, [baseCurrency, targetCurrency, historyPeriod]);

  // Binance WebSocket for live dashboard prices
  useEffect(() => {
    if (coins.length === 0) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    let isSubscribed = true;

    const connectWs = () => {
      if (!isSubscribed) return;
      try {
        const streams = coins.map((c) => `${c.binanceSymbol}@ticker`).join('/');
        ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

        ws.onopen = () => {
          if (isSubscribed) setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const data = message.data;
            if (!data || !data.s || !data.c) return;

            const symbol = data.s.replace('USDT', '').toUpperCase();
            const newPrice = parseFloat(data.c);
            const oldPrice = prevPricesRef.current[symbol] || newPrice;

            let dir: 'up' | 'down' | 'neutral' = 'neutral';
            if (newPrice > oldPrice) dir = 'up';
            else if (newPrice < oldPrice) dir = 'down';

            prevPricesRef.current[symbol] = newPrice;

            setLivePrices((prev) => ({
              ...prev,
              [symbol]: { price: newPrice, dir },
            }));
          } catch (e) {
            console.error('Crypto WS parse error:', e);
          }
        };

        ws.onerror = () => {
          if (isSubscribed) setWsConnected(false);
        };

        ws.onclose = () => {
          if (isSubscribed) {
            setWsConnected(false);
            reconnectTimer = setTimeout(connectWs, 5000);
          }
        };
      } catch (err) {
        if (isSubscribed) {
          setWsConnected(false);
          reconnectTimer = setTimeout(connectWs, 5000);
        }
      }
    };

    connectWs();

    return () => {
      isSubscribed = false;
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [coins]);

  const loadForexData = async (base: string) => {
    try {
      const data = await fetchForexRates(base);
      setRates(data.rates);
      setLastUpdated(data.lastUpdated);
      setSource(data.source);
    } catch (err) {
      console.error('Failed to load forex:', err);
    }
  };

  const loadCryptoData = async () => {
    try {
      const marketCoins = await fetchCryptoMarkets();
      setCoins(marketCoins);
      const initialPrices: Record<string, { price: number; dir: 'up' | 'down' | 'neutral' }> = {};
      marketCoins.forEach((c) => {
        initialPrices[c.symbol.toUpperCase()] = { price: c.current_price, dir: 'neutral' };
        prevPricesRef.current[c.symbol.toUpperCase()] = c.current_price;
      });
      setLivePrices(initialPrices);
    } catch (err) {
      console.error('Failed to load crypto:', err);
    }
  };

  const loadForexHistoryData = async (base: string, target: string, period: ForexPeriod) => {
    setLoadingHistory(true);
    try {
      const points = await fetchForexHistory(base, target, period);
      setHistoryData(points);
    } catch (err) {
      console.error('Failed to load forex history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRefreshAll = () => {
    loadForexData(baseCurrency);
    loadCryptoData();
    loadForexHistoryData(baseCurrency, targetCurrency, historyPeriod);
  };

  return (
    <div className={`min-h-screen bg-dark-bg text-slate-100 flex flex-col selection:bg-brand-500 selection:text-black ${darkMode ? 'dark' : ''}`}>
      {/* Top Live Ticker */}
      <LiveTickerBar coins={coins} />

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
            )
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
