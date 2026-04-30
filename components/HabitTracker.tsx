"use client";

import AddHabit from "@/components/AddHabit";
import DateNavigator from "@/components/DateNavigator";
import HabitList from "@/components/HabitList";
import HabitOverview from "@/components/HabitOverview";
import TaskList from "@/components/TaskList";
import { useHabitOverview } from "@/hooks/useHabitOverview";
import { useHabits } from "@/hooks/useHabits";
import { useTasks } from "@/hooks/useTasks";
import { formatDisplayDate, toDateKey } from "@/lib/date";
import { useMemo, useState } from "react";

export default function HabitTracker() {
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [habitsExpanded, setHabitsExpanded] = useState(true);
  const [tasksExpanded, setTasksExpanded] = useState(true);

  const {
    habits,
    completedByHabit,
    completedCount,
    loading: habitsLoading,
    error: habitsError,
    addHabit,
    renameHabit,
    removeHabit,
    toggleHabit,
  } = useHabits(selectedDate);
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    addTask,
    editTask,
    removeTask,
  } = useTasks(selectedDate);
  const {
    periods: overviewPeriods,
    loading: overviewLoading,
    error: overviewError,
  } = useHabitOverview(selectedDate, habits, completedByHabit);

  const progress =
    habits.length === 0 ? 0 : (completedCount / habits.length) * 100;

  const subtitle = useMemo(() => formatDisplayDate(selectedDate), [selectedDate]);
  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fff7ed_0%,#fef3c7_34%,#ecfeff_68%,#eef2ff_100%)] px-4 py-6 text-slate-950 sm:px-6 sm:py-10">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col gap-5 lg:max-w-5xl">
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Daily Habit Tracker
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                {subtitle}
              </h1>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-right shadow-lg shadow-orange-200/40 backdrop-blur">
              <p className="text-2xl font-semibold text-emerald-700">
                {completedCount}/{habits.length}
              </p>
              <p className="text-xs font-semibold text-slate-500">habits done</p>
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/70 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <DateNavigator
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <HabitOverview
          periods={overviewPeriods}
          loading={overviewLoading}
          error={overviewError}
        />

        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          <section className="rounded-xl border border-amber-200/80 bg-amber-50/85 p-4 shadow-lg shadow-amber-200/50 backdrop-blur sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setHabitsExpanded((current) => !current)}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-amber-50"
                aria-expanded={habitsExpanded}
                aria-controls="daily-habits-panel"
              >
                <span>
                  <span className="block text-base font-semibold text-amber-950">
                    Daily Habits
                  </span>
                  <span className="mt-1 block text-sm text-amber-700">
                    {completedCount}/{habits.length} completed
                  </span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                  {habitsExpanded ? "-" : "+"}
                </span>
              </button>
              {habitsLoading ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  Syncing...
                </span>
              ) : null}
            </div>

            {habitsExpanded ? (
              <div id="daily-habits-panel">
                {habitsError ? (
                  <p className="mb-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                    {habitsError}
                  </p>
                ) : null}

                <HabitList
                  habits={habits}
                  completedByHabit={completedByHabit}
                  onToggle={toggleHabit}
                  onDelete={removeHabit}
                  onRename={renameHabit}
                />

                <div className="mt-4">
                  <AddHabit onAdd={addHabit} />
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-sky-200/80 bg-cyan-50/85 p-4 shadow-lg shadow-sky-200/50 backdrop-blur sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setTasksExpanded((current) => !current)}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-cyan-50"
                aria-expanded={tasksExpanded}
                aria-controls="daily-tasks-panel"
              >
                <span>
                  <span className="block text-base font-semibold text-sky-950">
                    Daily Tasks
                  </span>
                  <span className="mt-1 block text-sm text-sky-700">
                    {completedTasks}/{tasks.length} completed
                  </span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                  {tasksExpanded ? "-" : "+"}
                </span>
              </button>
              {tasksLoading ? (
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                  Syncing...
                </span>
              ) : null}
            </div>

            {tasksExpanded ? (
              <div id="daily-tasks-panel">
                {tasksError ? (
                  <p className="mb-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                    {tasksError}
                  </p>
                ) : null}

                <TaskList
                  tasks={tasks}
                  loading={tasksLoading}
                  onAdd={addTask}
                  onUpdate={editTask}
                  onDelete={removeTask}
                />
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
