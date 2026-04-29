"use client";

import {
  createTask,
  deleteTask,
  getTasks,
  NewTask,
  Task,
  TaskUpdates,
  updateTask,
} from "@/lib/queries";
import { useCallback, useEffect, useState } from "react";

export function useTasks(selectedDate: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setTasks(await getTasks(selectedDate));
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

  const addTask = useCallback(
    async (task: Omit<NewTask, "date">) => {
      const title = task.title.trim();
      const note = task.note?.trim() || null;

      if (!title) {
        return false;
      }

      const optimisticTask: Task = {
        id: `optimistic-${crypto.randomUUID()}`,
        title,
        note,
        date: selectedDate,
        completed: false,
      };

      setTasks((current) => [...current, optimisticTask]);
      setError("");

      try {
        const created = await createTask({ title, note, date: selectedDate });
        setTasks((current) =>
          current.map((item) =>
            item.id === optimisticTask.id ? created : item,
          ),
        );
        return true;
      } catch (createError) {
        setTasks((current) =>
          current.filter((item) => item.id !== optimisticTask.id),
        );
        setError(getErrorMessage(createError));
        return false;
      }
    },
    [selectedDate],
  );

  const editTask = useCallback(
    async (id: string, updates: TaskUpdates) => {
      const previousTasks = tasks;
      const nextUpdates: TaskUpdates = {};

      if (updates.title !== undefined) {
        nextUpdates.title = updates.title.trim();
      }

      if (updates.note !== undefined) {
        nextUpdates.note =
          typeof updates.note === "string" ? updates.note.trim() || null : null;
      }

      if (updates.completed !== undefined) {
        nextUpdates.completed = updates.completed;
      }

      setTasks((current) =>
        current.map((task) =>
          task.id === id ? { ...task, ...nextUpdates } : task,
        ),
      );
      setError("");

      try {
        const updated = await updateTask(id, nextUpdates);
        setTasks((current) =>
          current.map((task) => (task.id === id ? updated : task)),
        );
        return true;
      } catch (updateError) {
        setTasks(previousTasks);
        setError(getErrorMessage(updateError));
        return false;
      }
    },
    [tasks],
  );

  const removeTask = useCallback(
    async (id: string) => {
      const previousTasks = tasks;

      setTasks((current) => current.filter((task) => task.id !== id));
      setError("");

      try {
        await deleteTask(id);
      } catch (deleteError) {
        setTasks(previousTasks);
        setError(getErrorMessage(deleteError));
      }
    },
    [tasks],
  );

  return {
    tasks,
    loading,
    error,
    addTask,
    editTask,
    removeTask,
    refresh,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while syncing tasks.";
}
