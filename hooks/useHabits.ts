"use client";

import {
  createHabit,
  deleteHabit,
  getHabitLogs,
  getHabits,
  Habit,
  toggleHabit,
  updateHabit,
} from "@/lib/queries";
import { useCallback, useEffect, useMemo, useState } from "react";

type CompletedByHabit = Record<string, boolean>;

export function useHabits(selectedDate: string) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedByHabit, setCompletedByHabit] = useState<CompletedByHabit>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [nextHabits, logs] = await Promise.all([
        getHabits(),
        getHabitLogs(selectedDate),
      ]);

      setHabits(nextHabits);
      setCompletedByHabit(
        Object.fromEntries(logs.map((log) => [log.habit_id, log.completed])),
      );
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  const completedCount = useMemo(
    () => habits.filter((habit) => completedByHabit[habit.id]).length,
    [completedByHabit, habits],
  );

  const addHabit = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return true;
      }

      const duplicate = habits.some(
        (habit) => habit.name.toLowerCase() === trimmedName.toLowerCase(),
      );

      if (duplicate) {
        return false;
      }

      const optimisticHabit: Habit = {
        id: `optimistic-${crypto.randomUUID()}`,
        name: trimmedName,
      };

      setHabits((current) => [...current, optimisticHabit]);
      setError("");

      try {
        const created = await createHabit(trimmedName);
        setHabits((current) =>
          current.map((habit) =>
            habit.id === optimisticHabit.id ? created : habit,
          ),
        );
        return true;
      } catch (createError) {
        setHabits((current) =>
          current.filter((habit) => habit.id !== optimisticHabit.id),
        );
        setError(getErrorMessage(createError));
        return false;
      }
    },
    [habits],
  );

  const renameHabit = useCallback(
    async (habitId: string, name: string) => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return false;
      }

      const duplicate = habits.some(
        (habit) =>
          habit.id !== habitId &&
          habit.name.toLowerCase() === trimmedName.toLowerCase(),
      );

      if (duplicate) {
        return false;
      }

      const previousHabits = habits;

      setHabits((current) =>
        current.map((habit) =>
          habit.id === habitId ? { ...habit, name: trimmedName } : habit,
        ),
      );
      setError("");

      try {
        const updated = await updateHabit(habitId, trimmedName);
        setHabits((current) =>
          current.map((habit) => (habit.id === habitId ? updated : habit)),
        );
        return true;
      } catch (updateError) {
        setHabits(previousHabits);
        setError(getErrorMessage(updateError));
        return false;
      }
    },
    [habits],
  );

  const removeHabit = useCallback(
    async (habitId: string) => {
      const previousHabits = habits;
      const previousCompleted = completedByHabit;

      setHabits((current) => current.filter((habit) => habit.id !== habitId));
      setCompletedByHabit((current) => {
        const next = { ...current };
        delete next[habitId];
        return next;
      });
      setError("");

      try {
        await deleteHabit(habitId);
      } catch (deleteError) {
        setHabits(previousHabits);
        setCompletedByHabit(previousCompleted);
        setError(getErrorMessage(deleteError));
      }
    },
    [completedByHabit, habits],
  );

  const toggleHabitForDate = useCallback(
    async (habitId: string) => {
      const completed = !completedByHabit[habitId];
      const previousCompleted = completedByHabit;

      setCompletedByHabit((current) => ({
        ...current,
        [habitId]: completed,
      }));
      setError("");

      try {
        await toggleHabit(habitId, selectedDate, completed);
      } catch (toggleError) {
        setCompletedByHabit(previousCompleted);
        setError(getErrorMessage(toggleError));
      }
    },
    [completedByHabit, selectedDate],
  );

  return {
    habits,
    completedByHabit,
    completedCount,
    loading,
    error,
    addHabit,
    renameHabit,
    removeHabit,
    toggleHabit: toggleHabitForDate,
    refresh,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while syncing habits.";
}
