import { supabase } from "@/lib/supabaseClient";

export type Habit = {
  id: string;
  name: string;
  created_at?: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  created_at?: string;
};

export type Task = {
  id: string;
  title: string;
  note: string | null;
  date: string;
  completed: boolean;
  created_at?: string;
};

export type NewTask = {
  title: string;
  note?: string | null;
  date: string;
};

export type TaskUpdates = Partial<Pick<Task, "title" | "note" | "completed">>;

export async function getHabits() {
  const { data, error } = await supabase
    .from("habits")
    .select("id, name, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data satisfies Habit[];
}

export async function createHabit(name: string) {
  const { data, error } = await supabase
    .from("habits")
    .insert({ name })
    .select("id, name, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data satisfies Habit;
}

export async function updateHabit(id: string, name: string) {
  const { data, error } = await supabase
    .from("habits")
    .update({ name })
    .eq("id", id)
    .select("id, name, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data satisfies Habit;
}

export async function deleteHabit(id: string) {
  const { error } = await supabase.from("habits").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getHabitLogs(date: string) {
  const { data, error } = await supabase
    .from("habit_logs")
    .select("id, habit_id, date, completed, created_at")
    .eq("date", date);

  if (error) {
    throw error;
  }

  return data satisfies HabitLog[];
}

export async function getHabitLogsInRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("habit_logs")
    .select("id, habit_id, date, completed, created_at")
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) {
    throw error;
  }

  return data satisfies HabitLog[];
}

export async function toggleHabit(
  habit_id: string,
  date: string,
  completed: boolean,
) {
  const { data, error } = await supabase
    .from("habit_logs")
    .upsert(
      {
        habit_id,
        date,
        completed,
      },
      { onConflict: "habit_id,date" },
    )
    .select("id, habit_id, date, completed, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data satisfies HabitLog;
}

export async function getTasks(date: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, note, date, completed, created_at")
    .lte("date", date)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data.filter((task) => task.date === date || !task.completed) satisfies
    Task[];
}

export async function createTask(task: NewTask) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: task.title,
      note: task.note ?? null,
      date: task.date,
    })
    .select("id, title, note, date, completed, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data satisfies Task;
}

export async function updateTask(id: string, updates: TaskUpdates) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select("id, title, note, date, completed, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data satisfies Task;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export type TradeOutcome = "TARGET_HIT" | "SL_HIT" | "BREAK_EVEN";

export type Trade = {
  id: string;
  symbol?: string | null;
  entry: string;
  exit: string;
  outcome: TradeOutcome;
  note?: string | null;
  date: string;
  created_at?: string;
};

export type NewTrade = {
  symbol?: string | null;
  entry: string;
  exit: string;
  outcome: TradeOutcome;
  note?: string | null;
  date: string;
};

export type TradeUpdates = Partial<
  Pick<Trade, "symbol" | "entry" | "exit" | "outcome" | "note">
>;

export async function getTrades(date: string) {
  const { data, error } = await supabase
    .from("trading_journal")
    .select("id, symbol, entry, exit, outcome, note, date, created_at")
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data satisfies Trade[];
}

export async function getTradesInRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("trading_journal")
    .select("id, symbol, entry, exit, outcome, note, date, created_at")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data satisfies Trade[];
}

export async function createTrade(trade: NewTrade) {
  const { data, error } = await supabase
    .from("trading_journal")
    .insert({
      symbol: trade.symbol ?? null,
      entry: trade.entry,
      exit: trade.exit,
      outcome: trade.outcome,
      note: trade.note ?? null,
      date: trade.date,
    })
    .select("id, symbol, entry, exit, outcome, note, date, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data satisfies Trade;
}

export async function updateTrade(id: string, updates: TradeUpdates) {
  const { data, error } = await supabase
    .from("trading_journal")
    .update(updates)
    .eq("id", id)
    .select("id, symbol, entry, exit, outcome, note, date, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data satisfies Trade;
}

export async function deleteTrade(id: string) {
  const { error } = await supabase
    .from("trading_journal")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}

