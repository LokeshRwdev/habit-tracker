import { Habit } from "@/lib/queries";
import { FormEvent, useState } from "react";

type HabitItemProps = {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onRename: (name: string) => boolean | Promise<boolean>;
};

export default function HabitItem({
  habit,
  completed,
  onToggle,
  onDelete,
  onRename,
}: HabitItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const renamed = await onRename(name);

    if (!renamed) {
      setError("Name is already used.");
      return;
    }

    setError("");
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-amber-200 bg-white/90 p-3 shadow-sm shadow-amber-200/50"
      >
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            className="min-w-0 flex-1 rounded-xl border border-amber-200 bg-amber-50 px-3 text-sm font-medium outline-none focus:border-orange-400 focus:bg-white"
            aria-label="Habit name"
            autoFocus
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-3 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setName(habit.name);
              setError("");
            }}
            className="rounded-xl px-3 text-sm font-medium text-slate-500 hover:bg-amber-100 hover:text-amber-950"
          >
            Cancel
          </button>
        </div>
        {error ? <p className="mt-2 px-1 text-xs text-red-500">{error}</p> : null}
      </form>
    );
  }

  return (
    <li className="group flex items-center gap-3 rounded-2xl border border-amber-200 bg-white/90 p-3 shadow-sm shadow-amber-200/50 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-orange-300 ${
          completed
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-amber-300 bg-amber-50 text-transparent hover:border-orange-400"
        }`}
        aria-pressed={completed}
        aria-label={`Mark ${habit.name} as ${completed ? "not done" : "done"}`}
      >
        <span className="text-sm font-bold">✓</span>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className={`truncate text-sm font-semibold ${
              completed ? "text-emerald-600 line-through" : "text-slate-950"
            }`}
          >
            {habit.name}
          </p>
        </div>
        <p className="mt-0.5 text-xs text-amber-700">
          {completed ? "Completed for this date" : "Open for this date"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-lg px-2 py-1 text-xs font-medium text-sky-600 hover:bg-sky-50 hover:text-sky-800"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
