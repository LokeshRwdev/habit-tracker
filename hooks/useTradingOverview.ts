"use client";

import {
  startOfMonthKey,
  startOfWeekKey,
  startOfYearKey,
} from "@/lib/date";
import { getTradesInRange, Trade } from "@/lib/queries";
import { calculateTradeMetrics } from "@/lib/tradingMetrics";
import { useCallback, useEffect, useMemo, useState } from "react";

export type TradingOverviewPeriod = "day" | "week" | "month" | "year";

export type TradingPeriodStats = {
  period: TradingOverviewPeriod;
  label: string;
  startDate: string;
  endDate: string;
  totalTrades: number;
  targetHits: number;
  slHits: number;
  breakEvens: number;
  winRate: number;
  totalPoints: number;
  totalPnL: number;
  trades: Trade[];
};

const PERIOD_LABELS: Record<TradingOverviewPeriod, string> = {
  day: "Today",
  week: "This week",
  month: "This month",
  year: "This year",
};

const STORAGE_KEY = "habit-tracker:trading_journal_local";

export function useTradingOverview(
  selectedDate: string,
  refreshKey: unknown = 0,
  isLocalMode: boolean = false,
) {
  const [periods, setPeriods] = useState<TradingPeriodStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ranges = useMemo(
    () => [
      {
        period: "day" as const,
        label: PERIOD_LABELS.day,
        startDate: selectedDate,
        endDate: selectedDate,
      },
      {
        period: "week" as const,
        label: PERIOD_LABELS.week,
        startDate: startOfWeekKey(selectedDate),
        endDate: selectedDate,
      },
      {
        period: "month" as const,
        label: PERIOD_LABELS.month,
        startDate: startOfMonthKey(selectedDate),
        endDate: selectedDate,
      },
      {
        period: "year" as const,
        label: PERIOD_LABELS.year,
        startDate: startOfYearKey(selectedDate),
        endDate: selectedDate,
      },
    ],
    [selectedDate],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const yearStartDate = ranges[ranges.length - 1].startDate;
      let logs: Trade[] = [];

      if (isLocalMode) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          logs = JSON.parse(stored);
        }
      } else {
        try {
          logs = await getTradesInRange(yearStartDate, selectedDate);
        } catch {
          // Fallback to local storage if table doesn't exist
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            logs = JSON.parse(stored);
          }
        }
      }

      setPeriods(
        ranges.map((range) => {
          const rangeTrades = logs.filter(
            (log) => log.date >= range.startDate && log.date <= range.endDate,
          );

          const targetHits = rangeTrades.filter(
            (t) => t.outcome === "TARGET_HIT",
          ).length;
          const slHits = rangeTrades.filter((t) => t.outcome === "SL_HIT").length;
          const breakEvens = rangeTrades.filter((t) => t.outcome === "BREAK_EVEN").length;

          const closedTrades = targetHits + slHits;
          const winRate =
            closedTrades === 0 ? 0 : (targetHits / closedTrades) * 100;

          let totalPoints = 0;
          let totalPnL = 0;
          for (const t of rangeTrades) {
            const m = calculateTradeMetrics(t);
            totalPoints += m.points;
            totalPnL += m.pnl;
          }

          return {
            ...range,
            totalTrades: rangeTrades.length,
            targetHits,
            slHits,
            breakEvens,
            winRate,
            totalPoints: Math.round(totalPoints * 100) / 100,
            totalPnL: Math.round(totalPnL * 100) / 100,
            trades: rangeTrades,
          };
        }),
      );
    } catch (fetchError) {
      if (fetchError instanceof Error) {
        setError(fetchError.message);
      } else {
        setError("Something went wrong while loading trading overview.");
      }
    } finally {
      setLoading(false);
    }
  }, [ranges, selectedDate, isLocalMode]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh, refreshKey]);

  return { periods, loading, error, refresh };
}
