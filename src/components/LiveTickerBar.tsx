import React, { useEffect, useState, useRef } from 'react';
import { Zap, Wifi, WifiOff } from 'lucide-react';

interface LiveTickerBarProps {
  coins: { symbol: string; current_price: number; price_change_percentage_24h: number; binanceSymbol: string }[];
  onSelectCoin?: (symbol: string) => void;
}

export const LiveTickerBar: React.FC<LiveTickerBarProps> = ({ coins }) => {
  const [tickerPrices, setTickerPrices] = useState<Record<string, { price: number; dir: 'up' | 'down' | 'neutral' }>>({});
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    // Initialize prices
    const initial: Record<string, { price: number; dir: 'up' | 'down' | 'neutral' }> = {};
    coins.forEach((c) => {
      initial[c.symbol.toUpperCase()] = { price: c.current_price, dir: 'neutral' };
      prevPricesRef.current[c.symbol.toUpperCase()] = c.current_price;
    });
    setTickerPrices(initial);

    // Setup Binance combined WebSocket stream for live ticker
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

            // e.g. BTCUSDT -> BTC
            const symbol = data.s.replace('USDT', '').toUpperCase();
            const newPrice = parseFloat(data.c);
            const oldPrice = prevPricesRef.current[symbol] || newPrice;

            let dir: 'up' | 'down' | 'neutral' = 'neutral';
            if (newPrice > oldPrice) dir = 'up';
            else if (newPrice < oldPrice) dir = 'down';

            prevPricesRef.current[symbol] = newPrice;

            setTickerPrices((prev) => ({
              ...prev,
              [symbol]: { price: newPrice, dir },
            }));
          } catch (e) {
            console.error('WS parse error:', e);
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

  return (
    <div className="bg-dark-card border-b border-dark-border text-xs py-2 px-4 flex items-center justify-between overflow-hidden relative z-30">
      <div className="flex items-center space-x-2 shrink-0 pr-4 border-r border-dark-border">
        <span className="flex items-center space-x-1 font-semibold text-brand-500">
          <Zap className="w-3.5 h-3.5 fill-brand-500 animate-pulse" />
          <span>BINANCE LIVE</span>
        </span>
        <div className="flex items-center space-x-1 text-slate-400" title={wsConnected ? 'Conectado ao WebSocket' : 'Reconectando...'}>
          {wsConnected ? (
            <span className="flex items-center space-x-1 text-brand-accent">
              <Wifi className="w-3 h-3" />
              <span className="text-[10px]">AO VIVO</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-amber-500">
              <WifiOff className="w-3 h-3" />
              <span className="text-[10px]">CONECTANDO</span>
            </span>
          )}
        </div>
      </div>

      <div className="overflow-hidden flex-1 relative flex items-center">
        <div className="flex space-x-8 animate-ticker whitespace-nowrap">
          {coins.concat(coins).map((coin, idx) => {
            const sym = coin.symbol.toUpperCase();
            const liveData = tickerPrices[sym] || { price: coin.current_price, dir: 'neutral' };
            const isUp = liveData.dir === 'up';
            const isDown = liveData.dir === 'down';

            return (
              <div key={`${coin.symbol}-${idx}`} className="flex items-center space-x-2 font-mono">
                <span className="font-bold text-slate-300">{sym}/USDT</span>
                <span
                  className={`transition-colors duration-300 font-semibold ${
                    isUp ? 'text-brand-accent bg-brand-accent/10 px-1 rounded' : isDown ? 'text-red-400 bg-red-400/10 px-1 rounded' : 'text-slate-100'
                  }`}
                >
                  ${liveData.price >= 1000 ? liveData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : liveData.price.toFixed(4)}
                </span>
                <span className={`text-[10px] ${coin.price_change_percentage_24h >= 0 ? 'text-brand-accent' : 'text-red-400'}`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
