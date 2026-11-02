import { useEffect, useState } from 'react';
import { CryptoCoin } from '../types/crypto';
export type LivePrices = Record<string, { price: number; dir: 'up' | 'down' | 'neutral' }>;
/** One connection shared by the ticker and dashboard; discard prices on disconnect. */
export function useLivePrices(coins: CryptoCoin[]) {
  const [prices, setPrices] = useState<LivePrices>({});
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    setPrices({});
    setConnected(false);
    const symbols = new Map(
      coins
        .filter((coin) => coin.binanceSymbol)
        .map((coin) => [coin.binanceSymbol.toUpperCase(), coin.symbol.toUpperCase()])
    );
    if (!symbols.size) return;
    let socket: WebSocket | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const connect = () => {
      if (disposed) return;
      try {
        const streams = [...symbols.keys()]
          .map((symbol) => symbol.toLowerCase() + '@ticker')
          .join('/');
        socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + streams);
        socket.onopen = () => {
          if (!disposed) setConnected(true);
        };
        socket.onmessage = (event) => {
          if (disposed) return;
          try {
            const { data } = JSON.parse(event.data);
            const symbol = symbols.get(data?.s);
            const price = Number(data?.c);
            if (!symbol || !Number.isFinite(price) || price <= 0) return;
            setPrices((previous) => {
              const old = previous[symbol]?.price ?? price;
              return {
                ...previous,
                [symbol]: { price, dir: price > old ? 'up' : price < old ? 'down' : 'neutral' },
              };
            });
          } catch {
            /* Ignore malformed exchange messages. */
          }
        };
        socket.onerror = () => {
          socket?.close();
        };
        socket.onclose = () => {
          if (disposed) return;
          setConnected(false);
          setPrices({});
          timer = setTimeout(connect, 5000);
        };
      } catch {
        if (!disposed) timer = setTimeout(connect, 5000);
      }
    };
    connect();
    return () => {
      disposed = true;
      clearTimeout(timer);
      socket?.close();
    };
  }, [coins]);
  return { prices, connected };
}
