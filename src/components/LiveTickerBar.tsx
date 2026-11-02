import React from 'react';
import { Zap, Wifi, WifiOff } from 'lucide-react';
import { CryptoCoin } from '../types/crypto';
import { LivePrices } from '../hooks/useLivePrices';
interface LiveTickerBarProps {
  coins: CryptoCoin[];
  prices: LivePrices;
  connected: boolean;
}
export const LiveTickerBar: React.FC<LiveTickerBarProps> = ({ coins, prices, connected }) => {
  return (
    <div className="bg-dark-card border-b border-dark-border text-xs py-2 px-4 flex items-center justify-between overflow-hidden relative z-30">
      <div className="flex items-center space-x-2 shrink-0 pr-4 border-r border-dark-border">
        <span className="flex items-center space-x-1 font-semibold text-brand-500">
          <Zap className="w-3.5 h-3.5 fill-brand-500 animate-pulse" />
          <span>{connected ? 'BINANCE LIVE' : 'COTAÇÕES'}</span>
        </span>
        <div
          className="flex items-center space-x-1 text-slate-400"
          title={connected ? 'Conectado ao WebSocket' : 'Reconectando...'}
        >
          {connected ? (
            <span className="flex items-center space-x-1 text-brand-accent">
              <Wifi className="w-3 h-3" />
              <span className="text-[10px]">AO VIVO</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-amber-500">
              <WifiOff className="w-3 h-3" />
              <span className="text-[10px]">SEM CONEXÃO AO VIVO</span>
            </span>
          )}
        </div>
      </div>

      <div className="overflow-hidden flex-1 relative flex items-center">
        <div className="flex space-x-8 animate-ticker whitespace-nowrap">
          {coins.concat(coins).map((coin, idx) => {
            const sym = coin.symbol.toUpperCase();
            const liveData = prices[sym] || { price: coin.current_price, dir: 'neutral' };
            const isUp = liveData.dir === 'up';
            const isDown = liveData.dir === 'down';

            return (
              <div key={`${coin.symbol}-${idx}`} className="flex items-center space-x-2 font-mono">
                <span className="font-bold text-slate-300">
                  {sym}/{prices[sym] ? 'USDT' : 'USD'}
                </span>
                <span
                  className={`transition-colors duration-300 font-semibold ${
                    isUp
                      ? 'text-brand-accent bg-brand-accent/10 px-1 rounded'
                      : isDown
                        ? 'text-red-400 bg-red-400/10 px-1 rounded'
                        : 'text-slate-100'
                  }`}
                >
                  $
                  {liveData.price >= 1000
                    ? liveData.price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : liveData.price.toFixed(4)}
                </span>
                <span
                  className={`text-[10px] ${coin.price_change_percentage_24h >= 0 ? 'text-brand-accent' : 'text-red-400'}`}
                >
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
