"use client";

import {
  daysBetweenInclusive,
  fromDateKey,
  startOfMonthKey,
  startOfWeekKey,
  startOfYearKey,
  toDateKey,
} from "@/lib/date";
import { getHabitLogsInRange, Habit } from "@/lib/queries";
import { useCallback, useEffect, useMemo, useState } from "react";

export type OverviewPeriod = "week" | "month" | "year";

export type HabitOverviewRow = {
  habitId: string;
  habitName: string;
  completedDays: number;
  totalDays: number;
  rate: number;
};

export type HabitOverviewPeriod = {
  period: OverviewPeriod;
  label: string;
  startDate: string;
  endDate: string;
  totalCompletedDays: number;
  totalAvailableDays: number;
  averageRate: number;
  strongest: HabitOverviewRow | null;
  weakest: HabitOverviewRow | null;
  rows: HabitOverviewRow[];
};

const PERIOD_LABELS: Record<OverviewPeriod, string> = {
  week: "This week",
  month: "This month",
  year: "This year",
};

export function useHabitOverview(
  selectedDate: string,
  habits: Habit[],
  refreshKey: unknown,
  authKey: string = "anon",
) {
  const [periods, setPeriods] = useState<HabitOverviewPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ranges = useMemo(
    () => [
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
    if (authKey === "checking") {
      return;
    }
    setLoading(true);
    setError("");

    try {
      const yearStartDate = ranges[ranges.length - 1].startDate;
      const logs = await getHabitLogsInRange(yearStartDate, selectedDate);
      const completedLogs = logs.filter((log) => log.completed);

      setPeriods(
        ranges.map((range) => {
          const rows = habits.map((habit) => {
            const habitStartDate = getHabitStartDate(habit, range.startDate);
            const totalDays =
              habitStartDate > range.endDate
                ? 0
                : daysBetweenInclusive(habitStartDate, range.endDate);
            const completedDays = completedLogs.filter(
              (log) =>
                log.habit_id === habit.id &&
                log.date >= habitStartDate &&
                log.date <= range.endDate,
            ).length;

            return {
              habitId: habit.id,
              habitName: habit.name,
              completedDays,
              totalDays,
              rate: totalDays === 0 ? 0 : completedDays / totalDays,
            };
          });

          let strongest: HabitOverviewRow | null = null;
          let weakest: HabitOverviewRow | null = null;

          rows.forEach((row) => {
            if (row.totalDays === 0) {
              return;
            }
            if (!strongest || row.rate > strongest.rate) {
              strongest = row;
            }
            if (!weakest || row.rate < weakest.rate) {
              weakest = row;
            }
          });

          const totalAvailableDays = rows.reduce(
            (sum, row) => sum + row.totalDays,
            0,
          );
          const totalCompletedDays = rows.reduce(
            (sum, row) => sum + row.completedDays,
            0,
          );

          return {
            period: range.period,
            label: range.label,
            startDate: range.startDate,
            endDate: range.endDate,
            totalCompletedDays,
            totalAvailableDays,
            averageRate:
              totalAvailableDays === 0
                ? 0
                : totalCompletedDays / totalAvailableDays,
            strongest,
            weakest,
            rows,
          };
        }),
      );
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setLoading(false);
    }
  }, [habits, ranges, selectedDate, authKey]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh, refreshKey]);

  return { periods, loading, error, refresh };
}

function getHabitStartDate(habit: Habit, periodStartDate: string) {
  if (!habit.created_at) {
    return periodStartDate;
  }

  const createdDate = toDateKey(fromDateKey(habit.created_at.slice(0, 10)));

  return createdDate > periodStartDate ? createdDate : periodStartDate;
}

function getStrongestHabit(rows: HabitOverviewRow[]) {
  return [...rows].sort(
    (first, second) =>
      second.rate - first.rate || second.completedDays - first.completedDays,
  )[0] ?? null;
}

function getWeakestHabit(rows: HabitOverviewRow[]) {
  return [...rows].sort(
    (first, second) =>
      first.rate - second.rate || first.completedDays - second.completedDays,
  )[0] ?? null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while loading overview.";
}
