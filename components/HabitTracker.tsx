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

  const authKey = authChecking
    ? "checking"
    : session?.user?.id || (isOfflineMode ? "offline" : "anon");

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
  } = useHabits(selectedDate, authKey);
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    addTask,
    editTask,
    removeTask,
  } = useTasks(selectedDate, authKey);
  const {
    periods: overviewPeriods,
    loading: overviewLoading,
    error: overviewError,
  } = useHabitOverview(selectedDate, habits, completedByHabit, authKey);
  const {
    periods: tradingPeriods,
    loading: tradingLoading,
    error: tradingError,
  } = useTradingOverview(selectedDate, 0, false, authKey);

  const progress =
    habits.length === 0 ? 0 : (completedCount / habits.length) * 100;

  const subtitle = useMemo(() => formatDisplayDate(selectedDate), [selectedDate]);
  const completedTasks = tasks.filter((task) => task.completed).length;

  if (authChecking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#959399]">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/60 bg-white/90 px-8 py-6 shadow-xl backdrop-blur">
          <svg
            className="h-8 w-8 animate-spin text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-sm font-bold text-slate-700">Checking authentication...</p>
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
    <main className="min-h-screen bg-[#959399] px-4 py-6 text-slate-950 sm:px-6 sm:py-10">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col gap-5 lg:max-w-7xl">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm">
                👤
              </span>
              <span className="text-xs font-bold text-slate-900">
                {session
                  ? `Logged in as: ${session.user.email?.replace("@habit-tracker.local", "")}`
                  : "Preview Mode (Local Mode)"}
              </span>
            </div>
            {session ? (
              <button
                type="button"
                onClick={() => supabase.auth.signOut()}
                className="rounded-lg border border-slate-300 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-white hover:text-rose-600"
              >
                Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOfflineMode(false)}
                className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
              >
                Sign In / Register
              </button>
            )}
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Daily Habit & Trading Tracker
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

        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
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

        <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
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
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 transition-all duration-300">
                  <span className={`inline-block transition-transform duration-300 ${habitsExpanded ? "rotate-180" : "rotate-0"}`}>
                    {habitsExpanded ? "−" : "+"}
                  </span>
                </span>
              </button>
              {habitsLoading ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  Syncing...
                </span>
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
                <div id="daily-habits-panel" className="pt-1">
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
              </div>
            </div>
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
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700 transition-all duration-300">
                  <span className={`inline-block transition-transform duration-300 ${tasksExpanded ? "rotate-180" : "rotate-0"}`}>
                    {tasksExpanded ? "−" : "+"}
                  </span>
                </span>
              </button>
              {tasksLoading ? (
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                  Syncing...
                </span>
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
                <div id="daily-tasks-panel" className="pt-1">
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
              </div>
            </div>
          </section>

          <TradingJournal selectedDate={selectedDate} authKey={authKey} />
        </div>
      </section>
    </main>
  );
}

