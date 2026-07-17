"use client";

import TradeList from "@/components/TradeList";
import { useTradingJournal } from "@/hooks/useTradingJournal";
import { useTradingOverview } from "@/hooks/useTradingOverview";
import { formatShortDate } from "@/lib/date";
import { useMemo, useState } from "react";

type TradingJournalProps = {
  selectedDate: string;
};

export default function TradingJournal({ selectedDate }: TradingJournalProps) {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">(
    "daily",
  );

  const {
    trades,
    loading,
    error,
    isLocalMode,
    addTrade,
    editTrade,
    removeTrade,
    refreshTrigger,
  } = useTradingJournal(selectedDate);

  const { periods, loading: overviewLoading } = useTradingOverview(
    selectedDate,
    refreshTrigger,
    isLocalMode,
  );

  const weeklyPeriod = useMemo(
    () => periods.find((p) => p.period === "week"),
    [periods],
  );
  const monthlyPeriod = useMemo(
    () => periods.find((p) => p.period === "month"),
    [periods],
  );

  const targetHitToday = trades.filter((t) => t.outcome === "TARGET_HIT").length;
  const slHitToday = trades.filter((t) => t.outcome === "SL_HIT").length;
  const closedToday = targetHitToday + slHitToday;
  const todayWinRate = closedToday === 0 ? 0 : Math.round((targetHitToday / closedToday) * 100);

  return (
    <section className="rounded-xl border border-indigo-200/80 bg-indigo-50/85 p-4 shadow-lg shadow-indigo-200/50 backdrop-blur sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-indigo-50"
          aria-expanded={expanded}
          aria-controls="trading-journal-panel"
        >
          <span>
            <span className="block text-base font-semibold text-indigo-950">
              Trading Journal
            </span>
            <span className="mt-1 block text-sm text-indigo-700">
              {trades.length} trades today | {todayWinRate}% win rate
            </span>
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 transition-all duration-300">
            <span className={`inline-block transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"}`}>
              {expanded ? "−" : "+"}
            </span>
          </span>
        </button>
        <div className="flex items-center gap-1.5">
          {isLocalMode ? (
            <span
              title="Table not created yet on Supabase. Running in preview/localStorage mode."
              className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-300/60"
            >
              Preview Mode (Run SQL)
            </span>
          ) : null}
          {loading ? (
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              Syncing...
            </span>
          ) : null}
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div id="trading-journal-panel" className="pt-1">
            {error ? (
              <p className="mb-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            {/* Sub-Tabs: Daily vs Weekly Overview vs Monthly Overview */}
            <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-indigo-100/70 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("daily")}
                className={`rounded-lg py-1.5 text-xs font-bold transition ${
                  activeTab === "daily"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-indigo-900 hover:bg-white/60"
                }`}
              >
                Daily ({trades.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("weekly")}
                className={`rounded-lg py-1.5 text-xs font-bold transition ${
                  activeTab === "weekly"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-indigo-900 hover:bg-white/60"
                }`}
              >
                Weekly Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("monthly")}
                className={`rounded-lg py-1.5 text-xs font-bold transition ${
                  activeTab === "monthly"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-indigo-900 hover:bg-white/60"
                }`}
              >
                Monthly Overview
              </button>
            </div>

            {activeTab === "daily" ? (
              <TradeList
                trades={trades}
                loading={loading}
                onAdd={addTrade}
                onUpdate={editTrade}
                onDelete={removeTrade}
              />
            ) : null}

            {activeTab === "weekly" ? (
              <TimeframeStatsCard
                title="Weekly Trading Overview"
                period={weeklyPeriod}
                loading={overviewLoading}
              />
            ) : null}

            {activeTab === "monthly" ? (
              <TimeframeStatsCard
                title="Monthly Trading Overview"
                period={monthlyPeriod}
                loading={overviewLoading}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimeframeStatsCard({
  title,
  period,
  loading,
}: {
  title: string;
  period?: {
    startDate: string;
    endDate: string;
    totalTrades: number;
    targetHits: number;
    slHits: number;
    breakEvens?: number;
    winRate: number;
    trades: any[];
  };
  loading: boolean;
}) {
  if (loading || !period) {
    return (
      <div className="rounded-xl border border-indigo-200/80 bg-white/90 p-5 text-center text-sm font-medium text-indigo-700">
        Calculating timeframe performance...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-indigo-200 bg-white/95 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-indigo-950">{title}</h4>
          <span className="text-xs font-semibold text-slate-500">
            {formatShortDate(period.startDate)} -{" "}
            {formatShortDate(period.endDate)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div className="rounded-xl bg-indigo-50/80 p-2.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              Win Rate
            </p>
            <p className="mt-1 text-lg font-bold text-indigo-950">
              {Math.round(period.winRate)}%
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50/80 p-2.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              🎯 Target Hits
            </p>
            <p className="mt-1 text-lg font-bold text-emerald-950">
              {period.targetHits}
            </p>
          </div>
          <div className="rounded-xl bg-rose-50/80 p-2.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
              🛑 SL Hits
            </p>
            <p className="mt-1 text-lg font-bold text-rose-950">
              {period.slHits}
            </p>
          </div>
          <div className="rounded-xl bg-amber-50/80 p-2.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              ⚖️ Break Even
            </p>
            <p className="mt-1 text-lg font-bold text-amber-950">
              {period.breakEvens ?? 0}
            </p>
          </div>
          <div className="rounded-xl bg-slate-100/80 p-2.5 text-center sm:col-span-1 col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Total Trades
            </p>
            <p className="mt-1 text-lg font-bold text-slate-950">
              {period.totalTrades}
            </p>
          </div>
        </div>

        {/* Win Rate Progress bar */}
        {period.totalTrades > 0 ? (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-600">
              <span>🎯 Targets ({Math.round(period.winRate)}%)</span>
              <span>🛑 SL ({Math.round((period.slHits / (period.targetHits + period.slHits || 1)) * 100)}%)</span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100 shadow-inner">
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${period.winRate}%` }}
              />
              <div
                className="bg-rose-500 transition-all duration-300"
                style={{ width: `${100 - period.winRate}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <h5 className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-900">
          Trades in this timeframe ({period.trades.length})
        </h5>
        {period.trades.length === 0 ? (
          <p className="rounded-xl border border-dashed border-indigo-200 bg-white/70 p-4 text-center text-xs font-medium text-indigo-700">
            No trades logged in this timeframe yet.
          </p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {period.trades.map((trade) => (
              <li
                key={trade.id}
                className="flex items-center justify-between rounded-xl border border-indigo-100 bg-white/90 p-2.5 text-xs shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">
                      {trade.date}
                    </span>
                    {trade.symbol ? (
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-bold text-indigo-900">
                        {trade.symbol}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex gap-3 text-slate-700">
                    <span>
                      Entry: <strong className="text-slate-900">{trade.entry}</strong>
                    </span>
                    <span>
                      Exit: <strong className="text-slate-900">{trade.exit}</strong>
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  {trade.outcome === "TARGET_HIT" ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-bold text-emerald-800">
                      🎯 Target Hit
                    </span>
                  ) : trade.outcome === "SL_HIT" ? (
                    <span className="rounded-full bg-rose-100 px-2.5 py-1 font-bold text-rose-800">
                      🛑 SL Hit
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 font-bold text-amber-800">
                      ⚖️ Break Even
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
