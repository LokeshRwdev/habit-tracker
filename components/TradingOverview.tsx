"use client";

import {
  TradingOverviewPeriod,
  TradingPeriodStats,
} from "@/hooks/useTradingOverview";
import { formatShortDate } from "@/lib/date";
import { formatCurrency, formatPoints } from "@/lib/tradingMetrics";
import { useMemo, useState } from "react";

type TradingOverviewProps = {
  periods: TradingPeriodStats[];
  loading: boolean;
  error: string;
};

const PERIODS: TradingOverviewPeriod[] = ["day", "week", "month", "year"];

export default function TradingOverview({
  periods,
  loading,
  error,
}: TradingOverviewProps) {
  const [selectedPeriod, setSelectedPeriod] =
    useState<TradingOverviewPeriod>("week");
  const [isExpanded, setIsExpanded] = useState(false);
  const activePeriod =
    periods.find((period) => period.period === selectedPeriod) ?? periods[0];

  const dailyPeriod = useMemo(() => periods.find((p) => p.period === "day"), [periods]);
  const weeklyPeriod = useMemo(() => periods.find((p) => p.period === "week"), [periods]);
  const monthlyPeriod = useMemo(() => periods.find((p) => p.period === "month"), [periods]);

  return (
    <section className="rounded-2xl border border-[#e4e6ea] bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-white"
          aria-expanded={isExpanded}
          aria-controls="trading-overview-panel"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
              Overview
            </span>
            <span className="mt-1 block text-lg font-semibold text-slate-950">
              Trading performance
            </span>
            <span className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <span className={`rounded-md px-2 py-0.5 border ${dailyPeriod && dailyPeriod.totalPnL < 0 ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
                Daily PnL: {formatCurrency(dailyPeriod?.totalPnL ?? 0)}
              </span>
              <span className={`rounded-md px-2 py-0.5 border ${weeklyPeriod && weeklyPeriod.totalPnL < 0 ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
                Wk: {formatCurrency(weeklyPeriod?.totalPnL ?? 0)}
              </span>
              <span className={`rounded-md px-2 py-0.5 border ${monthlyPeriod && monthlyPeriod.totalPnL < 0 ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
                Mo: {formatCurrency(monthlyPeriod?.totalPnL ?? 0)}
              </span>
            </span>
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 transition-all duration-300">
            <span className={`inline-block transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}>
              {isExpanded ? "−" : "+"}
            </span>
          </span>
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isExpanded
              ? "grid-rows-[1fr] opacity-100"
              : "pointer-events-none grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-4 gap-1 rounded-full bg-indigo-50 p-1">
              {PERIODS.map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setSelectedPeriod(period)}
                  className={`rounded-full px-3 py-2 text-xs font-bold capitalize transition ${
                    selectedPeriod === period
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-indigo-800 hover:bg-white"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isExpanded
            ? "mt-4 grid-rows-[1fr] opacity-100"
            : "mt-0 grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div id="trading-overview-panel">
            {error ? (
              <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            {loading ? (
              <p className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm font-medium text-indigo-700">
                Loading trading overview...
              </p>
            ) : !activePeriod ? (
              <p className="mt-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/70 p-5 text-center text-sm font-medium text-indigo-700">
                Log trades to see weekly, monthly, and yearly trading trends.
              </p>
            ) : (
              <div className="mt-5 space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <MetricCard
                    label={`${activePeriod.label} PnL`}
                    value={formatCurrency(activePeriod.totalPnL || 0)}
                    detail={`${formatPoints(activePeriod.totalPoints || 0)} captured`}
                  />
                  <MetricCard
                    label={activePeriod.label}
                    value={`${activePeriod.totalTrades} trades`}
                    detail={`${Math.round(activePeriod.winRate)}% Win Rate`}
                  />
                  <MetricCard
                    label="Outcomes"
                    value={`${activePeriod.targetHits} Target / ${activePeriod.slHits} SL / ${activePeriod.breakEvens || 0} BE`}
                    detail="Targets vs SL vs Break Even"
                  />
                  <MetricCard
                    label="Win Ratio"
                    value={`${Math.round(activePeriod.winRate)}%`}
                    detail={
                      activePeriod.winRate >= 60
                        ? "🔥 High Accuracy"
                        : activePeriod.winRate >= 45
                        ? "⚡ Balanced"
                        : "📈 Refining strategy"
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Trade distribution
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {formatShortDate(activePeriod.startDate)} -{" "}
                      {formatShortDate(activePeriod.endDate)}
                    </p>
                  </div>

                  {activePeriod.trades.length === 0 ? (
                    <p className="mt-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/70 p-5 text-center text-sm font-medium text-indigo-700">
                      No trades logged for this timeframe.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {/* Summary bar */}
                      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                        <div
                          className="bg-emerald-500 transition-all duration-500"
                          style={{
                            width: `${
                              (activePeriod.targetHits / activePeriod.totalTrades) *
                              100
                            }%`,
                          }}
                          title={`Targets: ${activePeriod.targetHits}`}
                        />
                        <div
                          className="bg-amber-500 transition-all duration-500"
                          style={{
                            width: `${
                              ((activePeriod.breakEvens || 0) / activePeriod.totalTrades) *
                              100
                            }%`,
                          }}
                          title={`Break Even: ${activePeriod.breakEvens || 0}`}
                        />
                        <div
                          className="bg-rose-500 transition-all duration-500"
                          style={{
                            width: `${
                              (activePeriod.slHits / activePeriod.totalTrades) *
                              100
                            }%`,
                          }}
                          title={`SL: ${activePeriod.slHits}`}
                        />
                      </div>

                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span className="text-emerald-700">
                          🎯 Targets: {activePeriod.targetHits}
                        </span>
                        <span className="text-amber-700">
                          ⚖️ BE: {activePeriod.breakEvens || 0}
                        </span>
                        <span className="text-rose-700">
                          🛑 SL Hits: {activePeriod.slHits}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          !isExpanded
            ? "mt-3 grid-rows-[1fr] opacity-100"
            : "pointer-events-none mt-0 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-indigo-700">
            Expand to see weekly, monthly, and yearly trading win rate & stats.
          </p>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
        {label}
      </p>
      <p className="mt-2 truncate text-xl font-semibold text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p>
    </div>
  );
}
