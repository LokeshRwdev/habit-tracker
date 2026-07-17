"use client";

import { shiftDateKey } from "@/lib/date";
import {
  createTrade,
  deleteTrade,
  getTrades,
  NewTrade,
  Trade,
  TradeUpdates,
  updateTrade,
} from "@/lib/queries";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "habit-tracker:trading_journal_local";

function getSampleTrades(baseDate: string): Trade[] {
  return [
    {
      id: "sample-1",
      symbol: "NIFTY 50",
      entry: "24,550",
      exit: "24,680",
      quantity: 50,
      outcome: "TARGET_HIT",
      note: "Bullish breakout on 15m chart after morning consolidation",
      date: baseDate,
      created_at: new Date().toISOString(),
    },
    {
      id: "sample-2",
      symbol: "BANKNIFTY",
      entry: "52,100",
      exit: "51,950",
      quantity: 15,
      outcome: "SL_HIT",
      note: "Unexpected news spike at resistance zone",
      date: shiftDateKey(baseDate, -1),
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "sample-3",
      symbol: "BTC/USDT",
      entry: "64,200",
      exit: "65,500",
      outcome: "TARGET_HIT",
      note: "RSI divergence + volume confirmation on 4H",
      date: shiftDateKey(baseDate, -2),
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "sample-4",
      symbol: "ETH/USDT",
      entry: "3,450",
      exit: "3,520",
      outcome: "TARGET_HIT",
      note: "Clean retest of previous swing high",
      date: shiftDateKey(baseDate, -3),
      created_at: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: "sample-5",
      symbol: "GOLD",
      entry: "2,410",
      exit: "2,395",
      outcome: "SL_HIT",
      note: "Trailing SL hit right before FOMC minutes",
      date: shiftDateKey(baseDate, -5),
      created_at: new Date(Date.now() - 432000000).toISOString(),
    },
  ];
}

export function useTradingJournal(selectedDate: string) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTrades(selectedDate);
      setTrades(data);
      setIsLocalMode(false);
    } catch (fetchError) {
      const msg = getErrorMessage(fetchError);
      // If table doesn't exist yet or permission fails, fallback gracefully to local storage
      if (
        msg.includes("relation") ||
        msg.includes("does not exist") ||
        msg.includes("42P01") ||
        msg.includes("trading_journal") ||
        msg.includes("Failed to fetch")
      ) {
        setIsLocalMode(true);
        loadFromLocalStorage(selectedDate);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  function loadFromLocalStorage(date: string) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let allTrades: Trade[] = [];
      if (!stored) {
        allTrades = getSampleTrades(date);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allTrades));
      } else {
        allTrades = JSON.parse(stored) as Trade[];
      }
      setTrades(allTrades.filter((t) => t.date === date));
    } catch {
      setTrades([]);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh, refreshTrigger]);

  const addTrade = useCallback(
    async (trade: Omit<NewTrade, "date">) => {
      const optimisticTrade: Trade = {
        id: `optimistic-${crypto.randomUUID()}`,
        symbol: trade.symbol?.trim() || null,
        entry: trade.entry.trim(),
        exit: trade.exit.trim(),
        quantity: trade.quantity ?? 1,
        outcome: trade.outcome,
        note: trade.note?.trim() || null,
        date: selectedDate,
        created_at: new Date().toISOString(),
      };

      setTrades((current) => [...current, optimisticTrade]);
      setError("");

      if (isLocalMode) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          const allTrades: Trade[] = stored ? JSON.parse(stored) : [];
          allTrades.push(optimisticTrade);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allTrades));
          setRefreshTrigger((c) => c + 1);
          return true;
        } catch {
          return false;
        }
      }

      try {
        const created = await createTrade({
          symbol: trade.symbol?.trim() || null,
          entry: trade.entry.trim(),
          exit: trade.exit.trim(),
          quantity: trade.quantity ?? 1,
          outcome: trade.outcome,
          note: trade.note?.trim() || null,
          date: selectedDate,
        });
        setTrades((current) =>
          current.map((item) =>
            item.id === optimisticTrade.id ? created : item,
          ),
        );
        setRefreshTrigger((c) => c + 1);
        return true;
      } catch (createError) {
        const msg = getErrorMessage(createError);
        if (msg.includes("relation") || msg.includes("does not exist")) {
          setIsLocalMode(true);
          const stored = localStorage.getItem(STORAGE_KEY);
          const allTrades: Trade[] = stored ? JSON.parse(stored) : [];
          allTrades.push(optimisticTrade);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allTrades));
          setRefreshTrigger((c) => c + 1);
          return true;
        }
        setTrades((current) =>
          current.filter((item) => item.id !== optimisticTrade.id),
        );
        setError(msg);
        return false;
      }
    },
    [selectedDate, isLocalMode],
  );

  const editTrade = useCallback(
    async (id: string, updates: TradeUpdates) => {
      const previousTrades = trades;
      const nextUpdates: TradeUpdates = { ...updates };
      if (nextUpdates.symbol !== undefined) {
        nextUpdates.symbol = nextUpdates.symbol?.trim() || null;
      }
      if (nextUpdates.entry !== undefined) {
        nextUpdates.entry = nextUpdates.entry.trim();
      }
      if (nextUpdates.exit !== undefined) {
        nextUpdates.exit = nextUpdates.exit.trim();
      }
      if (nextUpdates.note !== undefined) {
        nextUpdates.note = nextUpdates.note?.trim() || null;
      }
      if (nextUpdates.quantity !== undefined && (isNaN(nextUpdates.quantity!) || nextUpdates.quantity! <= 0)) {
        nextUpdates.quantity = 1;
      }

      setTrades((current) =>
        current.map((trade) =>
          trade.id === id ? { ...trade, ...nextUpdates } : trade,
        ),
      );
      setError("");

      if (isLocalMode) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            let allTrades: Trade[] = JSON.parse(stored);
            allTrades = allTrades.map((t) =>
              t.id === id ? { ...t, ...nextUpdates } : t,
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allTrades));
          }
          setRefreshTrigger((c) => c + 1);
          return true;
        } catch {
          return false;
        }
      }

      try {
        const updated = await updateTrade(id, nextUpdates);
        setTrades((current) =>
          current.map((trade) => (trade.id === id ? updated : trade)),
        );
        setRefreshTrigger((c) => c + 1);
        return true;
      } catch (updateError) {
        setTrades(previousTrades);
        setError(getErrorMessage(updateError));
        return false;
      }
    },
    [trades, isLocalMode],
  );

  const removeTrade = useCallback(
    async (id: string) => {
      const previousTrades = trades;
      setTrades((current) => current.filter((trade) => trade.id !== id));
      setError("");

      if (isLocalMode) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            let allTrades: Trade[] = JSON.parse(stored);
            allTrades = allTrades.filter((t) => t.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allTrades));
          }
          setRefreshTrigger((c) => c + 1);
        } catch {
          setTrades(previousTrades);
        }
        return;
      }

      try {
        await deleteTrade(id);
        setRefreshTrigger((c) => c + 1);
      } catch (deleteError) {
        setTrades(previousTrades);
        setError(getErrorMessage(deleteError));
      }
    },
    [trades, isLocalMode],
  );

  return {
    trades,
    loading,
    error,
    isLocalMode,
    addTrade,
    editTrade,
    removeTrade,
    refreshTrigger,
    refresh,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong with trading journal sync.";
}
