"use client";

import AddHabit from "@/components/AddHabit";
import DateNavigator from "@/components/DateNavigator";
import HabitList from "@/components/HabitList";
import HabitOverview from "@/components/HabitOverview";
import TaskList from "@/components/TaskList";
import TradingJournal from "@/components/TradingJournal";
import TradingOverview from "@/components/TradingOverview";
import LoginScreen from "@/components/LoginScreen";
import { useHabitOverview } from "@/hooks/useHabitOverview";
import { useHabits } from "@/hooks/useHabits";
import { useTasks } from "@/hooks/useTasks";
import { useTradingOverview } from "@/hooks/useTradingOverview";
import { formatDisplayDate, toDateKey } from "@/lib/date";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";

export default function HabitTracker() {
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [habitsExpanded, setHabitsExpanded] = useState(true);
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sessionUserId = session?.user?.id as string | undefined;

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
  } = useHabits(selectedDate, sessionUserId);
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    addTask,
    editTask,
    removeTask,
  } = useTasks(selectedDate, sessionUserId);
  const {
    periods: overviewPeriods,
    loading: overviewLoading,
    error: overviewError,
  } = useHabitOverview(selectedDate, habits, completedByHabit);
  const {
    periods: tradingPeriods,
    loading: tradingLoading,
    error: tradingError,
    refresh: refreshTradingOverview,
  } = useTradingOverview(selectedDate);

  const progress =
    habits.length === 0 ? 0 : (completedCount / habits.length) * 100;

  const subtitle = useMemo(() => formatDisplayDate(selectedDate), [selectedDate]);
  const completedTasks = tasks.filter((task) => task.completed).length;

  if (authChecking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f1f2f4]">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#e4e6ea] bg-white px-10 py-8 shadow-sm">
          <svg
            className="h-7 w-7 animate-spin text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-80"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-sm font-semibold text-slate-600">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!session && !isOfflineMode) {
    return (
      <LoginScreen
        onSuccess={() => {}}
        onContinueOffline={() => setIsOfflineMode(true)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f1f2f4] px-4 py-6 text-slate-950 sm:px-6 sm:py-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col gap-6 lg:max-w-7xl">

        {/* Top bar */}
        <header className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e4e6ea] pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm">
                👤
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {session
                  ? session.user.email?.replace("@habit-tracker.local", "")
                  : "Preview Mode"}
              </span>
            </div>
            {session ? (
              <button
                type="button"
                onClick={() => supabase.auth.signOut()}
                className="rounded-lg border border-[#e4e6ea] bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-xs transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOfflineMode(false)}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                Daily Tracker
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {subtitle}
              </h1>
            </div>
            <div className="rounded-xl border border-[#e4e6ea] bg-white px-4 py-3 text-right shadow-xs">
              <p className="text-xl font-bold text-emerald-600">
                {completedCount}<span className="text-slate-300">/{habits.length}</span>
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">habits done</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 overflow-hidden rounded-full bg-[#e4e6ea]">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <DateNavigator
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Overview row */}
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <HabitOverview
            periods={overviewPeriods}
            loading={overviewLoading}
            error={overviewError}
          />
          <TradingOverview
            periods={tradingPeriods}
            loading={tradingLoading}
            error={tradingError}
          />
        </div>

        {/* Main 3-column grid */}
        <div className="grid gap-4 lg:grid-cols-3 lg:items-start">

          {/* Daily Habits card */}
          <section className="rounded-2xl border border-[#e4e6ea] bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-slate-300">
            <div className="flex items-center justify-between border-b border-[#e4e6ea] px-5 py-4">
              <button
                type="button"
                onClick={() => setHabitsExpanded((c) => !c)}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left focus:outline-none"
                aria-expanded={habitsExpanded}
                aria-controls="daily-habits-panel"
              >
                <span>
                  <span className="block text-sm font-bold text-slate-900">
                    Daily Habits
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-slate-400">
                    {completedCount}/{habits.length} completed
                  </span>
                </span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#e4e6ea] bg-[#f8f9fa] text-xs font-bold text-slate-500 transition-transform duration-200 ${habitsExpanded ? "rotate-180" : "rotate-0"}`}>
                  ↑
                </span>
              </button>
              {habitsLoading ? (
                <span className="ml-2 h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              ) : null}
            </div>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                habitsExpanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "pointer-events-none grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div id="daily-habits-panel" className="p-4 pt-3">
                  {habitsError ? (
                    <p className="mb-3 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-600">
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
                  <div className="mt-3">
                    <AddHabit onAdd={addHabit} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Daily Tasks card */}
          <section className="rounded-2xl border border-[#e4e6ea] bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-slate-300">
            <div className="flex items-center justify-between border-b border-[#e4e6ea] px-5 py-4">
              <button
                type="button"
                onClick={() => setTasksExpanded((c) => !c)}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left focus:outline-none"
                aria-expanded={tasksExpanded}
                aria-controls="daily-tasks-panel"
              >
                <span>
                  <span className="block text-sm font-bold text-slate-900">
                    Daily Tasks
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-slate-400">
                    {completedTasks}/{tasks.length} completed
                  </span>
                </span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#e4e6ea] bg-[#f8f9fa] text-xs font-bold text-slate-500 transition-transform duration-200 ${tasksExpanded ? "rotate-180" : "rotate-0"}`}>
                  ↑
                </span>
              </button>
              {tasksLoading ? (
                <span className="ml-2 h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
              ) : null}
            </div>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                tasksExpanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "pointer-events-none grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div id="daily-tasks-panel" className="p-4 pt-3">
                  {tasksError ? (
                    <p className="mb-3 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-600">
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
              </div>
            </div>
          </section>

          <TradingJournal
            selectedDate={selectedDate}
            onTradesChange={refreshTradingOverview}
          />
        </div>
      </section>
    </main>
  );
}
