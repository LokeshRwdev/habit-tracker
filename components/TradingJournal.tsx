"use client";

import TradeList from "@/components/TradeList";
import { useTradingJournal } from "@/hooks/useTradingJournal";
import { useTradingOverview } from "@/hooks/useTradingOverview";
import { formatShortDate } from "@/lib/date";
import { calculateTradeMetrics, formatCurrency, formatPoints } from "@/lib/tradingMetrics";
import { useEffect, useMemo, useState } from "react";

type TradingJournalProps = {
  selectedDate: string;
  onTradesChange?: () => void;
};

export default function TradingJournal({ selectedDate, onTradesChange }: TradingJournalProps) {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">(
    "daily",
  );
  const [showConfig, setShowConfig] = useState(false);
  const [lossLimit, setLossLimit] = useState<number>(5000);
  const [targetLimit, setTargetLimit] = useState<number>(10000);
  const [killSwitchActive, setKillSwitchActive] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedLimits = localStorage.getItem("habit-tracker:trading_daily_limits");
      if (storedLimits) {
        const parsed = JSON.parse(storedLimits);
        if (typeof parsed.loss === "number") setLossLimit(parsed.loss);
        if (typeof parsed.target === "number") setTargetLimit(parsed.target);
      }
      const ks = localStorage.getItem(`habit-tracker:kill_switch_${selectedDate}`);
      setKillSwitchActive(ks === "true");
    } catch { }
  }, [selectedDate]);

  function handleSaveLimits(newLoss: number, newTarget: number) {
    setLossLimit(newLoss);
    setTargetLimit(newTarget);
    try {
      localStorage.setItem("habit-tracker:trading_daily_limits", JSON.stringify({ loss: newLoss, target: newTarget }));
    } catch { }
  }

  function toggleKillSwitch(status: boolean) {
    setKillSwitchActive(status);
    try {
      localStorage.setItem(`habit-tracker:kill_switch_${selectedDate}`, status ? "true" : "false");
    } catch { }
  }

  const {
    trades,
    loading,
    error,
    isLocalMode,
    addTrade: addTradeBase,
    editTrade: editTradeBase,
    removeTrade: removeTradeBase,
    refreshTrigger,
  } = useTradingJournal(selectedDate);

  // Wrap mutations so parent overview also refreshes
  async function addTrade(trade: Parameters<typeof addTradeBase>[0]) {
    const result = await addTradeBase(trade);
    if (result) onTradesChange?.();
    return result;
  }
  async function editTrade(id: string, updates: Parameters<typeof editTradeBase>[1]) {
    const result = await editTradeBase(id, updates);
    if (result) onTradesChange?.();
    return result;
  }
  function removeTrade(id: string) {
    removeTradeBase(id);
    onTradesChange?.();
  }

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

  const todayPnL = useMemo(() => {
    return trades.reduce((acc, t) => acc + calculateTradeMetrics(t).pnl, 0);
  }, [trades]);

  const isLossLimitReached = lossLimit > 0 && todayPnL <= -Math.abs(lossLimit);
  const isTargetLimitReached = targetLimit > 0 && todayPnL >= Math.abs(targetLimit);
  const isLimitReached = isLossLimitReached || isTargetLimitReached;

  return (
    <section className="rounded-2xl border border-[#e4e6ea] bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e4e6ea] px-5 py-4">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left focus:outline-none"
          aria-expanded={expanded}
          aria-controls="trading-journal-panel"
        >
          <span>
            <span className="block text-sm font-bold text-slate-900">
              Trading Journal
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-400">{trades.length} trades today · {todayWinRate}% win rate</span>
              <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${todayPnL < 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                {formatCurrency(todayPnL)}
              </span>
            </span>
          </span>
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#e4e6ea] bg-[#f8f9fa] text-xs font-bold text-slate-500 transition-transform duration-200 ${expanded ? "rotate-180" : "rotate-0"}`}>
            ↑
          </span>
        </button>
        <div className="ml-2 flex items-center gap-1.5">
          {isLocalMode ? (
            <span
              title="Running in localStorage preview mode."
              className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700"
            >
              Local
            </span>
          ) : null}
          {loading ? (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
          ) : null}
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${expanded
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="overflow-hidden">
          <div id="trading-journal-panel" className="p-4 pt-3">
            {error ? (
              <p className="mb-3 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-600">
                {error}
              </p>
            ) : null}

            {/* Kill Switch Signal Banner */}
            {killSwitchActive ? (
              <div className="mb-4 rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/80 p-3.5 sm:p-4 shadow-md">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white shadow-md">
                      🛡️
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <h4 className="text-sm font-extrabold text-emerald-950 tracking-tight sm:text-base">
                          Kill Switch Activated
                        </h4>
                        <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-xs font-bold text-emerald-950">
                          Locked: {formatCurrency(todayPnL)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-emerald-900/90">
                        Confirmed activated in your broker app for today! Your capital and daily performance are safe. Step away and enjoy disciplined trading.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleKillSwitch(false)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white py-2 px-3 text-xs font-bold text-emerald-800 shadow-xs transition hover:bg-emerald-50"
                  >
                    <span>🔓 Deactivate Kill Switch if needed</span>
                  </button>
                </div>
              </div>
            ) : isLimitReached ? (
              <div className="mb-4 rounded-2xl border-2 border-rose-500 bg-gradient-to-br from-rose-50 via-amber-50/50 to-rose-100/80 p-3.5 sm:p-4 shadow-lg animate-pulse">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-lg text-white shadow-md">
                      🚨
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <h4 className="text-sm font-extrabold text-rose-950 tracking-tight sm:text-base">
                          {isLossLimitReached ? "Daily Max Loss Reached!" : "Daily Target Achieved!"}
                        </h4>
                        <span className="rounded-full bg-rose-200/80 px-2.5 py-0.5 text-xs font-bold text-rose-950">
                          Current: {formatCurrency(todayPnL)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs font-semibold leading-relaxed text-rose-900/90">
                        {isLossLimitReached ? (
                          <>You have reached your daily loss threshold of <strong className="font-bold text-rose-950">-{formatCurrency(lossLimit)}</strong>. Stop trading right now to protect your capital and discipline!</>
                        ) : (
                          <>You hit your daily profit target of <strong className="font-bold text-rose-950">{formatCurrency(targetLimit)}</strong>. Excellent discipline! Lock in your profits and stop trading today.</>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleKillSwitch(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 py-2.5 px-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-rose-600/30 transition hover:from-rose-700 hover:to-red-700 active:scale-[0.99]"
                  >
                    <span>🔒 Activate Kill Switch & Confirm Done</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Sub-Tabs: Daily vs Weekly vs Monthly + Limits Config */}
            <div className="mb-4 flex flex-col gap-2.5">
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-indigo-100/70 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("daily")}
                  className={`rounded-lg py-1.5 text-xs font-bold transition ${activeTab === "daily"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-indigo-900 hover:bg-white/60"
                    }`}
                >
                  Daily ({trades.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("weekly")}
                  className={`rounded-lg py-1.5 text-xs font-bold transition ${activeTab === "weekly"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-indigo-900 hover:bg-white/60"
                    }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("monthly")}
                  className={`rounded-lg py-1.5 text-xs font-bold transition ${activeTab === "monthly"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-indigo-900 hover:bg-white/60"
                    }`}
                >
                  Monthly
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowConfig((c) => !c)}
                className="flex items-center justify-between rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-900 shadow-xs hover:bg-indigo-50/80 transition"
              >
                <span className="flex items-center gap-1.5">
                  <span>⚙️ Daily Risk & Profit Limits</span>
                </span>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  -₹{lossLimit} / +₹{targetLimit}
                </span>
              </button>
            </div>

            {/* Limits Config Box */}
            {showConfig ? (
              <div className="mb-4 rounded-xl border border-indigo-200 bg-white/95 p-3.5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                    Configure Daily Risk & Target Limits
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowConfig(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Max Daily Loss Limit (₹ / Points)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={lossLimit}
                      onChange={(e) => handleSaveLimits(Number(e.target.value) || 0, targetLimit)}
                      className="mt-1 h-9 w-full rounded-lg border border-indigo-200 bg-indigo-50/40 px-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-400 focus:bg-white"
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Daily Profit Target Limit (₹ / Points)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={targetLimit}
                      onChange={(e) => handleSaveLimits(lossLimit, Number(e.target.value) || 0)}
                      className="mt-1 h-9 w-full rounded-lg border border-indigo-200 bg-indigo-50/40 px-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-400 focus:bg-white"
                      placeholder="e.g. 10000"
                    />
                  </div>
                </div>
              </div>
            ) : null}

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

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6">
          <div className="rounded-xl bg-indigo-50/90 p-2.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              Net PnL
            </p>
            <p className={`mt-1 text-base sm:text-lg font-bold ${(period as any).totalPnL < 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {formatCurrency((period as any).totalPnL || 0)}
            </p>
          </div>
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
          <div className="rounded-xl bg-slate-100/80 p-2.5 text-center">
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
            {period.trades.map((trade) => {
              const m = calculateTradeMetrics(trade);
              return (
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
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-slate-700">
                      <span>Entry: <strong className="text-slate-900">{trade.entry}</strong></span>
                      <span>Exit: <strong className="text-slate-900">{trade.exit}</strong></span>
                      <span>Qty: <strong className="text-slate-900">{m.qty}</strong></span>
                      <span>PnL: <strong className={m.pnl < 0 ? "text-rose-600" : "text-emerald-600"}>{formatCurrency(m.pnl)}</strong></span>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
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
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
