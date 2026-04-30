import {
  HabitOverviewPeriod,
  OverviewPeriod,
} from "@/hooks/useHabitOverview";
import { formatShortDate } from "@/lib/date";
import { useState } from "react";

type HabitOverviewProps = {
  periods: HabitOverviewPeriod[];
  loading: boolean;
  error: string;
};

const PERIODS: OverviewPeriod[] = ["week", "month", "year"];

export default function HabitOverview({
  periods,
  loading,
  error,
}: HabitOverviewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<OverviewPeriod>("week");
  const [isExpanded, setIsExpanded] = useState(false);
  const activePeriod =
    periods.find((period) => period.period === selectedPeriod) ?? periods[0];

  return (
    <section className="rounded-2xl border border-emerald-200/80 bg-white/80 p-4 shadow-xl shadow-emerald-100/60 backdrop-blur sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-white"
          aria-expanded={isExpanded}
          aria-controls="habit-overview-panel"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              Overview
            </span>
            <span className="mt-1 block text-lg font-semibold text-slate-950">
              Habit consistency
            </span>
            <span className="mt-1 block text-sm text-slate-600">
              Completed days by habit for the selected period.
            </span>
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            {isExpanded ? "-" : "+"}
          </span>
        </button>

        {isExpanded ? (
          <div className="grid grid-cols-3 gap-1 rounded-full bg-emerald-50 p-1">
            {PERIODS.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setSelectedPeriod(period)}
                className={`rounded-full px-3 py-2 text-xs font-bold capitalize transition ${
                  selectedPeriod === period
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-emerald-800 hover:bg-white"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isExpanded ? (
        <div id="habit-overview-panel">
          {error ? (
            <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
              Loading overview...
            </p>
          ) : !activePeriod ? (
            <p className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/70 p-5 text-center text-sm font-medium text-emerald-700">
              Add habits to see weekly, monthly, and yearly progress.
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                <MetricCard
                  label={activePeriod.label}
                  value={`${activePeriod.totalCompletedDays}/${activePeriod.totalAvailableDays}`}
                  detail={`${formatPercent(activePeriod.averageRate)} complete`}
                />
                <MetricCard
                  label="Strongest"
                  value={activePeriod.strongest?.habitName ?? "No data"}
                  detail={
                    activePeriod.strongest
                      ? `${activePeriod.strongest.completedDays}/${activePeriod.strongest.totalDays} days`
                      : "Complete a habit to rank it"
                  }
                />
                <MetricCard
                  label="Weakest"
                  value={activePeriod.weakest?.habitName ?? "No data"}
                  detail={
                    activePeriod.weakest
                      ? `${activePeriod.weakest.completedDays}/${activePeriod.weakest.totalDays} days`
                      : "No active habits yet"
                  }
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Each habit
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {formatShortDate(activePeriod.startDate)} -{" "}
                    {formatShortDate(activePeriod.endDate)}
                  </p>
                </div>

                <div className="mt-3 space-y-3">
                  {activePeriod.rows.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/70 p-5 text-center text-sm font-medium text-emerald-700">
                      No habits available for this period.
                    </p>
                  ) : (
                    activePeriod.rows.map((row) => (
                      <div
                        key={row.habitId}
                        className="rounded-xl border border-emerald-100 bg-white/90 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="min-w-0 truncate text-sm font-semibold text-slate-950">
                            {row.habitName}
                          </p>
                          <p className="shrink-0 text-xs font-bold text-emerald-700">
                            {row.completedDays}/{row.totalDays} days
                          </p>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-50">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300"
                            style={{ width: `${Math.round(row.rate * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm font-medium text-emerald-700">
          Expand to see weekly, monthly, and yearly habit trends.
        </p>
      )}
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
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
        {label}
      </p>
      <p className="mt-2 truncate text-xl font-semibold text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p>
    </div>
  );
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}
